# GoalMills - Ultimate Multi-Sport Platform

A modern monorepo containing a premium multi-sport platform featuring a robust Next.js web application and a React Native mobile app. GoalMills delivers real-time scores, comprehensive statistics, and detailed insights for Football and Cricket.

## 🏗️ Project Structure

```
goalmills/
├── apps/
│   ├── mobile/          # React Native (Expo) - iOS & Android
│   │   ├── services/    # Advanced API services (Football, Cricket)
│   │   └── app/         # Screens and Navigation
│   └── web/             # Next.js - Web Application
│       ├── services/    # Advanced API services (Football, Cricket)
│       └── app/         # App Router Pages & Layouts
├── packages/
│   ├── ui/              # Shared UI Design System & Components
│   ├── config/          # Shared ESLint/TS configurations
│   └── types/           # Shared TypeScript Domain Definitions
```

## 🌟 Key Features

### ⚽ Football Center

_The ultimate companion for the beautiful game._

**Core Features:**

- **Global Coverage**: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, UEFA Champions League, and more.
- **Real-Time Match Center**:
  - **Live Events**: Instant goal alerts, VAR checks, cards, and substitutions.
  - **Live Commentary**: Minute-by-minute text updates.
  - **Lineups**: Starting XI formations (4-3-3, 4-2-3-1, etc.) with substitutes and coaches.
  - **Match Stats**: Possession %, Shots (On/Off target), Corners, Fouls, Offsides.
- **Deep Analysis**:
  - **Head-to-Head (H2H)**: Historical performance analysis between teams.
  - **Form Guides**: Last 5 matches performance trends.
  - **Detailed Standings**: Live tables, promotion/relegation zones.
  - **Top Scorers & Assists**: Golden boot races and playmaker stats.
- **Betting Insights**:
  - **Odds Flow**: Pre-match probability and market movements.
  - **Predictions**: Data-driven outcome probabilities.
- **Rich Media**:
  - **News Feed**: Integrated blog posts and transfer news.
  - **Video Highlights**: Match recaps and key moments.
  - **Profiles**: Detailed pages for Teams, Players (Goals, Cards, Ratings), Coaches, and Referees.

### 🏏 Cricket Hub

_Ball-by-ball precision for gentlemen's game._

**Core Features:**

- **Tournament Coverage**: IPL, ICC World Cups (ODI/T20), The Ashes, Big Bash League (BBL), and International Tours.
- **Live Telemetry**:
  - **Smart Scorecard**: Real-time updates on Runs, Wickets, Overs, and Run Rates (Current & Required).
  - **Ball-by-Ball**: Detailed commentary for every delivery.
  - **Status Updates**: Toss results, elected to bat/bowl, Stumps, and Weather delays.
- **Comprehensive Scorecards**:
  - **Batting**: Runs, Balls Faced, 4s, 6s, Strike Rate.
  - **Bowling**: Overs, Maidens, Runs Conceded, Wickets, Economy Rate.
  - **Fall of Wickets**: Tracking momentum shifts.
- **Rankings & records**:
  - **ICC Rankings**: Live rankings for Teams and Players across Test, ODI, and T20 formats.
  - **Series Stats**: Most Runs, Most Wickets, Player of the Series tracking.

### 🏀 Basketball Court

_Fast-paced stats for the hardwood._

**Core Features:**

- **Leagues**: NBA, EuroLeague, ACB (Spain), CBA (China), and major international competitions.
- **Live Gamecast**:
  - **Quarter-by-Quarter**: Detailed period breakdowns (Q1, Q2, Q3, Q4).
  - **Live Status**: Game clock, overtime alerts, and timeout indicators.
- **Advanced Box Scores**:
  - **Player Stats**: Points (PTS), Rebounds (REB), Assists (AST), Steals (STL), Blocks (BLK).
  - **Efficiency**: Field Goal % (FG), 3-Point % (3PT), Free Throw % (FT), +/- Ratings.
  - **Team Comparison**: Fast break points, Points in paint, Turnovers.
- **Betting Markets**:
  - **Odds**: Moneyline, Spreads/Handicaps, Over/Under Totals.
- **Season Data**:
  - **Standings**: Conference rankings (East/West), Play-in zones.
  - **Rosters**: Complete active squad and rotation tracking.

### 🎾 Tennis Court

_Point-by-point action from the Grand Slams._

**Core Features:**

- **Grand Slam & ATP/WTA**: Wimbledon, Roland Garros (French Open), US Open, Australian Open, ATP Finals.
- **Match Centre**:
  - **Point-by-Point**: Granular tracking of every serve and rally (0-15, 15-30, Deuce, Ad).
  - **Set Scores**: Real-time set progression (6-4, 7-6, etc.).
  - **Tie-Breakers**: Detailed tie-break point history.
- **Player Profiles**:
  - **Rankings**: Official ATP/WTA rank movements.
  - **Surface Stats**: Performance splits on Grass, Clay, and Hard courts.
  - **Titles**: Career achievements and season records.
- **Betting Intelligence**:
  - **Winner Odds**: Match winner and Set winner markets.
  - **H2H Analysis**: Previous meetings between contenders.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PNPM >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Run both web and mobile in development
pnpm dev

# Run only web
pnpm web

# Run only mobile
pnpm mobile
```

## 📦 Packages

- **@goalmills/ui** - A premium, dark-mode-first design system
- **@goalmills/types** - The source of truth for all domain models (Football, Cricket)
- **@goalmills/config** - Standardized linting and build configs

## 🛠️ Tech Stack

- **Monorepo**: Turborepo + PNPM Workspaces
- **Web**: Next.js 14+ (App Router), TailwindCSS (implied)
- **Mobile**: React Native, Expo Router
- **State/Data**: Advanced Custom API Services
- **Language**: TypeScript throughout

## 📱 Apps Overview

### Web (`apps/web`)

A high-performance Next.js application offering a responsive, premium dashboard experience for sports analytics.

- **Run**: `pnpm web` (localhost:3000)

### Mobile (`apps/mobile`)

A native-feeling Expo application designed for on-the-go live scores and updates.

- **Run**: `pnpm mobile` (Development build/Expo Go)

## 🧪 Development Commands

```bash
# Build all apps
pnpm build

# Lint all packages
pnpm lint

# Format code
pnpm format

# Clean artifacts
pnpm clean
```

## 📄 License

Private - All Rights Reserved
