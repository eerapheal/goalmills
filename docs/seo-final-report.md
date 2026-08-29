# GoalMills — Production SEO & Structured Data Report

**Date:** 2026-08-29  
**Version:** 3.0.0  

---

## 1. Discovery & Indexing Architecture

### 1.1 Dynamic XML Sitemap (`/sitemap.xml`)
- Generated dynamically via Next.js metadata route `apps/web/src/app/sitemap.ts`.
- Automatically streams all published, non-deleted news articles (`/news/[id]`) and video highlights (`/highlights/[id]`).
- Includes static hubs (`/`, `/docs`) with appropriate priority (`1.0` for home, `0.8` for news, `0.7` for highlights).

### 1.2 Robots Configuration (`/robots.txt`)
- Allows public web crawlers full access to editorial and sports data.
- Explicitly blocks administrative routes (`/admin/`), internal APIs (`/api/`), and build assets (`/_next/`).
- Declares canonical sitemap reference: `Sitemap: https://goalmills.com/sitemap.xml`.

---

## 2. Schema.org JSON-LD Structured Data

1. **Organization & WebSite Schema (`RootLayout`)**:
   - Declares `GoalMills Sports Intelligence` with canonical URL, logo, and social authority links.
2. **NewsArticle Schema (`/news/[id]`)**:
   - Declares headline, author, publisher, datePublished, dateModified, image URL, and articleBody preview.
3. **VideoObject Schema (`/highlights/[id]`)**:
   - Declares video title, thumbnail, upload date, and description for Google Video SERP indexing.

---

## 3. Dynamic OpenGraph & Social Sharing

- Every dynamic page (`/news/[id]`, `/highlights/[id]`, `/football/[slug]`) injects unique `title`, `description`, `canonical`, `og:image`, `og:type`, and `twitter:card`.
