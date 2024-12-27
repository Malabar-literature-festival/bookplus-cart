FROM node:18.20.5-alpine AS builder

WORKDIR /app
COPY package*.json .

RUN npm install
COPY . .

RUN next build
FROM node:18.20.5-alpine AS master

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

CMD ["next", "start"]