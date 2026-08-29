package curator

import (
	"bytes"
	"html/template"
	"time"
)

// ArticleItem represents a curated news post for email
type ArticleItem struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	Slug       string `json:"slug"`
	Excerpt    string `json:"excerpt"`
	Image      string `json:"image"`
	Category   string `json:"category"`
	Sport      string `json:"sport"`
	ReadTime   int    `json:"readTime"`
	IsBreaking bool   `json:"isBreaking"`
	IsFeatured bool   `json:"isFeatured"`
	Views      int    `json:"views"`
	Author     string `json:"author"`
	URL        string `json:"url"`
}

// NewsletterData holds context for rendering HTML newsletter templates
type NewsletterData struct {
	Subject          string
	PreviewText      string
	EditorialNote    string
	Frequency        string // Daily, Weekly, Monthly, Special Broadcast
	FormattedDate    string
	Articles         []ArticleItem
	TopStory         *ArticleItem
	SiteURL          string
	UnsubscribeURL   string
	Year             int
}

const NewsletterHTMLTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{.Subject}}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #070b1e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; }
    .container { max-width: 620px; margin: 0 auto; padding: 24px 16px; }
    .header { text-align: center; padding: 28px 0 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .brand-logo { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: #ffffff; text-decoration: none; }
    .brand-accent { color: #f59e0b; }
    .pill { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); margin-top: 10px; }
    .editorial-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; margin: 24px 0; font-size: 13px; line-height: 1.6; color: #cbd5e1; }
    .card { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; overflow: hidden; margin-bottom: 20px; text-decoration: none; display: block; color: inherit; }
    .card-img { width: 100%; height: 220px; object-fit: cover; background-color: #1e293b; display: block; }
    .card-content { padding: 18px; }
    .badge-breaking { background: #ef4444; color: #ffffff; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; display: inline-block; margin-bottom: 8px; }
    .badge-featured { background: #8b5cf6; color: #ffffff; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; display: inline-block; margin-bottom: 8px; }
    .card-title { font-size: 17px; font-weight: 800; line-height: 1.35; margin: 0 0 8px; color: #ffffff; }
    .card-excerpt { font-size: 13px; line-height: 1.5; color: #94a3b8; margin: 0 0 12px; }
    .card-meta { font-size: 11px; font-weight: 700; color: #f59e0b; }
    .btn { display: inline-block; background: #f59e0b; color: #020617; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 20px; border-radius: 12px; text-decoration: none; margin-top: 10px; }
    .footer { text-align: center; padding: 32px 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #64748b; line-height: 1.6; }
    .unsub-link { color: #f59e0b; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <a href="{{.SiteURL}}" class="brand-logo">Goal<span class="brand-accent">Mills</span></a>
      <div><span class="pill">{{.Frequency}} Digest • {{.FormattedDate}}</span></div>
    </div>

    <!-- Editorial Note (Optional) -->
    {{if .EditorialNote}}
    <div class="editorial-box">
      <strong>Newsroom Brief:</strong> {{.EditorialNote}}
    </div>
    {{end}}

    <!-- Articles Feed -->
    <div style="margin-top: 24px;">
      {{range .Articles}}
      <a href="{{.URL}}" class="card">
        {{if .Image}}
        <img src="{{.Image}}" alt="{{.Title}}" class="card-img" />
        {{end}}
        <div class="card-content">
          {{if .IsBreaking}}
          <span class="badge-breaking">⚡ Breaking News</span>
          {{else if .IsFeatured}}
          <span class="badge-featured">⭐ Editor's Pick</span>
          {{end}}
          <h2 class="card-title">{{.Title}}</h2>
          <p class="card-excerpt">{{.Excerpt}}</p>
          <div class="card-meta">
            {{.Category}} • {{.ReadTime}} min read &rarr; Read Story
          </div>
        </div>
      </a>
      {{end}}
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{.SiteURL}}" class="btn">Explore All Matchday Highlights &rarr;</a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© {{.Year}} GoalMills Sports Media. All rights reserved.</p>
      <p>You received this digest because you subscribed to GoalMills {{.Frequency}} News.</p>
      <p><a href="{{.UnsubscribeURL}}" class="unsub-link">Unsubscribe or Update Preferences</a></p>
    </div>
  </div>
</body>
</html>`

// RenderHTML produces a compiled, responsive HTML newsletter string
func RenderHTML(data NewsletterData) (string, error) {
	if data.Year == 0 {
		data.Year = time.Now().Year()
	}
	if data.FormattedDate == "" {
		data.FormattedDate = time.Now().Format("January 02, 2006")
	}

	tmpl, err := template.New("newsletter").Parse(NewsletterHTMLTemplate)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// ConfirmationData holds parameters for the subscription confirmation email
type ConfirmationData struct {
	SubscriberEmail    string
	Frequency          string
	Categories         []string
	ConfirmationURL    string
	UnsubscribeURL     string
	SiteURL            string
	EditorPicks        []ArticleItem
	RequireDoubleOptIn bool
	FormattedDate      string
	Year               int
}

const ConfirmationHTMLTemplate = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Subscription Confirmation - GoalMills Sports</title>
</head>
<body style="margin:0;padding:0;background-color:#050814;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;line-height:1.5;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#050814;">
    <tr>
      <td align="center" style="padding:24px 12px 36px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:#090e21;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
          <tr>
            <td height="4" style="background:linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%);"></td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.06);background:#070b1a;">
              <a href="{{.SiteURL}}" style="text-decoration:none;">
                <span style="font-size:28px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;color:#ffffff;">
                  GOAL<span style="color:#f59e0b;">MILLS</span>
                </span>
              </a>
              <div style="margin-top:8px;">
                <span style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:10px;font-weight:800;text-transform:uppercase;background:rgba(245,158,11,0.12);color:#fbbf24;border:1px solid rgba(245,158,11,0.3);">
                  ⚽ SPORTS INTELLIGENCE • {{.FormattedDate}}
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <div style="width:52px;height:52px;line-height:52px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.4);border-radius:50%;text-align:center;font-size:24px;display:inline-block;color:#f59e0b;">
                      ✓
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;">
                      {{if .RequireDoubleOptIn}}Confirm Your Subscription{{else}}You're Subscribed! Welcome to GoalMills{{end}}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;max-width:480px;">
                      {{if .RequireDoubleOptIn}}Please click the button below to verify your email address and start receiving daily 10:00 AM WAT sports intelligence.{{else}}Your subscription to GoalMills {{.Frequency}} Sports Alerts is now active. Enjoy breaking transfer scoops, match stats, and tactical insights.{{end}}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background:#f59e0b;border-radius:12px;box-shadow:0 8px 20px -4px rgba(245,158,11,0.4);">
                          <a href="{{if .RequireDoubleOptIn}}{{.ConfirmationURL}}{{else}}{{.SiteURL}}{{end}}" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:900;color:#050814;text-decoration:none;text-transform:uppercase;letter-spacing:0.06em;">
                            {{if .RequireDoubleOptIn}}Confirm Subscription Now &rarr;{{else}}Explore Match Centre & News &rarr;{{end}}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
                      <tr>
                        <td style="font-size:12px;color:#94a3b8;font-weight:600;padding-bottom:6px;">Subscriber:</td>
                        <td align="right" style="font-size:12px;color:#ffffff;font-weight:700;padding-bottom:6px;">{{.SubscriberEmail}}</td>
                      </tr>
                      <tr>
                        <td style="font-size:12px;color:#94a3b8;font-weight:600;">Delivery Tier:</td>
                        <td align="right" style="font-size:12px;color:#fbbf24;font-weight:700;">{{.Frequency}} Digest (@ 10:00 AM WAT)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 28px 16px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;">
                    <span style="font-size:12px;font-weight:900;text-transform:uppercase;color:#f59e0b;display:block;margin-bottom:4px;">
                      ⭐ EDITOR'S PICKS
                    </span>
                    <h2 style="margin:0;font-size:18px;font-weight:800;color:#ffffff;">
                      Two Stories Hand-Picked For You
                    </h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 16px;">
              {{range .EditorPicks}}
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:18px;background:#0d1527;border:1px solid rgba(245,158,11,0.22);border-radius:14px;overflow:hidden;">
                {{if .Image}}
                <tr>
                  <td><a href="{{.URL}}"><img src="{{.Image}}" alt="{{.Title}}" width="100%" style="width:100%;height:180px;object-fit:cover;display:block;background-color:#1e293b;" /></a></td>
                </tr>
                {{end}}
                <tr>
                  <td style="padding:16px 18px;">
                    <span style="display:inline-block;padding:3px 8px;border-radius:6px;background:{{if .IsBreaking}}#ef4444{{else}}#8b5cf6{{end}};color:#ffffff;font-size:10px;font-weight:900;text-transform:uppercase;">
                      {{if .IsBreaking}}⚡ Breaking{{else}}⭐ Editor's Pick{{end}}
                    </span>
                    <span style="color:#94a3b8;font-size:11px;font-weight:600;margin-left:6px;">• {{.Category}}</span>
                    <h3 style="margin:10px 0 8px;font-size:16px;font-weight:800;">
                      <a href="{{.URL}}" style="color:#ffffff;text-decoration:none;">{{.Title}}</a>
                    </h3>
                    <p style="margin:0 0 12px;color:#94a3b8;font-size:13px;line-height:1.5;">{{.Excerpt}}</p>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" style="color:#64748b;font-size:11px;">⏱ {{.ReadTime}} min read</td>
                        <td align="right"><a href="{{.URL}}" style="color:#f59e0b;text-decoration:none;font-size:12px;font-weight:800;">Read Story &rarr;</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              {{end}}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;background:#050812;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0 0 4px;font-size:16px;font-weight:900;color:#ffffff;">GOAL<span style="color:#f59e0b;">MILLS</span></p>
              <p style="margin:0 0 10px;font-size:11px;color:#64748b;">GoalMills Sports Media • All Rights Reserved © {{.Year}}</p>
              <p style="margin:0;font-size:11px;">
                <a href="{{.UnsubscribeURL}}" style="color:#f59e0b;text-decoration:underline;">1-Click Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

// RenderConfirmationHTML produces the HTML template for subscriber confirmations
func RenderConfirmationHTML(data ConfirmationData) (string, error) {
	if data.Year == 0 {
		data.Year = time.Now().Year()
	}
	if data.FormattedDate == "" {
		data.FormattedDate = time.Now().Format("January 02, 2006")
	}

	tmpl, err := template.New("confirmation").Parse(ConfirmationHTMLTemplate)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

