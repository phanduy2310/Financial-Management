FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY src/ .

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app /app
EXPOSE 8080

CMD ["node", "server.js"]
