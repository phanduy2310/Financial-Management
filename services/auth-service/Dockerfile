# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app /app
EXPOSE 8081

CMD ["node", "server.js"]
