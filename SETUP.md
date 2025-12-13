# GoalMills Monorepo - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/

2. **PNPM** (v8 or higher)
   ```bash
   npm install -g pnpm
   ```

3. **Git** (for version control)
   - Download from: https://git-scm.com/

## 🚀 Installation Steps

### 1. Install Dependencies

From the root directory, run:

```bash
pnpm install
```

This will install all dependencies for all packages and apps in the monorepo.

### 2. Verify Installation

Check that everything is installed correctly:

```bash
pnpm --version
node --version
```

## 🏃 Running the Applications

### Run Both Apps Simultaneously

```bash
pnpm dev
```

This will start both the web and mobile apps in development mode.

### Run Web App Only

```bash
pnpm web
```

The web app will be available at: http://localhost:3000

### Run Mobile App Only

```bash
pnpm mobile
```

This will start the Expo development server. You can then:
- Press `w` to open in web browser
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator (Mac only)
- Scan QR code with Expo Go app on your phone

## 📱 Mobile Development Setup

### For iOS Development (Mac only)

1. Install Xcode from the Mac App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

### For Android Development

1. Install Android Studio: https://developer.android.com/studio
2. Set up Android SDK and emulator through Android Studio
3. Add Android SDK to your PATH

### Expo Go App (Easiest Method)

1. Install Expo Go on your phone:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Run `pnpm mobile` and scan the QR code with your phone

## 🏗️ Project Structure

```
goalmills/
├── apps/
│   ├── mobile/          # React Native (Expo)
│   │   ├── app/         # Expo Router pages
│   │   └── assets/      # Images, fonts, etc.
│   └── web/             # Next.js
│       └── src/
│           └── app/     # Next.js App Router pages
├── packages/
│   ├── ui/              # Shared UI components & design tokens
│   ├── types/           # Shared TypeScript types
│   └── config/          # Shared configurations
```

## 🔧 Useful Commands

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Build all apps
pnpm build

# Lint all packages
pnpm lint

# Format code
pnpm format

# Clean all build artifacts and node_modules
pnpm clean
```

## 📦 Adding Dependencies

### To a specific app:

```bash
# For web app
pnpm --filter web add <package-name>

# For mobile app
pnpm --filter mobile add <package-name>
```

### To a shared package:

```bash
# For UI package
pnpm --filter @goalmills/ui add <package-name>

# For types package
pnpm --filter @goalmills/types add <package-name>
```

### To root (dev dependencies):

```bash
pnpm add -D -w <package-name>
```

## 🎨 Shared Packages

### @goalmills/ui
Contains shared design tokens (colors, spacing, fonts) and utility functions.

```typescript
import { COLORS, SPACING, formatDate } from '@goalmills/ui';
```

### @goalmills/types
Contains shared TypeScript interfaces for sports data.

```typescript
import type { Team, League, Fixture } from '@goalmills/types';
```

## 🐛 Troubleshooting

### Issue: "Cannot find module '@goalmills/...'"

**Solution**: Run `pnpm install` from the root directory.

### Issue: Port 3000 already in use

**Solution**: Kill the process using port 3000 or change the port:
```bash
# Web app with different port
PORT=3001 pnpm web
```

### Issue: Expo not starting

**Solution**: 
1. Clear Expo cache: `cd apps/mobile && npx expo start -c`
2. Reinstall dependencies: `pnpm clean && pnpm install`

### Issue: TypeScript errors in shared packages

**Solution**: Build the packages first:
```bash
pnpm --filter @goalmills/types build
pnpm --filter @goalmills/ui build
```

## 📚 Next Steps

1. **Add API Integration**: Create a shared API package for fetching sports data
2. **Add Navigation**: Implement routing for different sports and pages
3. **Add State Management**: Consider adding Zustand or Redux for global state
4. **Add Testing**: Set up Jest and React Testing Library
5. **Add CI/CD**: Set up GitHub Actions for automated testing and deployment

## 🔗 Useful Links

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [PNPM Workspaces](https://pnpm.io/workspaces)

## 💡 Tips

- Use `pnpm --filter <package-name>` to run commands in specific packages
- Shared packages are automatically linked via workspace protocol
- Changes to shared packages are instantly reflected in apps (no rebuild needed)
- Use Turbo's caching to speed up builds: `pnpm build` will cache results

Happy coding! 🚀
