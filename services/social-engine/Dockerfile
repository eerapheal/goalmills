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

# Copy package manifests
COPY package.json tsconfig.json ./

# Install packages
RUN npm install

# Copy source code
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# Production runtime stage
FROM node:22-slim AS runner

WORKDIR /app
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

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]
