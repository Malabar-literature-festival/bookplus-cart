FROM node:18.20.5-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./

RUN npm install
RUN npm i puppeteer-core @sparticuz/chromium
COPY . .
RUN npm run build

FROM node:18.20.5-alpine AS master

# Install Chromium and enhanced font dependencies
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    fontconfig \
    freetype \
    freetype-dev \
    harfbuzz \
    cairo \
    pango \
    ttf-freefont \
    font-noto-arabic \
    font-noto \
    font-noto-extra \
    font-arabic-misc \
    curl \
    && rm -rf /var/cache/apk/*

# Create font directories and update font cache
RUN mkdir -p /usr/share/fonts/custom && \
    fc-cache -fv

# Create font configuration file for better Arabic rendering
RUN echo '<?xml version="1.0"?>' > /etc/fonts/local.conf && \
    echo '<!DOCTYPE fontconfig SYSTEM "fonts.dtd">' >> /etc/fonts/local.conf && \
    echo '<fontconfig>' >> /etc/fonts/local.conf && \
    echo '  <match target="font">' >> /etc/fonts/local.conf && \
    echo '    <edit name="antialias" mode="assign">' >> /etc/fonts/local.conf && \
    echo '      <bool>true</bool>' >> /etc/fonts/local.conf && \
    echo '    </edit>' >> /etc/fonts/local.conf && \
    echo '    <edit name="hinting" mode="assign">' >> /etc/fonts/local.conf && \
    echo '      <bool>true</bool>' >> /etc/fonts/local.conf && \
    echo '    </edit>' >> /etc/fonts/local.conf && \
    echo '    <edit name="hintstyle" mode="assign">' >> /etc/fonts/local.conf && \
    echo '      <const>hintslight</const>' >> /etc/fonts/local.conf && \
    echo '    </edit>' >> /etc/fonts/local.conf && \
    echo '  </match>' >> /etc/fonts/local.conf && \
    echo '</fontconfig>' >> /etc/fonts/local.conf

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Environment variables
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV CHROME_BIN=/usr/bin/chromium-browser

# Create chrome user and setup permissions
RUN mkdir -p /tmp/chrome && \
    addgroup -S pptruser && adduser -S -G pptruser pptruser && \
    chown -R pptruser:pptruser /app && \
    chown -R pptruser:pptruser /tmp/chrome && \
    chown -R pptruser:pptruser /usr/share/fonts/custom

# Switch to pptruser
USER pptruser

EXPOSE 3000

CMD ["npm", "run", "start"]