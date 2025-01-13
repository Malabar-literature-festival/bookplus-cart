# Build stage
FROM node:18.20.5-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm i puppeteer-core @sparticuz/chromium

COPY . .
RUN npm run build

# Production stage
FROM node:18.20.5-alpine AS master

# Install Chromium and font dependencies
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    # Core font packages
    fontconfig \
    font-noto \
    font-noto-arabic \
    font-noto-extra \
    font-noto-cjk \
    font-noto-emoji \
    # Additional dependencies for font rendering
    freetype \
    freetype-dev \
    harfbuzz \
    # Required for proper text rendering
    ttf-freefont \
    # Additional Arabic fonts
    font-arabic-misc \
    # Cache cleaning and font configuration
    && fc-cache -fv

# Create and set work directory
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Environment variables
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Font configuration
RUN mkdir -p /usr/share/fonts/custom && \
    cp -r /usr/share/fonts/noto-arabic/* /usr/share/fonts/custom/ && \
    fc-cache -fv /usr/share/fonts/custom

# Create chrome user and setup chrome directories
RUN addgroup -S chrome && \
    adduser -S chrome -G chrome && \
    mkdir -p /home/chrome/downloads && \
    chown -R chrome:chrome /home/chrome

# Security configurations
RUN mkdir -p /tmp/chrome && \
    chown -R chrome:chrome /tmp/chrome

# Switch to chrome user for security
USER chrome

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start command
CMD ["npm", "run", "start"]