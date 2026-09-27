# Multi-stage Dockerfile for GoalMills Social Engine Microservice
FROM node:22-slim AS builder

WORKDIR /app

# Install build dependencies for canvas and sharp if compiling
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack and pnpm
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# Copy workspace configs and dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types ./packages/types
COPY services/social-engine ./services/social-engine

# Install dependencies for social-engine and compile TypeScript
RUN pnpm install --frozen-lockfile --filter @goalmills/social-engine...
RUN pnpm --filter @goalmills/social-engine build && \
    node -e "const fs=require('fs'),path=require('path'); const d=path.resolve('/app/services/social-engine/dist'); const nested=path.join(d,'services','social-engine','src','index.js'); const top=path.join(d,'index.js'); if(fs.existsSync(nested) && !fs.existsSync(top)){ fs.writeFileSync(top, \"require('./services/social-engine/src/index.js');\\n\"); console.log('Created dist/index.js entry wrapper'); }"

# Production runtime stage
FROM node:22-slim AS runner

WORKDIR /app/services/social-engine
ENV NODE_ENV=production

# Install runtime libraries (Cairo, Pango, RSVG, and FFmpeg for video slides)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/types /app/packages/types
COPY --from=builder /app/services/social-engine /app/services/social-engine

EXPOSE 4000
CMD ["node", "-e", "const fs=require('fs'); const p=fs.existsSync('./dist/index.js')?'./dist/index.js':'./dist/services/social-engine/src/index.js'; require(p);"]
