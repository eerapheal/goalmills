# Cricket Web App Refactoring Plan

## Objective
Refactor the Next.js cricket web application to use `advancedCricketApi`, new cricket data types, and match the mobile app's design patterns and functionality.

## Files to Refactor

### 1. API Service ✅
- [x] Create `apps/web/src/services/advancedCricketApi.ts`
  - Copy from mobile implementation
  - Same mock data, types, and endpoints

### 2. Components
- [ ] `apps/web/src/components/CricketScreen.tsx`
  - Update to use `advancedCricketApi`
  - Use `CricketEvent`, `CricketLeague` types
  - Remove unsupported tabs (news, videos if not in API)
  - Match mobile app tabs: live, upcoming, results, series

- [ ] `apps/web/src/components/CricketMatchCard.tsx`
  - Update to use `CricketEvent` type
  - Match mobile card design (compact, smaller text)
  - Use `event_home_team`, `event_status`, etc.
  - Add placeholder logos for missing images

### 3. Pages

#### Rankings Page
- [ ] `apps/web/src/app/cricket/rankings/page.tsx`
  - Use `advancedCricketApi.getStandings()`
  - Map to Test (101), ODI (102), T20 (103) league IDs
  - Display `CricketStanding` data
  - Match mobile rankings UI

#### Teams Page
- [ ] `apps/web/src/app/cricket/teams/[id]/page.tsx`
  - Use `advancedCricketApi.getTeams({ teamId, APIkey: 'mock' })`
  - Display `CricketTeam` properties
  - Show team matches using `getFixtures`
  - Remove player list (API doesn't support)

#### Series Pages
- [ ] `apps/web/src/app/cricket/series/[id]/page.tsx`
  - Use `advancedCricketApi.getLeagues()` and filter by ID
  - Use `getFixtures({ leagueId })` for matches
  - Display `CricketLeague` properties
  - Show fixtures list

#### Match Details Page
- [ ] `apps/web/src/app/cricket/matches/[id]/page.tsx`
  - Use `advancedCricketApi.getFixtures({ matchId, APIkey: 'mock' })`
  - Display `CricketEvent` with scorecard
  - Show match info, teams, scores
  - Render scorecard from `event.scorecard`

#### Players Page
- [ ] `apps/web/src/app/cricket/players/[id]/page.tsx`
  - Stub with "Not Available" message
  - API doesn't support player endpoints

## Implementation Order

1. ✅ Create `advancedCricketApi.ts`
2. Update `CricketMatchCard.tsx` component
3. Update `CricketScreen.tsx` main component
4. Refactor Rankings page
5. Refactor Teams detail page
6. Refactor Series detail page
7. Refactor Match details page
8. Stub Players page

## Key Changes

### Data Type Migrations
- `CricketMatchInfo` → `CricketEvent`
- `CricketSeries` → `CricketLeague`
- Old API calls → `advancedCricketApi` methods

### Property Mappings
- `match.id` → `match.event_key`
- `match.teamInfo[0].name` → `match.event_home_team`
- `match.status` → `match.event_status`
- `match.homeScore` → `match.event_home_final_result`
- `series.name` → `league.league_name`
- `team.id` → `team.team_key`

### API Parameters
All API calls must include `APIkey: 'mock'` parameter

### Design Consistency
- Match mobile app's compact card design
- Use same color scheme and spacing
- Implement placeholder logos (first letter circles)
- Smaller font sizes for better density

## Testing Checklist
- [ ] Rankings display for all formats
- [ ] Team details show correctly
- [ ] Series pages load fixtures
- [ ] Match details show scorecard
- [ ] Images/logos display properly
- [ ] Navigation works between pages
- [ ] Loading states work
- [ ] Error states handled gracefully
