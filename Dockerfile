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
    chromium \
    chromium-chromedriver \
    # Add Arabic and other font support
    font-noto-arabic \
    font-noto \
    font-noto-extra \
    # Add any additional required fonts
    font-noto-cjk \
    font-noto-emoji

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Set production environment  
ENV NODE_ENV=production  
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true  
  
CMD ["npm", "run","start"]
