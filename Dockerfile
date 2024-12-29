FROM node:18.20.5-alpine AS builder

WORKDIR /app
COPY package*.json .

RUN npm install
RUN npm i puppeteer-core
COPY . .

RUN npm run build
FROM node:18.20.5-alpine AS master

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

CMD ["npm", "run","start"]