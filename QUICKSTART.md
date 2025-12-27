# 🎉 GoalMills Monorepo - Successfully Created!

## ✅ What's Been Set Up

Your monorepo is now ready with the following structure:

```
goalmills/
├── 📱 apps/
│   ├── mobile/              # React Native (Expo) - iOS, Android, Web
│   │   ├── app/
│   │   │   ├── _layout.tsx  # Root navigation layout
│   │   │   └── index.tsx    # Home screen
│   │   ├── assets/          # Images, icons, fonts
│   │   ├── app.json         # Expo configuration
│   │   ├── babel.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                 # Next.js 14 - Web Application
│       ├── src/
│       │   └── app/
│       │       ├── layout.tsx    # Root layout
│       │       ├── page.tsx      # Home page
│       │       ├── page.module.css
│       │       └── globals.css
│       ├── next.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── 📦 packages/
│   ├── ui/                  # Shared design tokens & utilities
│   │   ├── index.ts         # COLORS, SPACING, FONT_SIZES, etc.
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/               # Shared TypeScript interfaces
│   │   ├── index.ts         # Team, League, Fixture, Player, etc.
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/              # Shared configurations
│       ├── tsconfig.json    # Base TypeScript config
│       └── package.json
│
├── 📄 Configuration Files
│   ├── package.json         # Root package with scripts
│   ├── pnpm-workspace.yaml  # Workspace definition
│   ├── turbo.json          # Turborepo pipeline
│   ├── .gitignore
│   ├── .prettierrc
│   └── .eslintignore
│
└── 📚 Documentation
    ├── README.md            # Project overview
    ├── SETUP.md            # Detailed setup guide
    └── QUICKSTART.md       # This file!
```

## 🚀 Quick Start Commands

### 1. Run Both Apps (Recommended for Development)

```bash
pnpm dev
```

This starts:
- **Web**: http://localhost:3000
- **Mobile**: Expo dev server with QR code

### 2. Run Web Only

```bash
pnpm web
```

Visit: http://localhost:3000

### 3. Run Mobile Only

```bash
pnpm mobile
```

Then:
- Press **`w`** for web browser
- Press **`a`** for Android emulator
- Press **`i`** for iOS simulator (Mac only)
- Scan QR code with **Expo Go** app

## 🎨 Design System

Both apps share the same design tokens from `@goalmills/ui`:

### Colors
```typescript
import { COLORS } from '@goalmills/ui';

COLORS.primary       // #001f3f (Navy Blue)
COLORS.secondary     // #0074D9
COLORS.success       // #2ECC40
COLORS.background    // #FFFFFF
COLORS.backgroundDark // #0a0a0a
```

### Spacing
```typescript
import { SPACING } from '@goalmills/ui';

SPACING.xs   // 4px
SPACING.sm   // 8px
SPACING.md   // 16px
SPACING.lg   // 24px
SPACING.xl   // 32px
SPACING.xxl  // 48px
```

### Typography
```typescript
import { FONT_SIZES } from '@goalmills/ui';

FONT_SIZES.xs   // 12px
FONT_SIZES.sm   // 14px
FONT_SIZES.md   // 16px
FONT_SIZES.lg   // 18px
FONT_SIZES.xl   // 24px
FONT_SIZES.xxl  // 32px
```

### Utilities
```typescript
import { formatDate, formatTime, formatDateTime } from '@goalmills/ui';

formatDate('2024-12-11')      // "Dec 11, 2024"
formatTime('2024-12-11T15:30') // "3:30 PM"
formatDateTime('2024-12-11T15:30') // "Dec 11, 2024 3:30 PM"
```

## 📊 Shared Types

All sports data types are defined in `@goalmills/types`:

```typescript
import type { 
  Team, 
  League, 
  Fixture, 
  Standing, 
  Player,
  BlogPost,
  VideoHighlight 
} from '@goalmills/types';
```

## 🛠️ Development Workflow

### Adding a New Page

**Web (Next.js):**
```bash
# Create new page
apps/web/src/app/football/page.tsx
```

**Mobile (Expo Router):**
```bash
# Create new screen
apps/mobile/app/football.tsx
```

### Adding Dependencies

```bash
# To web app
pnpm --filter web add axios

# To mobile app
pnpm --filter mobile add axios

# To shared package
pnpm --filter @goalmills/ui add date-fns
```

### Creating Shared Components

