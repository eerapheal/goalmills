# GoalMills Betting & Affiliate REST API Reference

**Role:** CTO & Principal Software Architect, GoalMills  
**Status:** Approved & Implemented  

---

## 1. Public & Core Endpoints

### 1.1 Events & Odds
- `GET /api/v1/events/:eventId/odds`
  - Returns complete normalized odds comparison matrix for an event across all bookmakers.
  - Query parameters: `format` (`decimal` | `fractional` | `american`), `homeTeam`, `awayTeam`, `sport`.
- `GET /api/v1/events/:eventId/best-odds`
  - Returns the objective best odds quote and bookmaker per market selection.
- `GET /api/v1/events/:eventId/odds/history`
  - Returns historical quote snapshots and opening prices.

### 1.2 Bookmakers & Directory
- `GET /api/v1/bookmakers`
  - Returns all registered canonical bookmakers with metadata, logos, and licensing info.
- `GET /api/v1/bookmakers/:id`
  - Returns details and active affiliate program for a specific bookmaker.

### 1.3 Betting Intelligence Tools
- `POST /api/v1/betting/scan`
  - Decodes a booking code from any bookmaker and returns matching odds across 10+ operators.
- `POST /api/v1/betting/decode`
  - Extracts individual legs and selections from a booking code.
- `POST /api/v1/betting/analyze`
  - Evaluates risk score (0–100), key vulnerabilities, and win probabilities.
- `POST /api/v1/betting/convert`
  - Converts a bet slip from one bookmaker to another.
- `POST /api/v1/betting/trim`
  - Identifies and suggests removal of high-risk legs to achieve a target risk profile.
- `POST /api/v1/betting/edit`
  - Recalculates accumulator odds and estimated win probabilities following leg edits.

### 1.4 Bet Slip Saver & Public Sharing
- `GET /api/v1/betting/slips`
  - Lists saved slips for the authenticated user.
- `POST /api/v1/betting/slips`
  - Saves a new or modified bet slip; returns a unique nano publicId.
- `GET /api/v1/betting/slips/:id`
  - Retrieves a specific slip for the owner.
- `PATCH /api/v1/betting/slips/:id`
  - Renames, archives, or toggles public visibility.
- `DELETE /api/v1/betting/slips/:id`
  - Deletes a saved slip.
- `GET /api/v1/betting/slips/public/:publicId`
  - Publicly accessible, sanitized bet slip summary with OpenGraph card metadata. Excludes user PII.

### 1.5 Odds Alerts
- `POST /api/v1/betting/alerts`
  - Subscribes user to a price threshold alert for an event and selection.
- `GET /api/v1/betting/alerts`
  - Lists active user alerts.
- `DELETE /api/v1/betting/alerts/:id`
  - Cancels an alert.

### 1.6 Affiliate Redirection
- `GET /api/v1/affiliate/redirect/:bookmaker` & `GET /api/affiliate/redirect/:bookmaker`
  - Validates operator, checks rate limits, registers non-PII click telemetry, generates dynamic tracking template with `{click_id}`, and issues HTTP 307 temporary redirect.

---

## 2. Admin API Endpoints

- `GET /api/v1/admin/affiliate/programs`: List all bookmaker affiliate programs.
- `POST /api/v1/admin/affiliate/programs`: Create a new affiliate configuration.
- `PATCH /api/v1/admin/affiliate/programs/:id`: Update tracking template or status.
- `GET /api/v1/admin/affiliate/clicks`: Query raw click telemetry logs.
- `GET /api/v1/admin/affiliate/conversions`: Query confirmed affiliate conversions.
- `GET /api/v1/admin/affiliate/revenue`: Aggregated revenue report (Clicks, Registrations, First Deposits, CPA, RevShare).
- `GET /api/v1/admin/affiliate/intelligence`: High-level commercial analytics overview.
