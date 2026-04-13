# API Gateway — PTIT-Financial

Cổng duy nhất cho toàn bộ hệ thống. Nhận request từ frontend, xử lý CORS và route đến đúng microservice.

## Tech Stack

- Node.js + Express + axios (manual proxy — không dùng http-proxy-middleware)

## Port

- `5444` (host & container)

## Routing Table

| External Path               | Target Service            |
| --------------------------- | ------------------------- |
| `/api/auth/*`               | auth-service:8081         |
| `/api/parent/*`             | auth-service:8081         |
| `/api/transactions/*`       | transaction-service:8082  |
| `/api/budget/*`             | transaction-service:8082  |
| `/api/saving/*`             | saving-service:8083       |
| `/api/installment/*`        | saving-service:8083       |
| `/api/notification/*`       | notification-service:8084 |
| `/api/groups/*`             | group-service:8085        |
| `/api/group-members/*`      | group-service:8085        |
| `/api/group-transactions/*` | group-service:8085        |

## Running

```bash
docker compose up gateway --build
```

## Health Check

```
GET /health → {"status": "ok"}
```
