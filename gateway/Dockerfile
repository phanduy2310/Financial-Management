FROM node:20-alpine AS builder
WORKDIR /app

COPY src/package*.json ./
RUN npm ci --omit=dev
COPY src/ .

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app /app
EXPOSE 5444

CMD ["node", "server.js"]
