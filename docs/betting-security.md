# GoalMills Betting & Affiliate Security Specification

**Role:** CTO & Principal Software Architect, GoalMills  
**Status:** Approved & Implemented  

---

## 1. Threat Modeling & Mitigation Controls

| Vulnerability / Threat | Risk Level | Architectural Mitigation |
| :--- | :--- | :--- |
| **Open Redirect Abuse** | High | Whitelist enforcement via `isAuthorizedBookmakerDestination()`. Client cannot supply destinations. Unapproved URLs safely default to verified canonical domain. |
| **Credential Exfiltration** | Critical | `BETLOY_API_KEY` guarded by `'server-only'`. Zero client bundle leakage. Zero API key visibility in browser DevTools. |
| **Click Fraud & Flooding** | High | Redis sliding window rate-limiting (30 clicks / 60s per IP hash). Duplicate clicks within 10s are coalesced. |
| **PII Contamination** | Medium | Client IP addresses hashed via SHA-256 with rotating salt. Public slips (`/bet-slip/:publicId`) strip all user identities. |
| **Provider Poisoning** | Medium | Schema validation and sanitization on all Betloy and upstream odds responses before rendering or saving. |

---

## 2. Responsible Gambling Compliance

Every odds matrix and betting tool view includes:
- Prominent responsible gambling notices: *"18+ Only. Odds comparison and bet intelligence tools are informational. Please gamble responsibly."*
- Clickable links to national support organizations (`https://www.begambleaware.org`).
- Clear visual distinction between objective mathematical best odds and sponsored bookmaker placements.
