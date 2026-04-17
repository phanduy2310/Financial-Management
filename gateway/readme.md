# API Gateway — PTIT-Financial

Cổng duy nhất cho toàn bộ hệ thống. Nhận request từ frontend, xử lý CORS và route đến đúng microservice.

## Tech Stack

| Component | Choice     |
| --------- | ---------- |
| Language  | Node.js    |
| Framework | Express.js |
| Proxy     | axios      |
| Logger    | morgan     |

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

## CORS

Chỉ cho phép request từ `FRONTEND_URL` (mặc định `http://localhost:5000`) với `credentials: true`.

## Running

```bash
# Chạy toàn bộ hệ thống
docker compose up --build

# Chỉ build lại gateway
docker compose build gateway
docker compose up -d gateway
```

## Health Check

```
GET /health → {"status": "ok"}
```

## Environment Variables

| Variable                   | Description              | Example                            |
| -------------------------- | ------------------------ | ---------------------------------- |
| `PORT`                     | Port gateway lắng nghe   | `5444`                             |
| `FRONTEND_URL`             | Origin được phép CORS    | `http://localhost:5000`            |
| `AUTH_SERVICE_URL`         | URL auth-service         | `http://auth-service:8081`         |
| `TRANSACTION_SERVICE_URL`  | URL transaction-service  | `http://transaction-service:8082`  |
| `SAVING_SERVICE_URL`       | URL saving-service       | `http://saving-service:8083`       |
| `NOTIFICATION_SERVICE_URL` | URL notification-service | `http://notification-service:8084` |
| `GROUP_SERVICE_URL`        | URL group-service        | `http://group-service:8085`        |

## Project Structure

```
gateway/
├── Dockerfile
└── src/
    ├── .env
    ├── server.js
    └── routes/
        ├── auth.proxy.js
        ├── transaction.proxy.js
        ├── saving.proxy.js
        ├── notification.proxy.js
        └── group.proxy.js
```
