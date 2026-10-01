# GoalMills Affiliate Engine Specification

**Role:** CTO & Principal Software Architect, GoalMills  
**Status:** Approved & Implemented  

---

## 1. Overview & Business Mechanics

The GoalMills Affiliate Engine monetizes sports intelligence traffic through transparent, high-converting bookmaker affiliate integration.

Supported Commission Models:
1. **CPA (Cost Per Acquisition):** Fixed commission paid when a user registers or executes an initial deposit.
2. **RevShare (Revenue Share):** Percentage of net gaming revenue generated over a customer lifetime.
3. **Hybrid:** Baseline CPA plus a scaled RevShare percentage.
4. **Sponsored / Fixed Placement:** Flat-rate commercial placement badges with guaranteed exposure.

---

## 2. Tracking URL Generation & Macro Replacement

Affiliate URLs are never hard-coded in client components. They are dynamically resolved server-side from `AffiliateProgram` and `AffiliateLink` models:

Supported Tracking Template Macros:
- `{click_id}`: Cryptographic unique tracking token generated per click (`clk_<timestamp>_<randomHex>`).
- `{affiliate_id}`: GoalMills merchant identifier on the network.
- `{campaign}`: Originating campaign code (e.g., `champions_league_qf`, `weekend_trebles`).
- `{placement}`: Specific UI element (`odds_table`, `best_odds`, `betting_scanner`, `bet_editor`, `match_details`).
- `{sport}`: Active sport context (`football`, `cricket`, `basketball`).

Example Template:
```text
https://partners.bet365.com/affiliate?affid={affiliate_id}&subid={click_id}&cmp={campaign}&plc={placement}
```

---

## 3. Anti-Open-Redirect Security

To eliminate vulnerability to open-redirect abuse:
1. Client components link exclusively to internal redirect routes: `/api/affiliate/redirect/:bookmaker` or `/api/v1/affiliate/redirect/:bookmaker`.
2. The redirect handler ignores any client-supplied target URLs.
3. Destination domains must strictly match the canonical domains verified in `getAllCanonicalBookmakers()`:
   ```typescript
   export function isAuthorizedBookmakerDestination(targetUrl: string, bookmakerId: string): boolean {
     const bookmaker = getCanonicalBookmaker(bookmakerId);
     const parsed = new URL(targetUrl);
     return parsed.hostname === bookmaker.websiteUrl || parsed.hostname.endsWith('.' + allowedDomain);
   }
   ```
4. If an invalid or unwhitelisted destination is detected, execution aborts and safely redirects to `bookmaker.websiteUrl`.

---

## 4. Non-PII Click & Conversion Telemetry

- **IP Anonymization:** Raw client IPs are never stored. `hashIpForTelemetry(ip)` converts IPs using SHA-256 with a daily rotating salt.
- **Deduplication:** High-frequency clicks from the same anonymous client within 10 seconds are coalesced.
- **Conversion Tracking:** `AffiliateConversion` records webhooks or affiliate network reconciliation reports linking back to `clickId`.
