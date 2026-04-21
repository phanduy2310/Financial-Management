FROM node:20-alpine AS builder
WORKDIR /app

COPY src/package*.json ./
RUN npm install
COPY src/ .

# Nhận API URL lúc build — Railway truyền qua Build Arguments
ARG REACT_APP_API_BASE_URL=https://gateway-api.up.railway.app/api
ARG REACT_APP_GATEWAY_URL=https://gateway-api.up.railway.app
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_GATEWAY_URL=$REACT_APP_GATEWAY_URL

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY src/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
