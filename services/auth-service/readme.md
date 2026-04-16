# auth-service

> **Bounded Context**: Identity — Quản lý danh tính, xác thực và phân quyền người dùng.

## Overview

`auth-service` là service chịu trách nhiệm cho bounded context `Identity`: quản lý danh tính người dùng, xác thực phiên đăng nhập và cung cấp contract tra cứu user cho các service nội bộ. Ngoài auth flow cơ bản, service này còn quản lý workflow liên kết `parent-child` và phát notification event sang `notification-service`.

Service hiện đảm nhiệm các trách nhiệm chính sau:

- Đăng ký tài khoản mới với `fullname`, `email`, `password`; mật khẩu được hash bằng `bcrypt` và role mặc định là `user`
- Đăng nhập, cấp `JWT access token` và `refresh token`; access token mặc định sống `15m`, refresh token mặc định sống `7d`
- Lưu refresh token ở `httpOnly cookie`, đồng thời hash giá trị refresh token trong database để phục vụ refresh/logout an toàn hơn
- Xác thực request protected qua `Authorization: Bearer <token>` và phân quyền theo role bằng middleware
- Cung cấp các endpoint nội bộ để tra cứu user theo `email`, `id` hoặc danh sách `id`; các endpoint này được bảo vệ bằng `x-internal-key`
- Sở hữu dữ liệu trong database `financial_auth`, bao gồm các bảng `users`, `parent_child_links` và `parent_child_tokens`
- Hỗ trợ phụ huynh gửi lời mời liên kết tới tài khoản con theo email, tạo token xác nhận riêng có thời hạn `2 ngày`
- Cho phép tài khoản con xác nhận hoặc từ chối liên kết; chỉ parent có role `parent` mới được tạo lời mời
- Publish event `PARENT_LINK_REQUEST` sang `notification-service`; nếu publish notification thất bại thì lời mời vẫn được tạo thành công

Ngoài phạm vi của service này là quản lý đầy đủ user profile, admin workflow nâng cao và business logic của các domain khác.

**Database sở hữu**: `financial_auth`

## Tech Stack

| Component | Choice |
|-----------|--------|
| Language  | Node.js |
| Framework | Express.js |
| ORM       | Objection.js + Knex.js |
| Database  | MySQL 8.0 |
| Auth      | JWT (jsonwebtoken) + bcrypt |

## API Endpoints

### Auth — prefix `/api/auth`

| Method | Endpoint             | Description                               | Auth  |
|--------|----------------------|-------------------------------------------|-------|
| GET    | `/health`            | Health check                              | —     |
| POST   | `/api/auth/register` | Đăng ký tài khoản                        | —     |
| POST   | `/api/auth/login`    | Đăng nhập, nhận access + refresh token   | —     |
| POST   | `/api/auth/refresh`  | Làm mới access token qua cookie           | —     |
| POST   | `/api/auth/logout`   | Đăng xuất, xóa refresh token             | —     |
| GET    | `/api/auth/me`       | Lấy thông tin user hiện tại              | JWT   |
| GET    | `/api/auth/users/find` | Tìm user theo email (internal)          | —     |
| POST   | `/api/auth/users/bulk` | Lấy thông tin nhiều user theo ID (internal) | — |
| GET    | `/api/auth/users/:id`  | Lấy thông tin user theo ID              | —     |

### Parent-Child — prefix `/api/parent`

| Method | Endpoint                  | Description                              | Auth          |
|--------|---------------------------|------------------------------------------|---------------|
| POST   | `/api/parent/children`    | Thêm con theo `child_email` (dành cho phụ huynh) | JWT (parent) |
| POST   | `/api/parent/confirm`     | Con xác nhận/từ chối liên kết — body: `{token, action: "accepted"\|"rejected"}` | — |
| GET    | `/api/parent/children`    | Lấy danh sách con                        | JWT (parent) |

> Full specification: [`docs/api-specs/auth-service.yaml`](../../docs/api-specs/auth-service.yaml)

## Running Locally

```bash
docker compose up auth-service --build

# Kiểm tra gateway (accessible từ host)
curl http://localhost:5444/health

# Kiểm tra service status
docker compose ps auth-service
```

## Project Structure

```
auth-service/
├── Dockerfile
├── knexfile.js
├── package.json
├── server.js
└── src/
    ├── controllers/
    ├── middleware/
    ├── migrations/
    ├── models/
    ├── routes/
    ├── services/
    ├── clients/
    ├── config/
    └── utils/
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL hostname | `mysql` |
| `DB_NAME` | Database name | `financial_auth` |
| `DB_USER` / `DB_PASSWORD` | Credentials | *(see .env)* |
| `JWT_SECRET` | Secret key cho access token | *(see .env)* |
| `REFRESH_TOKEN_SECRET` | Secret key cho refresh token | *(see .env)* |
| `NOTIFICATION_SERVICE_URL` | URL notification-service | `http://notification-service:8084` |
