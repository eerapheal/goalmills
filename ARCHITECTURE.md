# GoalMills Monorepo Architecture

## 🏗️ Architecture Overview

The GoalMills architecture is designed for code sharing and feature parity between Web (Next.js) and Mobile (React Native/Expo).

```
┌─────────────────────────────────────────────────────────────┐
│                     GOALMILLS MONOREPO                      │
│                    (Turborepo + PNPM)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
         ┌──────▼──────┐            ┌──────▼──────┐
         │    APPS     │            │  PACKAGES   │
         │ (Consumers) │            │ (Providers) │
         └─────────────┘            └─────────────┘
                │                           │
        ┌───────┴────────┐         ┌────────┼────────┐
        │                │         │        │        │
   ┌────▼────┐     ┌────▼────┐   │        │        │
   │   WEB   │     │ MOBILE  │   │        │        │
   │ Next.js │     │  Expo   │   │        │        │
   │(Services)     │(Services)   │        │        │
   └────┬────┘     └────┬────┘   │        │        │
        │               │         │        │        │
        │               │    ┌────▼───┐ ┌─▼──┐ ┌───▼────┐
        │               │    │   UI   │ │TYPES│ │ CONFIG │
        │               │    │Premium │ │ TS  │ │  Base  │
        │               │    │ Design │ │Defs │ │ Setup  │
        └───────┬───────┘    └────────┘ └─────┘ └────────┘
                │
                │  Shared Dependencies
                ▼
        ┌───────────────┐
        │  @goalmills/* │
        │   packages    │
        └───────────────┘
```

## 🔄 Data Flow & API Strategy

Both applications utilize an "Advanced Service" pattern. While the services reside within each application to allow for platform-specific optimizations (e.g., caching, fetch implementations), they share 100% of the domain types and mock data structures.

```
┌───────────────────────────────────────────────────────────────────┐
│                          SHARED TYPES                             │
│                      (@goalmills/types)                           │
│  Definitions for: Leagues, Teams, Players, Matches, Events...     │
└────────────────────────────────┬──────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
       ┌─────────▼─────────┐           ┌─────────▼─────────┐
       │     WEB APP       │           │    MOBILE APP     │
       │                   │           │                   │
       │  ┌─────────────┐  │           │  ┌─────────────┐  │
       │  │ Service API │  │           │  │ Service API │  │
       │  └──────┬──────┘  │           │  └──────┬──────┘  │
       │         │         │           │         │         │
       │  ┌──────▼──────┐  │           │  ┌──────▼──────┐  │
       │  │  Components │  │           │  │   Screens   │  │
       │  └─────────────┘  │           │  └─────────────┘  │
       └───────────────────┘           └───────────────────┘
```

### ⚽ Football Domain
- **AdvancedFootballApi**: Handles complex data relationships.
  - **Fixtures**: Live, Upcoming, Finished flows with minute-by-minute updates.
  - **Entities**: Detailed parsing for Teams, Players, Officials, and Coaches.
  - **Analysis**: Odds movements, Win Probabilities, and rich Head-to-Head calculations.
  - **Multimedia**: Integration of video highlights and news feeds.

### 🏏 Cricket Domain
- **AdvancedCricketApi**: Specialized for cricket scoring nuances.
  - **Scoring**: In-depth inning processing, ball-by-ball commentary, and fall of wickets.
  - **Rankings**: ICC compliant ranking tables for Teams and Players (Test, ODI, T20).
  - **Series**: Tournament aggregation, points tables, and Net Run Rate (NRR) calculators.

### 🏀 Basketball Domain
- **BasketballApi**: Optimized for high-frequency scoring updates.
  - **Game State**: Quarter-by-quarter tracking and live clock management.
  - **Statistics**: Granular player efficiency metrics (FG%, +/-) and team comparisons.
  - **Markets**: Betting odds integration for Spreads and Totals.

### 🎾 Tennis Domain
- **TennisApi**: Focused on set and game-level granularity.
  - **Match Flow**: Point-by-point tracking (15-30, Deuce, Ad) and tie-break logic.
  - **Tournaments**: Hierarchy support for Grand Slams, ATP/WTA tours, and surface types.
  - **Performance**: Player surface stats (Grass vs Clay) and H2H history.

## 🎨 Design System (Premium UI)

The design system (`packages/ui`) is built for a "Premium Sport" aesthetic.

- **Theme**: Dark Mode First (Deep Navys, Sleek Blacks).
- **Typography**: Modern Sans-Serif (Inter/Roboto variants).
- **Components**:
  - `GlassCard`: Glassmorphism effects for premium feel.
  - `hero-gradient`: Vibrant gradients for impact.
  - `MatchCard`: Unified card design for fixtures.

```
packages/ui/
├── src/
│   ├── colors.ts       # HSL Tailored Palettes
│   ├── spacing.ts      # 4px Grid System
│   └── components/     # Platform Agnostic Components
```

## 📱 Platform Specifics

### Web (apps/web)
- **Framework**: Next.js 14 App Router.
- **Styling**: TailwindCSS with Custom Config.
- **Key Routes**:
  - `/football/*`: Deep nesting for specialized football pages.
  - `/cricket/*`: Dedicated cricket hub.

### Mobile (apps/mobile)
- **Framework**: React Native with Expo Router.
- **Styling**: Native StyleSheet + Token Abstractions.
- **Navigation**: Tab-based root with Stack navigators for deep features.

## 🔧 Technology Stack

### Core
- **Monorepo Manager**: Turborepo
- **Package Manager**: PNPM
- **Language**: TypeScript 5.x

### State Management
- **Pattern**: Service-based fetching with clean separation of concerns.
- **Data**: Comprehensive Mock Data generation for reliable dev/demo environments.

## 📊 File Organization

```
goalmills/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── services/    # AdvancedFootballApi, AdvancedCricketApi
│   │   │   ├── components/  # Web-only components
│   │   │   └── app/         # Next.js Pages
│   │
│   └── mobile/
│       ├── services/        # Service-mirror of web (Platform adapted)
│       └── app/             # Expo Screens
│
└── packages/
    ├── types/               # The contract that binds apps together
    └── ui/                  # The look and feel
```

## 🎯 Development Workflow

1.  **Type Definition**: Update `@goalmills/types` with new entity properties.
2.  **Service Implementation**: specific logic in `apps/*/services/`.
3.  **UI Component**: Build in `packages/ui` if shared, or app-specific folder.
4.  **Integration**: Wire up the service data to the UI.
