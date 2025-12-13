# GoalMills Monorepo Architecture

## 🏗️ Architecture Overview

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
         └─────────────┘            └─────────────┘
                │                           │
        ┌───────┴────────┐         ┌────────┼────────┐
        │                │         │        │        │
   ┌────▼────┐     ┌────▼────┐   │        │        │
   │   WEB   │     │ MOBILE  │   │        │        │
   │Next.js  │     │  Expo   │   │        │        │
   └────┬────┘     └────┬────┘   │        │        │
        │               │         │        │        │
        │               │    ┌────▼───┐ ┌─▼──┐ ┌───▼────┐
        │               │    │   UI   │ │TYPES│ │ CONFIG │
        │               │    │Tokens  │ │ TS  │ │  Base  │
        └───────┬───────┘    └────────┘ └─────┘ └────────┘
                │
                │  Shared Dependencies
                ▼
        ┌───────────────┐
        │  @goalmills/* │
        │   packages    │
        └───────────────┘
```

## 📦 Package Dependencies

```
apps/web
├── @goalmills/ui ──────┐
├── @goalmills/types ───┤
├── @goalmills/config ──┤
├── next               │
├── react              │
└── react-dom          │
                       │
apps/mobile            │
├── @goalmills/ui ─────┤
├── @goalmills/types ──┤
├── @goalmills/config ─┤
├── expo               │
├── expo-router        │
├── react              │
└── react-native       │
                       │
packages/ui ◄──────────┤
├── @goalmills/types ──┤
└── react              │
                       │
packages/types ◄───────┤
└── typescript         │
                       │
packages/config ◄──────┘
└── typescript
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    API LAYER (Future)                   │
│  @goalmills/api - Shared API calls for both platforms  │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐            ┌────▼────┐
    │   WEB   │            │ MOBILE  │
    │  Pages  │            │ Screens │
    └────┬────┘            └────┬────┘
         │                      │
         │  ┌──────────────────┐│
         │  │  Shared Types    ││
         └─►│  @goalmills/types││◄┘
            │  - Team          │
            │  - League        │
            │  - Fixture       │
            │  - Player        │
            └──────────────────┘
```

## 🎨 Design System Flow

```
packages/ui/index.ts
├── COLORS
│   ├── primary: #001f3f (Navy Blue)
│   ├── secondary: #0074D9
│   ├── success: #2ECC40
│   └── ...
│
├── SPACING
│   ├── xs: 4px
│   ├── sm: 8px
│   ├── md: 16px
│   └── ...
│
├── FONT_SIZES
│   ├── xs: 12px
│   ├── sm: 14px
│   ├── md: 16px
│   └── ...
│
└── UTILITIES
    ├── formatDate()
    ├── formatTime()
    └── formatDateTime()

         │
         ├──► apps/web/src/app/**/*.tsx
         │    (Next.js components use design tokens)
         │
         └──► apps/mobile/app/**/*.tsx
              (React Native components use design tokens)
```

## 🚀 Build Pipeline (Turborepo)

```
pnpm dev
    │
    ├─► turbo run dev
    │       │
    │       ├─► packages/types (no build needed)
    │       ├─► packages/ui (no build needed)
    │       ├─► packages/config (no build needed)
    │       │
    │       ├─► apps/web
    │       │   └─► next dev (http://localhost:3000)
    │       │
    │       └─► apps/mobile
    │           └─► expo start (QR code + dev server)
    │
    └─► Cached results for faster rebuilds
```

## 📱 Platform-Specific Implementations

### Web (Next.js)
```
apps/web/src/app/
├── layout.tsx          # Root layout with metadata
├── page.tsx            # Home page
├── globals.css         # Global styles
└── [feature]/
    ├── page.tsx        # Feature page
    └── layout.tsx      # Feature layout
```

### Mobile (Expo Router)
```
apps/mobile/app/
├── _layout.tsx         # Root navigation
├── index.tsx           # Home screen
└── [feature].tsx       # Feature screen
    or
└── [feature]/
    ├── _layout.tsx     # Nested navigation
    └── index.tsx       # Feature home
```

## 🔧 Technology Stack

### Frontend Frameworks
- **Web**: Next.js 14 (App Router)
- **Mobile**: React Native 0.73 + Expo 50

### Build Tools
- **Monorepo**: Turborepo 1.11
- **Package Manager**: PNPM 8
- **Bundler (Web)**: Next.js built-in (Webpack/Turbopack)
- **Bundler (Mobile)**: Metro (Expo)

### Language
- **TypeScript** 5.3 across all packages

### Styling
- **Web**: CSS Modules + Global CSS
- **Mobile**: React Native StyleSheet
- **Shared**: Design tokens from @goalmills/ui

## 🌐 Cross-Platform Strategy

### Shared Code (70%)
```typescript
// packages/types - 100% shared
export interface Team { ... }
export interface League { ... }

// packages/ui - 100% shared
export const COLORS = { ... }
export const formatDate = () => { ... }

// Future: packages/api - 100% shared
export const fetchTeams = async () => { ... }
```

### Platform-Specific (30%)
```typescript
// Web: CSS Modules
import styles from './page.module.css'

// Mobile: StyleSheet
import { StyleSheet } from 'react-native'
const styles = StyleSheet.create({ ... })
```

## 📊 File Organization

```
goalmills/
├── apps/                    # Applications
│   ├── web/                # Next.js app
│   │   ├── src/
│   │   │   └── app/       # App Router pages
│   │   ├── public/        # Static assets
│   │   └── package.json
│   │
│   └── mobile/            # Expo app
│       ├── app/           # Expo Router screens
│       ├── assets/        # Images, fonts
│       └── package.json
│
├── packages/              # Shared packages
│   ├── ui/               # Design system
│   ├── types/            # TypeScript types
│   └── config/           # Shared configs
│
└── [config files]        # Root configuration
    ├── package.json      # Root scripts
    ├── turbo.json       # Turborepo config
    └── pnpm-workspace.yaml
```

## 🔐 Environment Variables

### Web (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.goalmills.com
NEXT_PUBLIC_API_KEY=your_api_key
```

### Mobile (.env)
```bash
EXPO_PUBLIC_API_URL=https://api.goalmills.com
EXPO_PUBLIC_API_KEY=your_api_key
```

## 🧪 Testing Strategy (Future)

```
packages/ui/
├── __tests__/
│   ├── utils.test.ts
│   └── components.test.tsx

apps/web/
├── __tests__/
│   └── pages/
│       └── index.test.tsx

apps/mobile/
├── __tests__/
│   └── screens/
│       └── index.test.tsx
```

## 📈 Scalability

### Adding New Packages
```bash
mkdir packages/api
cd packages/api
pnpm init
# Add to pnpm-workspace.yaml automatically
```

### Adding New Apps
```bash
mkdir apps/admin
cd apps/admin
pnpm init
# Add to pnpm-workspace.yaml automatically
```

## 🎯 Development Workflow

```
1. Feature Request
   │
   ├─► Create shared types in packages/types
   │
   ├─► Create shared API in packages/api (future)
   │
   ├─► Implement Web UI in apps/web
   │
   ├─► Implement Mobile UI in apps/mobile
   │
   └─► Test on both platforms
```

## 🚢 Deployment Strategy

### Web (Vercel/Netlify)
```bash
cd apps/web
pnpm build
# Deploy .next/ directory
```

### Mobile (EAS Build)
```bash
cd apps/mobile
eas build --platform ios
eas build --platform android
eas submit
```

---

**Built with ❤️ using modern web technologies**
