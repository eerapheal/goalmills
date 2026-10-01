# GoalMills Betting & Affiliate Administration Guide

**Role:** CTO & Principal Software Architect, GoalMills  
**Status:** Approved & Implemented  

---

## 1. Administrative Capabilities

GoalMills Operations & Commercial Teams manage betting intelligence and monetization through dedicated Admin services and APIs:

1. **Bookmaker Operator Management:**
   - Active/Inactive toggles.
   - Licensing jurisdictions and geo-restrictions (`supportedCountries`).
   - Deep-linking URL templates and base landing pages.
2. **Affiliate Program & Link Configuration:**
   - Commission rules (CPA value, RevShare percentage, hybrid thresholds).
   - Placement tracking templates with macro substitutions.
   - Fallback destinations in case of upstream campaign termination.
3. **Conversion Reconciliation:**
   - Ingestion of postback webhooks or periodic CSV uploads from affiliate networks.
   - Reconciliation of conversions to original `clickId`.
4. **Campaign Engine:**
   - Scheduling seasonal campaigns (e.g. World Cup, AFCON, Euro, Champions League).
   - Budget allocation and impression capping.
