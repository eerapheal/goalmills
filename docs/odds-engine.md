# GoalMills Odds Normalization & Comparison Engine

**Role:** CTO & Principal Software Architect, GoalMills  
**Status:** Approved & Implemented  

---

## 1. Domain Normalization

Upstream sports providers deliver odds in disparate structures. The GoalMills Odds Normalizer maps legacy structures into canonical `OddsQuote[]`:
- **Market Types:** `1X2`, `OVER_UNDER`, `BTTS`, `DOUBLE_CHANCE`, `ASIAN_HANDICAP`.
- **Selection Normalization:** Home (`1`), Draw (`X`), Away (`2`), Over/Under thresholds (`2.5`, `1.5`, `3.5`), Both Teams To Score (`YES`, `NO`).
- **Odds Format Support:** Decimal, Fractional (`5/2`), and American (`+250`, `-150`) with bidirectional mathematical converters.

---

## 2. Objective Best Odds Algorithm

For any given market selection, the engine evaluates quotes across all registered bookmakers:
```typescript
let bestOdds = 0;
let bestBookmakerId = '';

for (const quote of quotesForSelection) {
  if (quote.odds > bestOdds) {
    bestOdds = quote.odds;
    bestBookmakerId = quote.bookmakerId;
  }
}
```
**Commercial Separation Rule:** Sponsored placements, affiliate tiers, and paid partnerships have **zero** influence on the selection of `bestOdds`. Sponsored bookmakers receive a visible commercial badge (`SPONSORED` / `AD`) but cannot displace mathematical top odds.

---

## 3. Market Margins & Payout Percentages

For each bookmaker quote in a market, the engine computes:
- **Total Market Margin:** $\sum (1 / \text{odds}_i) - 1.0$
- **Theoretical Payout Rate:** $100 / \sum (1 / \text{odds}_i)\%$
- Bookmakers with the highest payout rates are objectively ranked higher in market intelligence summaries.

---

## 4. Odds Movement & Historical Snapshots

- When pre-match odds are fetched, opening prices are retrieved from MongoDB (`OddsQuote` collection).
- `computeHistoricalOddsMovement(current, opening)` calculates percentage shifts and sets movement status: `UP` (odds lengthening / implied probability dropping), `DOWN` (odds shortening / implied probability increasing), or `STABLE`.
- Visual movement indicators (green $\blacktriangle$ for shortening, red $\blacktriangledown$ for lengthening) appear alongside live market odds.
