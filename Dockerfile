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
    # Remove wget since we're not downloading fonts manually anymore
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
    echo '    <edit name="rgba" mode="assign">' >> /etc/fonts/local.conf && \
    echo '      <const>rgb</const>' >> /etc/fonts/local.conf && \
    echo '    </edit>' >> /etc/fonts/local.conf && \
    echo '    <edit name="lcdfilter" mode="assign">' >> /etc/fonts/local.conf && \
    echo '      <const>lcddefault</const>' >> /etc/fonts/local.conf && \
    echo '    </edit>' >> /etc/fonts/local.conf && \
    echo '  </match>' >> /etc/fonts/local.conf && \
    echo '  <!-- Configure Arabic font rendering -->' >> /etc/fonts/local.conf && \
    echo '  <match target="pattern">' >> /etc/fonts/local.conf && \
    echo '    <test name="lang" compare="contains">' >> /etc/fonts/local.conf && \
    echo '      <string>ar</string>' >> /etc/fonts/local.conf && \
    echo '    </test>' >> /etc/fonts/local.conf && \
    echo '    <edit name="family" mode="prepend" binding="strong">' >> /etc/fonts/local.conf && \
    echo '      <string>Noto Naskh Arabic</string>' >> /etc/fonts/local.conf && \
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
ENV FONTCONFIG_PATH=/etc/fonts
ENV FC_DEBUG=1

# Create chrome user and setup permissions
RUN addgroup -S chrome && \
    adduser -S chrome -G chrome && \
    mkdir -p /home/chrome/downloads && \
    chown -R chrome:chrome /home/chrome && \
    mkdir -p /tmp/chrome && \
    chown -R chrome:chrome /tmp/chrome

# Set permissions for fonts
RUN chown -R chrome:chrome /usr/share/fonts/custom && \
    chmod -R 755 /usr/share/fonts/custom

USER chrome

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["npm", "run", "start"]