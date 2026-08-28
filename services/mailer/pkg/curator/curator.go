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
