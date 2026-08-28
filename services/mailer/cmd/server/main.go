package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/goalmills/mailer/pkg/curator"
	"github.com/goalmills/mailer/pkg/mailer"
	"github.com/goalmills/mailer/pkg/worker"
	"github.com/robfig/cron/v3"
)

type DispatchRequest struct {
	CampaignID    string                `json:"campaignId"`
	Subject       string                `json:"subject"`
	PreviewText   string                `json:"previewText"`
	EditorialNote string                `json:"editorialNote"`
	Frequency     string                `json:"frequency"` // Daily, Weekly, Monthly, Special Broadcast
	Articles      []curator.ArticleItem `json:"articles"`
	Recipients    []Recipient           `json:"recipients"`
}

type Recipient struct {
	Email            string `json:"email"`
	UnsubscribeToken string `json:"unsubscribeToken"`
}

type DispatchResponse struct {
	Success     bool   `json:"success"`
	QueuedCount int    `json:"queuedCount"`
	Message     string `json:"message"`
}

func main() {
	cfg := mailer.LoadConfigFromEnv()
	mailClient := mailer.NewMailer(cfg)

	// High concurrency pool: 25 workers, 10,000 buffer, 50 emails/sec
	pool := worker.NewWorkerPool(25, 10000, 50)
	pool.Start()
	defer pool.Stop()

	// Initialize Robfig Cron for 10:00 AM Local Time (WAT / UTC+1)
	c := cron.New(cron.WithLocation(time.FixedZone("WAT", 3600))) // UTC+1 WAT

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
		stats := pool.GetStats()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":      "ok",
			"service":     "goalmills-mailer",
			"activeWorkers": stats.ActiveWorkers,
			"totalSent":   stats.TotalSent,
			"totalFailed": stats.TotalFailed,
			"totalQueued": stats.TotalQueued,
			"time":        time.Now().Format(time.RFC3339),
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

			job := worker.EmailJob{
				To:               rec.Email,
				Subject:          req.Subject,
				HTMLBody:         html,
				UnsubscribeToken: rec.UnsubscribeToken,
				CampaignID:       req.CampaignID,
				MaxRetries:       3,
				SendFunc: func(ctx context.Context, j worker.EmailJob) error {
					return mailClient.SendRawEmail(ctx, j.To, j.Subject, j.HTMLBody, j.UnsubscribeToken)
				},
			}

			if pool.Submit(job) {
				queuedCount++
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(DispatchResponse{
			Success:     true,
			QueuedCount: queuedCount,
			Message:     fmt.Sprintf("Successfully queued %d emails for delivery", queuedCount),
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
