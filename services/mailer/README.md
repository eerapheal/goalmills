# GoalMills Enterprise Go Mailer Microservice

High-performance, concurrent newsletter mailing microservice and 10:00 AM WAT cron scheduler for GoalMills Sports Media.

## Architecture

- **Goroutine Worker Pool**: Concurrent non-blocking batch dispatching with rate limiting.
- **Automated 10:00 AM WAT Scheduler**:
  - Daily: Breaking News + Editor's Picks
  - Weekly (Mondays): Most Read of the Week
  - Monthly (1st of month): Monthly Highlights & Top Engagement
- **HTML MIME Templates**: Responsive mobile email layout with tracking and 1-click unsubscribe.
- **REST API**:
  - `POST /api/dispatch`: Queues batch email campaigns for delivery.
  - `GET /health`: Health metrics & worker pool stats.

## Environment Variables

```env
PORT=8085
SMTP_HOST=smtp.sendgrid.net (or AWS SES, Mailgun, Resend)
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-api-key
SMTP_FROM_EMAIL=newsletter@goalmills.com
SMTP_FROM_NAME="GoalMills Sports Media"
NEXT_PUBLIC_SITE_URL=https://goalmills-web.vercel.app
CRON_SECRET=your_secure_cron_secret
```

## Running Locally

```bash
cd services/mailer
go run ./cmd/server/main.go
```
