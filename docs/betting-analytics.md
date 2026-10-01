# GoalMills Betting Intelligence Analytics & Telemetry

**Role:** CTO & Principal Software Architect, GoalMills  
**Status:** Approved & Implemented  

---

## 1. Event Telemetry Pipeline

The GoalMills Betting Telemetry Pipeline tracks user engagement while strictly respecting user privacy:

Supported Event Taxonomy:
- `odds_viewed`: User expanded or viewed an odds comparison table.
- `bookmaker_viewed`: Individual bookmaker quote displayed.
- `best_odds_viewed`: Highlighted top quote interacted with.
- `bet_now_clicked`: User clicked an outbound bookmaker CTA.
- `affiliate_redirected`: Server successfully processed outbound redirect.
- `scanner_opened`: Universal Bet Scanner initialized.
- `scan_completed`: Multi-bookmaker comparison generated.
- `bet_analyzed`: AI risk assessment requested and rendered.
- `bet_decoded`: Bet code successfully parsed.
- `bet_converted`: Slip converted between two bookmakers.
- `bet_trimmed`: High-risk leg eliminated from accumulator.
- `bet_edited`: Custom odds recalculation performed.
- `slip_saved`: Slip stored in user vault.
- `slip_shared`: Public share link generated or viewed.
- `odds_alert_created`: Price alert configured.
- `odds_alert_triggered`: Price threshold met and notification dispatched.

---

## 2. High-Throughput Storage & TTL

- High-frequency telemetry events are buffered and written to `BettingAnalyticsEvent` in MongoDB.
- An automatic **90-day TTL index** (`{ createdAt: 1 }, { expireAfterSeconds: 7776000 }`) automatically purges historical records, preserving database performance and adhering to data minimization standards.
