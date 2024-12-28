# Build stage
FROM node:18.20.5-alpine AS builder

WORKDIR /app
COPY package*.json .

RUN npm install
COPY . .

RUN npm run build

# Production stage
FROM node:18.20.5-alpine AS master

# Install Chromium dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Set higher memory limits for Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Add user for security
RUN addgroup -S appuser && \
    adduser -S -G appuser appuser && \
    mkdir -p /tmp/chrome && \
    chown -R appuser:appuser /app /tmp/chrome

USER appuser

CMD ["npm", "run", "start"]