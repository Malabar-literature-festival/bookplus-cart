FROM node:18.20.5-alpine AS builder

WORKDIR /app
COPY package*.json .

RUN npm install
RUN npm i puppeteer-core
COPY . .

RUN npm run build
FROM node:18.20.5-alpine AS master

# Install Chromium and required dependencies  
RUN apk add --no-cache chromium chromium-chromedriver  

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Set necessary environment variables  
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true  
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser  
ENV CHROME_BIN=/usr/bin/chromium-browser  
ENV CHROME_PATH=/usr/bin/chromium-browser  

# Add required puppeteer flags  
ENV PUPPETEER_ARGS="\
  --no-sandbox \
  --disable-setuid-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --no-first-run \
  --no-zygote \
  --single-process \
  --disable-software-rasterizer" 
  
CMD ["npm", "run","start"]
