FROM node:18.20.5-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
RUN npm i puppeteer-core @sparticuz/chromium  
COPY . .
RUN npm run build

FROM node:18.20.5-alpine AS master
# Install Chromium and required dependencies  
RUN apk add --no-cache \
    # Browser and automation
    chromium \
    chromium-chromedriver \
    # Font rendering essentials
    harfbuzz \
    freetype \
    ttf-freefont \
    fontconfig \
    # Arabic and multilingual fonts
    font-noto-arabic \
    font-noto \
    font-noto-extra \
    font-noto-cjk \
    font-noto-emoji \
    # Language and locale support
    icu-libs \
    musl-locales \
    musl-locales-lang

# Set environment variables
ENV LANG=ar_AE.UTF-8 \
    LANGUAGE=ar_AE.UTF-8 \
    LC_ALL=ar_AE.UTF-8 \
    NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app
# Copy built files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Start the application
CMD ["npm", "run", "start"]
