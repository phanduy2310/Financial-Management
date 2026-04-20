# Transaction Service

Microservice quản lý giao dịch thu chi cá nhân. Cung cấp API để tạo, cập nhật, xoá giao dịch và thống kê tài chính theo tháng/năm.

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express 5
- **ORM:** Objection.js + Knex
- **Database:** MySQL 8
- **Auth:** JWT (verify tại service, không gọi lại auth-service)

## Cấu trúc thư mục

```
transaction-service/
├── src/
│   ├── clients/          # HTTP client gọi notification-service
│   ├── config/           # Knex config, kết nối DB
│   ├── controllers/      # Xử lý request/response
│   ├── middlewares/      # JWT auth middleware
│   ├── migrations/       # Knex migration files
│   ├── models/           # Objection.js models
│   ├── services/         # Business logic, truy vấn DB
│   └── utils/            # Helper: response wrapper
├── app.js                # Express app setup
├── server.js             # Entry point
├── Dockerfile
└── package.json
```

## Cài đặt & Chạy

### Với Docker Compose (khuyến nghị)

```bash
# Từ root project
docker compose up --build --no-deps transaction-service -d
```

### Chạy local

```bash
cd services/transaction-service
cp .env.dev .env
npm install
npm run migrate:latest
node server.js
```

Service chạy tại `http://localhost:8082`.

## Biến môi trường

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `PORT` | Port lắng nghe | `8082` |
| `MYSQL_HOST` | Host MySQL | `mysql` |
| `MYSQL_USER` | User MySQL | `root` |
| `MYSQL_PASSWORD` | Password MySQL | `root` |
| `MYSQL_DATABASE` | Tên database | `transaction_db` |
| `JWT_SECRET` | Secret key verify JWT | `your_secret` |
| `INTERNAL_API_KEY` | Key cho internal service calls | `your_key` |
| `NOTIFICATION_SERVICE_URL` | URL notification service | `http://notification-service:8084` |

## Database Migration

```bash
# Chạy migration mới nhất
npm run migrate:latest

# Rollback migration gần nhất
npm run migrate:rollback

# Tạo migration mới
npm run migrate:make <tên_migration>

# Seed dữ liệu mẫu
npm run seed:run
```

## API Endpoints

Tất cả endpoints (trừ `/health`) yêu cầu header:
```
Authorization: Bearer <access_token>
```

### Health Check

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/health` | Không | Kiểm tra service còn sống |

**Response:**
```json
{ "status": "ok" }
```

---

### Giao dịch

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/transactions` | Lấy danh sách giao dịch theo tháng |
| POST | `/api/transactions` | Tạo giao dịch mới |
| GET | `/api/transactions/detail/:id` | Chi tiết một giao dịch |
| PUT | `/api/transactions/:id` | Cập nhật giao dịch |
| DELETE | `/api/transactions/:id` | Xoá giao dịch |

#### GET `/api/transactions`

Query params:

| Param | Kiểu | Mặc định | Mô tả |
|-------|------|----------|-------|
| `month` | integer (1–12) | Tháng hiện tại | Tháng cần lấy |
| `year` | integer | Năm hiện tại | Năm cần lấy |

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách giao dịch theo tháng thành công",
  "data": [
    {
      "id": 1,
      "user_id": 42,
      "type": "expense",
      "category": "food",
      "amount": 50000,
      "date": "2026-04-15",
      "note": "Ăn trưa",
      "created_at": "2026-04-15T10:00:00.000Z"
    }
  ]
}
```

#### POST `/api/transactions`

**Request body:**
```json
{
  "type": "expense",
  "category": "food",
  "amount": 50000,
  "date": "2026-04-15",
  "note": "Ăn trưa"
}
```

| Field | Bắt buộc | Kiểu | Mô tả |
|-------|----------|------|-------|
| `type` | ✅ | `income` \| `expense` | Loại giao dịch |
| `category` | ✅ | string | Danh mục |
| `amount` | ✅ | number (> 0) | Số tiền |
| `date` | ✅ | date (YYYY-MM-DD) | Ngày giao dịch |
| `note` | ❌ | string | Ghi chú |

Sau khi tạo thành công, service tự động publish event `TRANSACTION_CREATED` đến notification-service.

---

### Thống kê

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/transactions/stats/summary` | Tổng quan thu/chi/số dư theo tháng hoặc năm |
| GET | `/api/transactions/stats/monthly-summary` | Thu chi N tháng gần nhất |
| GET | `/api/transactions/stats/category` | Thống kê theo danh mục |

#### GET `/api/transactions/stats/summary`

Query params:

| Param | Kiểu | Mặc định | Mô tả |
|-------|------|----------|-------|
| `period` | `month` \| `year` | `month` | Loại thống kê |
| `month` | integer (1–12) | Tháng hiện tại | Bắt buộc nếu `period=month` |
| `year` | integer | Năm hiện tại | Năm cần thống kê |

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "month": 4,
    "year": 2026,
    "opening_balance": 1000000,
    "total_income": 5000000,
    "total_expense": 2000000,
    "closing_balance": 4000000
  }
}
```

> `opening_balance` = tổng thu - tổng chi của tất cả giao dịch **trước** kỳ thống kê.
> `closing_balance` = `opening_balance` + `total_income` - `total_expense`.

#### GET `/api/transactions/stats/monthly-summary`

Query params:

| Param | Kiểu | Mặc định | Mô tả |
|-------|------|----------|-------|
| `months` | integer (1–24) | `6` | Số tháng gần nhất |

**Response:**
```json
{
  "success": true,
  "data": {
    "months": 6,
    "data": [
      { "year": 2025, "month": 11, "total_income": 0, "total_expense": 0 },
      { "year": 2025, "month": 12, "total_income": 3000000, "total_expense": 1500000 },
      { "year": 2026, "month": 1,  "total_income": 4000000, "total_expense": 2000000 }
    ]
  }
}
```

Các tháng không có giao dịch vẫn được trả về với giá trị `0`.

#### GET `/api/transactions/stats/category`

Query params: `month`, `year` (tương tự GET `/api/transactions`).

**Response:**
```json
{
  "success": true,
  "data": [
    { "type": "expense", "category": "food", "total": 500000 },
    { "type": "income",  "category": "salary", "total": 5000000 }
  ]
}
```

---

## Response Format

Tất cả response đều theo chuẩn:

```json
{
  "success": true | false,
  "message": "Mô tả kết quả",
  "data": { ... }
}
```

Lỗi trả thêm field `code`:
```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "code": "ERROR_CODE"
}
```

## Authentication

Service tự verify JWT bằng `JWT_SECRET` — không gọi lại auth-service. Token được đọc từ header `Authorization: Bearer <token>`.

Middleware `authOrInternal` (chưa dùng trên route nào) cho phép internal service call bằng header `x-internal-key` kèm `x-user-id` thay vì JWT.
