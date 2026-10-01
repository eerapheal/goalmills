# GoalMills Betloy Integration & Provider Abstraction

**Role:** CTO & Principal Software Architect, GoalMills  
**Status:** Approved & Implemented  

---

## 1. Provider Isolation Architecture

To ensure GoalMills is never coupled to or reliant on Betloy, all Betloy interactions are isolated behind the `BetToolsProvider` contract defined in `@goalmills/types`:

```typescript
export interface BetToolsProvider {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  scanBetCode(req: BetScanRequest): Promise<NormalizedBetScanResult>;
  decodeBetSlip(code: string, bookmaker: string): Promise<DecodedBetSlip>;
  analyzeBetSlip(slip: DecodedBetSlip): Promise<NormalizedBetAnalysisResult>;
  convertBetCode(code: string, fromBookmaker: string, toBookmaker: string): Promise<NormalizedBetConvertResult>;
  trimBetSlip(slip: DecodedBetSlip, targetRisk?: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<NormalizedBetTrimResult>;
  getProviderBookmakers(): Promise<ProviderBookmakerInfo[]>;
}
```

---

## 2. Resilient Client & Circuit Breaker

The `BetloyClient` wraps upstream API calls with enterprise resilience patterns:
1. **Circuit Breaker States:**
   - `CLOSED`: Normal operation; all requests sent to Betloy.
   - `OPEN`: Triggered when 5 consecutive failures occur. Failures trip the breaker, immediately routing calls to local fallback logic without network delay.
   - `HALF_OPEN`: Initiated after a 30-second cooldown to test upstream health with a single probe.
2. **Timeout & Retries:** Strict 3,500ms timeout per call; maximum 2 retries with exponential backoff on 5xx or network errors. 4xx errors are not retried.
3. **Graceful Fallbacks:** If Betloy is unreachable or circuit is open, the `BetloyAdapter` switches to offline mathematical simulation (estimating combined accumulator odds and probability) ensuring zero user-facing downtime.

---

## 3. Credential Security & Node-Only Isolation

- `BETLOY_API_KEY` is loaded exclusively in server-side Next.js route handlers and server services.
- `betloyConfig.ts` imports `'server-only'` to prevent bundling into client-side scripts.
- Client React components communicate exclusively via internal `/api/v1/betting/*` routes.
