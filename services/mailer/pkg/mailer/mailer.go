package mailer

import (
	"bytes"
	"context"
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"strings"
	"time"
)

// Config holds SMTP & service configuration
type Config struct {
	Host        string
	Port        string
	Username    string
	Password    string
	FromEmail   string
	FromName    string
	SiteURL     string
	IsSandboxed bool
}

// LoadConfigFromEnv reads environment settings
func LoadConfigFromEnv() Config {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	if port == "" {
		port = "587"
	}
	fromEmail := os.Getenv("SMTP_FROM_EMAIL")
	if fromEmail == "" {
		fromEmail = "hayeswaya@gmail.com"
	}
	fromName := os.Getenv("SMTP_FROM_NAME")
	if fromName == "" {
		fromName = "GoalMills Sports Media"
	}
	siteURL := os.Getenv("NEXT_PUBLIC_SITE_URL")
	if siteURL == "" {
		siteURL = "https://goalmills-web.vercel.app"
	}

	return Config{
		Host:        host,
		Port:        port,
		Username:    os.Getenv("SMTP_USER"),
		Password:    os.Getenv("SMTP_PASSWORD"),
		FromEmail:   fromEmail,
		FromName:    fromName,
		SiteURL:     siteURL,
		IsSandboxed: host == "",
	}
}

// Mailer manages email dispatching
type Mailer struct {
	cfg Config
}

// NewMailer creates a new Mailer instance
func NewMailer(cfg Config) *Mailer {
	return &Mailer{cfg: cfg}
}

// SendRawEmail constructs RFC 2822 MIME headers and transmits via SMTP
func (m *Mailer) SendRawEmail(ctx context.Context, to, subject, htmlBody, unsubscribeToken string) error {
	if m.cfg.IsSandboxed {
		// Mock delivery in local sandbox environment
		time.Sleep(time.Millisecond * 30)
		return nil
	}

	fromHeader := fmt.Sprintf("%s <%s>", m.cfg.FromName, m.cfg.FromEmail)
	unsubURL := fmt.Sprintf("%s/newsletter/unsubscribe?token=%s", m.cfg.SiteURL, unsubscribeToken)

	var buf bytes.Buffer
	buf.WriteString(fmt.Sprintf("From: %s\r\n", fromHeader))
	buf.WriteString(fmt.Sprintf("To: %s\r\n", to))
	buf.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	buf.WriteString("MIME-Version: 1.0\r\n")
	buf.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
	buf.WriteString("X-Mailer: GoalMills-Go-Mailer/2.0\r\n")
	buf.WriteString("Precedence: bulk\r\n")
	buf.WriteString(fmt.Sprintf("List-Unsubscribe: <%s>\r\n", unsubURL))
	buf.WriteString(fmt.Sprintf("List-Unsubscribe-Post: List-Unsubscribe=One-Click\r\n"))
	buf.WriteString(fmt.Sprintf("Date: %s\r\n", time.Now().Format(time.RFC1123Z)))
	buf.WriteString("\r\n")
	buf.WriteString(htmlBody)

	addr := fmt.Sprintf("%s:%s", m.cfg.Host, m.cfg.Port)
	auth := smtp.PlainAuth("", m.cfg.Username, m.cfg.Password, m.cfg.Host)

	// Direct TLS for port 465 or STARTTLS for port 587
	if strings.TrimSpace(m.cfg.Port) == "465" {
		tlsConfig := &tls.Config{
			ServerName: m.cfg.Host,
		}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("tls dial error: %w", err)
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, m.cfg.Host)
		if err != nil {
			return fmt.Errorf("smtp client error: %w", err)
		}
		defer client.Close()

		if err = client.Auth(auth); err != nil {
			return fmt.Errorf("auth error: %w", err)
		}
		if err = client.Mail(m.cfg.FromEmail); err != nil {
			return fmt.Errorf("mail from error: %w", err)
		}
		if err = client.Rcpt(to); err != nil {
			return fmt.Errorf("rcpt error: %w", err)
		}

		w, err := client.Data()
		if err != nil {
			return fmt.Errorf("data error: %w", err)
		}
		_, err = w.Write(buf.Bytes())
		if err != nil {
			return fmt.Errorf("write error: %w", err)
		}
		return w.Close()
	}

	// Standard STARTTLS
	return smtp.SendMail(addr, auth, m.cfg.FromEmail, []string{to}, buf.Bytes())
}
