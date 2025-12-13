# GoalMills - Multi-Sport Platform

A modern monorepo containing a multi-sport platform with React Native mobile app and Next.js web application.

## 🏗️ Project Structure

```
goalmills/
├── apps/
│   ├── mobile/          # React Native (Expo) - iOS & Android
│   └── web/             # Next.js - Web Application
├── packages/
│   ├── ui/              # Shared UI components
│   ├── config/          # Shared configurations
│   └── types/           # Shared TypeScript types
```

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

- **@goalmills/ui** - Shared UI components for both web and mobile
- **@goalmills/types** - Shared TypeScript types and interfaces
- **@goalmills/config** - Shared configuration files

## 🛠️ Tech Stack

- **Monorepo**: Turborepo + PNPM Workspaces
- **Web**: Next.js 14+ with App Router
- **Mobile**: React Native with Expo
- **Language**: TypeScript
- **Styling**: CSS (Web) + React Native StyleSheet (Mobile)

## 📱 Apps

### Web (`apps/web`)
Next.js application for the web platform.

```bash
cd apps/web
pnpm dev
```

### Mobile (`apps/mobile`)
React Native Expo application for iOS and Android.

```bash
cd apps/mobile
pnpm dev
```

## 🧪 Development

```bash
# Build all apps
pnpm build

# Lint all packages
pnpm lint

# Format code
pnpm format

# Clean all node_modules and build artifacts
pnpm clean
```

## 📄 License

Private - All Rights Reserved
