# GoalMills — Live Sports Data Engine & Normalization Architecture

**Version:** 2.0.0  
**Sports Ingested:** Football, Cricket, Basketball  
**Coming Soon Isolations:** Tennis, Baseball, Hockey  

---

## 1. Multi-Sport Normalization Architecture

GoalMills decouples upstream provider formats (AllSportsAPI, API-Football, Cricbuzz RapidAPI) from client UI layers through standardized normalization adapters.

```text
  [ Upstream API Responses ]
             │
             ▼
  [ Sports Proxy Adapters ]
  ├── Football: Status mapping (1st, 2nd, HT, FT, AET, PEN)
  ├── Cricket: Inning breakdown (Runs, Wickets, Overs, RPO)
  └── Basketball: Quarter points (Q1-Q4, Overtime, Total)
             │
             ▼
  [ Data Freshness Stamp ]
  ├── lastUpdatedAt (ISO timestamp)
  └── isStale (boolean)
             │
             ▼
  [ Realtime SSE Streamer ]
  └── /api/realtime/stream -> match:score_update
```

---

## 2. Sports Normalization Contracts

### 2.1 Football Normalization
- **Status Codes:** `scheduled`, `live`, `halftime`, `finished`, `postponed`, `cancelled`.
- **Scores:** Parsed from final result strings or discrete home/away scores.
- **Standings:** Unified `UnifiedWebStandingItem` handling flat structures (`standing_team`, `standing_place`) and nested structures (`team: { name, logo }`).

### 2.2 Cricket Normalization
- **Innings Representation:** `runs/wickets (overs)` (e.g. `287/6 (50.0 ov)`).
- **Match State:** In Progress, Complete, Stumps, Rain Interruption.
- **Cricbuzz Transformation:** Deeply nested RapidAPI formats converted into unified flat scorecards.

### 2.3 Basketball Normalization
- **Quarter Breakdown:** Array of 4 quarter point totals plus optional overtime periods.
- **Total Points:** Summed automatically with overtime indicators.

---

## 3. Realtime Streaming & Duplicate Suppression

GoalMills streams live score events to connected Web and Mobile clients via Server-Sent Events (`/api/realtime/stream`):

```text
event: match:score_update
data: {"sport":"football","matchId":"102948","homeScore":2,"awayScore":1,"status":"2nd Half"}
```

Duplicate payloads are automatically suppressed using internal cryptographic hashes (`dedupKey = "score:football:102948"`).
