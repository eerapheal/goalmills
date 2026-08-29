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

## Docker & Render.com Deployment

### Method 1: Render CLI / Blueprint (Recommended)

This repository includes a [render.yaml](../../render.yaml) blueprint configured for `services/mailer`.

1. Install Render CLI:
   ```bash
   npm install -g @render/cli
   ```
2. Login with your API key:
   ```bash
   render login
   ```
3. Deploy the service:
   ```bash
   render blueprint launch
   ```

### Method 2: Render Web Service via Git

1. Connect your repository in Render Dashboard.
2. Choose **Web Service** -> **Docker**.
3. Set:
   - **Root Directory**: `services/mailer`
   - **Dockerfile Path**: `./Dockerfile` (or root `dockerContext: ./services/mailer`)
   - **Health Check Path**: `/health`
4. Configure required SMTP and cron environment variables in Render settings.
