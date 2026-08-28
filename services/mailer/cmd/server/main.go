package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/goalmills/mailer/pkg/bounce"
	"github.com/goalmills/mailer/pkg/curator"
	"github.com/goalmills/mailer/pkg/mailer"
	"github.com/goalmills/mailer/pkg/queue"
	"github.com/robfig/cron/v3"
)

type DispatchRequest struct {
	CampaignID    string                `json:"campaignId"`
	Subject       string                `json:"subject"`
	PreviewText   string                `json:"previewText"`
	EditorialNote string                `json:"editorialNote"`
	Frequency     string                `json:"frequency"` // Daily, Weekly, Monthly, Special Broadcast
	IsHighPriority bool                 `json:"isHighPriority"`
	Articles      []curator.ArticleItem `json:"articles"`
	Recipients    []Recipient           `json:"recipients"`
}

type Recipient struct {
	Email            string `json:"email"`
	UnsubscribeToken string `json:"unsubscribeToken"`
	RecipientID      string `json:"recipientId"`
}

type DispatchResponse struct {
	Success     bool   `json:"success"`
	QueuedCount int    `json:"queuedCount"`
	Message     string `json:"message"`
}

func main() {
	cfg := mailer.LoadConfigFromEnv()
	mailClient := mailer.NewMailer(cfg)

	// Priority-aware queue with 25 concurrent domain workers
	pqManager := queue.NewPriorityQueueManager(25, 2000, 10000)
	pqManager.Start()
	defer pqManager.Stop()

	// Initialize Robfig Cron for 10:00 AM Local Time (WAT / UTC+1)
	c := cron.New(cron.WithLocation(time.FixedZone("WAT", 3600)))

	// Daily 10:00 AM: "0 10 * * *"
	_, err := c.AddFunc("0 10 * * *", func() {
		log.Println("[Cron] 10:00 AM WAT Daily Newsletter Trigger fired")
		triggerCronWebhook("daily")
	})
	if err != nil {
		log.Printf("[Cron] Error registering daily cron: %v", err)
	}

	// Weekly (Every Monday 10:00 AM): "0 10 * * 1"
	_, err = c.AddFunc("0 10 * * 1", func() {
		log.Println("[Cron] 10:00 AM WAT Weekly Newsletter Trigger fired")
		triggerCronWebhook("weekly")
	})
	if err != nil {
		log.Printf("[Cron] Error registering weekly cron: %v", err)
	}

	// Monthly (1st of month 10:00 AM): "0 10 1 * *"
	_, err = c.AddFunc("0 10 1 * *", func() {
		log.Println("[Cron] 10:00 AM WAT Monthly Newsletter Trigger fired")
		triggerCronWebhook("monthly")
	})
	if err != nil {
		log.Printf("[Cron] Error registering monthly cron: %v", err)
	}

	c.Start()
	defer c.Stop()
	log.Println("[Cron] Scheduled Daily, Weekly, and Monthly newsletter cron jobs for 10:00 AM WAT")

	// HTTP API Router
	mux := http.NewServeMux()

	// Health & Telemetry
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":            "ok",
			"service":           "goalmills-mailer-enterprise",
			"architecture":      "Audience-Intelligence & Deliverability-Gate",
			"domainRateLimiting": true,
			"priorityQueuing":   true,
			"time":              time.Now().Format(time.RFC3339),
		})
	})

	// Dispatch Batch Email
	mux.HandleFunc("POST /api/dispatch", func(w http.ResponseWriter, r *http.Request) {
		var req DispatchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, fmt.Sprintf("invalid payload: %v", err), http.StatusBadRequest)
			return
		}

		if len(req.Recipients) == 0 {
			http.Error(w, "no recipients provided", http.StatusBadRequest)
			return
		}

		priority := queue.PriorityNormal
		if req.IsHighPriority {
			priority = queue.PriorityHigh
		}

		queuedCount := 0
		for _, rec := range req.Recipients {
			unsubURL := fmt.Sprintf("%s/newsletter/unsubscribe?token=%s", cfg.SiteURL, rec.UnsubscribeToken)
			html, err := curator.RenderHTML(curator.NewsletterData{
				Subject:        req.Subject,
				PreviewText:    req.PreviewText,
				EditorialNote:  req.EditorialNote,
				Frequency:      req.Frequency,
				Articles:       req.Articles,
				SiteURL:        cfg.SiteURL,
				UnsubscribeURL: unsubURL,
			})
			if err != nil {
				log.Printf("[Dispatch] Template render error: %v", err)
				continue
			}

			task := queue.EmailTask{
				ID:               fmt.Sprintf("%s-%s", req.CampaignID, rec.Email),
				To:               rec.Email,
				Subject:          req.Subject,
				HTMLBody:         html,
				UnsubscribeToken: rec.UnsubscribeToken,
				CampaignID:       req.CampaignID,
				RecipientID:      rec.RecipientID,
				Priority:         priority,
				Attempt:          1,
				SendFunc: func(ctx context.Context, t queue.EmailTask) error {
					return mailClient.SendRawEmail(ctx, t.To, t.Subject, t.HTMLBody, t.UnsubscribeToken)
				},
				OnSuccess: func(t queue.EmailTask) {
					forwardEventToWebhook("delivered", t.To, t.CampaignID, t.RecipientID, nil)
				},
				OnFailure: func(t queue.EmailTask, analysis bounce.BounceAnalysis) {
					eventType := "soft_bounce"
					if analysis.Type == bounce.BounceTypeHard {
						eventType = "hard_bounce"
					}
					forwardEventToWebhook(eventType, t.To, t.CampaignID, t.RecipientID, map[string]any{
						"reason":      analysis.Reason,
						"isPermanent": analysis.IsPermanent,
					})
				},
			}

			if pqManager.Submit(task) {
				queuedCount++
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(DispatchResponse{
			Success:     true,
			QueuedCount: queuedCount,
			Message:     fmt.Sprintf("Successfully queued %d emails with domain traffic shaping", queuedCount),
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		log.Printf("[Server] GoalMills Enterprise Go Mailer running on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[Server] Failed to listen: %v", err)
		}
	}()

	// Graceful shutdown listener
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Println("[Server] Shutting down gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	server.Shutdown(ctx)
}

func forwardEventToWebhook(eventType, email, campaignID, recipientID string, metadata map[string]any) {
	siteURL := os.Getenv("NEXT_PUBLIC_SITE_URL")
	if siteURL == "" {
		siteURL = "http://localhost:3000"
	}

	eventID := fmt.Sprintf("evt_%d_%s_%s", time.Now().UnixNano(), eventType, email)
	payload := map[string]any{
		"eventId":     eventID,
		"email":       email,
		"eventType":   eventType,
		"provider":    "go_mailer",
		"campaignId":  campaignID,
		"recipientId": recipientID,
		"metadata":    metadata,
		"timestamp":   time.Now().Format(time.RFC3339),
	}

	body, _ := json.Marshal(payload)
	go func() {
		client := &http.Client{Timeout: 5 * time.Second}
		_, _ = client.Post(fmt.Sprintf("%s/api/webhooks/mailer", siteURL), "application/json", bytes.NewBuffer(body))
	}()
}

func triggerCronWebhook(frequency string) {
	siteURL := os.Getenv("NEXT_PUBLIC_SITE_URL")
	if siteURL == "" {
		siteURL = "http://localhost:3000"
	}
	cronSecret := os.Getenv("CRON_SECRET")

	url := fmt.Sprintf("%s/api/cron/newsletter?frequency=%s", siteURL, frequency)
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		log.Printf("[CronWebhook] Error creating request: %v", err)
		return
	}
	if cronSecret != "" {
		req.Header.Set("Authorization", "Bearer "+cronSecret)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[CronWebhook] Failed to trigger Next.js cron webhook for %s: %v", frequency, err)
		return
	}
	defer resp.Body.Close()
	log.Printf("[CronWebhook] Next.js cron responded with status %d for %s", resp.StatusCode, frequency)
}
