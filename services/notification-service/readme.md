# Notification-Service

> **Bounded Context**: Messaging — Quản lý và phân phát thông báo real-time đến người dùng qua SSE.

## Overview

- Nhận event từ các service khác qua `POST /internal/publish`)
- Lưu thông báo vào database
- Push thông báo real-time đến browser client qua **Server-Sent Events (SSE)**
- Cho phép user xem danh sách thông báo, đếm unread, đánh dấu đã đọc

**Database sở hữu**: `financial_notification`

**Pattern**: Fire-and-forget — các service gọi `POST /internal/publish` rồi tiếp tục, không chờ phản hồi.

## Tech Stack

| Component | Choice                   |
| --------- | ------------------------ |
| Language  | Node.js                  |
| Framework | Express.js               |
| ORM       | Knex.js                  |
| Database  | MySQL 8.0                |
| Transport | Server-Sent Events (SSE) |

## API Endpoints

### Notifications — prefix `/api/notification`

| Method | Endpoint                         | Description                              | Auth        |
| ------ | -------------------------------- | ---------------------------------------- | ----------- |
| GET    | `/api/notification/stream`       | Kết nối SSE stream — token qua `?token=` | query token |
| GET    | `/api/notification`              | Lấy danh sách thông báo                  | JWT         |
| GET    | `/api/notification/unread-count` | Đếm số thông báo chưa đọc                | JWT         |
| POST   | `/api/notification/:id/read`     | Đánh dấu một thông báo đã đọc            | JWT         |

### Internal — prefix `/internal`

| Method | Endpoint            | Description                                         | Auth                    |
| ------ | ------------------- | --------------------------------------------------- | ----------------------- |
| POST   | `/internal/publish` | Publish event thông báo (chỉ dùng giữa các service) | `x-internal-key` header |

> Full specification: [`docs/api-specs/notification-service.yaml`](../../docs/api-specs/notification-service.yaml)

## SSE Stream

Client kết nối vào `/api/notification/stream?token=<jwt>` (dùng query param vì `EventSource` không hỗ trợ Authorization header).

Khi có event mới, server push:

```
data: {"type":"NEW_NOTIFICATION","notification":{"id":1,"event":"TRANSACTION_CREATED","message":"Giao dịch mới: -50.000đ","is_read":false}}
```

## Internal Publish Payload

Các service khác gọi `POST /internal/publish` với header `x-internal-key: <INTERNAL_API_KEY>` và body:

Ví dụ — TRANSACTION_CREATED (từ transaction-service):

```json
{
  "event": "TRANSACTION_CREATED",
  "user_id": 1,
  "channels": ["web"],
  "source_service": "transaction-service",
  "payload": {
    "type": "expense",
    "category": "Ăn uống",
    "amount": 50000,
    "date": "2026-04-10"
  }
}
```

Ví dụ — PARENT_LINK_REQUEST (từ auth-service):

```json
{
  "event": "PARENT_LINK_REQUEST",
  "user_id": 2,
  "channels": ["web"],
  "source_service": "auth-service",
  "payload": {
    "parent_email": "parent@example.com",
    "token": "uuid-token"
  }
}
```

> `payload` là optional — chỉ `event` và `user_id` là bắt buộc.

## Running Locally

```bash
# Chạy riêng (dùng docker-compose.dev.yml)
docker compose -f docker-compose.dev.yml up --build

# Chạy cùng toàn hệ thống
docker compose up notification-service --build

# Kiểm tra service status
docker compose ps notification-service
```

## Project Structure

```
notification-service/
├── Dockerfile
├── knexfile.js
├── package.json
├── server.js
└── src/
    ├── controllers/
    ├── core/            # notification factory & processor
    ├── middleware/      # JWT auth + internal key auth
    ├── migrations/
    ├── models/
    ├── routes/
    ├── sse/             # SSE connection manager
    ├── clients/
    └── config/
```

## Environment Variables

| Variable                        | Description                          | Example                  |
| ------------------------------- | ------------------------------------ | ------------------------ |
| `PORT`                          | Port service lắng nghe               | `8084`                   |
| `MYSQL_HOST`                    | MySQL hostname                       | `mysql`                  |
| `MYSQL_DATABASE`                | Database name                        | `financial_notification` |
| `MYSQL_USER` / `MYSQL_PASSWORD` | Credentials                          | _(see .env.dev)_         |
| `JWT_SECRET`                    | JWT verification key                 | _(see .env.dev)_         |
| `INTERNAL_API_KEY`              | Shared secret cho internal endpoints | _(see .env.dev)_         |
