FROM node:20-alpine AS builder
WORKDIR /app

COPY src/package*.json ./
RUN npm install
COPY src/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY src/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