1. Add to `packages/ui/components/`
2. Export from `packages/ui/index.ts`
3. Use in both web and mobile:

```typescript
import { MyComponent } from '@goalmills/ui';
```

## 🎯 Next Steps

### 1. Add API Integration
Create a shared API package:
```bash
mkdir packages/api
# Add API functions that work on both web and mobile
```

### 2. Add More Screens
- League details
- Team profiles
- Player stats
- Live scores
- Match details

### 3. Add Navigation
- **Web**: Next.js App Router (already set up)
- **Mobile**: Expo Router with tabs/stack navigation

### 4. Add State Management
Consider adding:
- Zustand (lightweight)
- Redux Toolkit
- React Query (for API data)

### 5. Add Testing
```bash
# Add testing packages
pnpm add -D -w jest @testing-library/react
```

## 📱 Mobile Development Tips

### Using Expo Go (Easiest)
1. Install Expo Go on your phone
2. Run `pnpm mobile`
3. Scan QR code

### Using Emulators
**Android:**
- Install Android Studio
- Create AVD (Android Virtual Device)
- Run `pnpm mobile` and press `a`

**iOS (Mac only):**
- Install Xcode
- Run `pnpm mobile` and press `i`

## 🌐 Web Development Tips

### Hot Reload
Changes to files automatically reload the browser.

### Shared Packages
Changes to `packages/*` are instantly reflected (no rebuild needed).

### CSS Modules
Use `.module.css` for scoped styles:
```typescript
import styles from './page.module.css';
```

## 🔍 Troubleshooting

### "Cannot find module '@goalmills/...'"
```bash
pnpm install
```

### Port 3000 in use
```bash
PORT=3001 pnpm web
```

### Expo cache issues
```bash
cd apps/mobile
npx expo start -c
```

### Clean everything
```bash
pnpm clean
pnpm install
```

## 📚 Resources

- **Turborepo**: https://turbo.build/repo/docs
- **Next.js**: https://nextjs.org/docs
- **Expo**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **PNPM Workspaces**: https://pnpm.io/workspaces

## 🎨 Design Features

Both apps include:
- ✅ Navy blue primary color (#001f3f)
- ✅ Modern Inter font family
- ✅ Glassmorphism effects
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Dark mode ready

## 💡 Pro Tips

1. **Use Turbo for speed**: Turborepo caches build outputs
2. **Shared code first**: Put reusable code in `packages/`
3. **Type everything**: Use TypeScript for better DX
4. **Mobile-first**: Design for mobile, enhance for web
5. **Test on real devices**: Expo Go makes this easy

---

## 🎊 You're All Set!

Start developing with:

```bash
pnpm dev
```

Happy coding! 🚀



📌 1. PROPRIETARY SOFTWARE LICENSE AGREEMENT

GoalMills Software License – Version 1.0 (2025)

Copyright © 2025 GoalMills / Ekpenisi Erue Raphael
All rights reserved.

This License Agreement (“Agreement”) governs the use of the GoalMills software, including its source code, binaries, APIs, UI components, assets, documentation, designs, databases, and related materials (“Software”).

By installing, accessing, or using the Software, you agree to be bound by this Agreement.

1. GRANT OF LICENSE

GoalMills grants you a limited, non-transferable, revocable license to use the Software solely for personal or internal business usage according to this Agreement.

2. RESTRICTIONS

You may NOT:

copy or reproduce the Software in whole or part

modify, translate, adapt, or create derivative works

distribute, sublicense, lease, resell, or share the Software

reverse engineer, disassemble, or extract source code

remove copyright notices or security/technical restrictions

use any code, assets, or components in other software

Any unauthorized use terminates this license immediately.

3. OWNERSHIP

The Software remains the exclusive property of GoalMills / Ekpenisi Erue Raphael.
No rights or ownership are transferred through this Agreement.

4. INTELLECTUAL PROPERTY RIGHTS

All copyrights, trademarks, trade secrets, patents, and proprietary elements are legally protected under US and international law.

5. DISCLAIMER

The Software is provided “AS IS,” without warranty of any kind including merchantability, fitness for purpose, or non-infringement.

6. LIMITATION OF LIABILITY

GoalMills will not be liable for:

loss of data

business interruption

lost profits

indirect, incidental, or consequential damages

7. GOVERNING LAW

This Agreement is governed by the laws of the Nigeria Federal Republic and the State of Delta.