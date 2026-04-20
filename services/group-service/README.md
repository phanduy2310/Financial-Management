# Group Service

Microservice quản lý nhóm chi tiêu chung. Cho phép tạo nhóm, quản lý thành viên, ghi nhận giao dịch nhóm và chia tiền (split bill) giữa các thành viên.

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express 5
- **ORM:** Objection.js + Knex
- **Database:** MySQL 8
- **Auth:** JWT (verify tại service, không gọi lại auth-service)
- **Internal calls:** Gọi auth-service qua `x-internal-key` để lấy fullname thành viên

## Cấu trúc thư mục

```
group-service/
├── src/
│   ├── clients/          # HTTP client gọi auth-service (lấy fullname user)
│   ├── config/           # Knex config, kết nối DB
│   ├── controllers/      # Xử lý request/response
│   │   ├── group.js
│   │   ├── group_member.js
│   │   └── group_transaction.js
│   ├── middlewares/      # JWT auth middleware
│   ├── migrations/       # Knex migration files
│   ├── models/           # Objection.js models
│   ├── routes/           # Express routers
│   ├── seeds/            # Seed dữ liệu mẫu
│   ├── services/         # Business logic, truy vấn DB
│   └── utils/            # Helper: response wrapper
├── src/app.js            # Express app setup
├── server.js             # Entry point
├── Dockerfile
└── package.json
```

## Cài đặt & Chạy

### Với Docker Compose (khuyến nghị)

```bash
# Từ root project
docker compose up --build --no-deps group-service -d
```

### Chạy local

```bash
cd services/group-service
cp .env.dev .env
npm install
npm run migrate:latest
node server.js
```

Service chạy tại `http://localhost:8085`.

## Biến môi trường

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `PORT` | Port lắng nghe | `8085` |
| `MYSQL_HOST` | Host MySQL | `mysql` |
| `MYSQL_USER` | User MySQL | `root` |
| `MYSQL_PASSWORD` | Password MySQL | `root` |
| `MYSQL_DATABASE` | Tên database | `group_db` |
| `JWT_SECRET` | Secret key verify JWT | `your_secret` |
| `AUTH_SERVICE_URL` | URL auth-service (internal) | `http://auth-service:8081` |
| `INTERNAL_API_KEY` | Key cho internal service calls | `your_key` |

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

### Nhóm (Groups)

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/groups/my-groups` | Member | Danh sách nhóm của user hiện tại |
| POST | `/api/groups` | Bất kỳ | Tạo nhóm mới |
| PATCH | `/api/groups/:id` | Owner | Cập nhật thông tin nhóm |
| DELETE | `/api/groups/:id` | Owner | Xoá nhóm |

#### GET `/api/groups/my-groups`

Trả về tất cả nhóm mà user đang là thành viên (bao gồm cả nhóm do user tạo).

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách nhóm thành công",
  "data": [
    {
      "id": 1,
      "name": "Nhóm phòng trọ",
      "description": "Chi tiêu chung tháng 4",
      "owner_id": 42,
      "member_count": 3,
      "created_at": "2026-04-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/groups`

User tạo nhóm sẽ tự động trở thành **owner** và được thêm vào danh sách thành viên.

**Request body:**
```json
{
  "name": "Nhóm phòng trọ",
  "description": "Chi tiêu chung tháng 4"
}
```

| Field | Bắt buộc | Mô tả |
|-------|----------|-------|
| `name` | ✅ | Tên nhóm |
| `description` | ❌ | Mô tả nhóm |

#### PATCH `/api/groups/:id`

Chỉ owner mới có quyền cập nhật. Chỉ cần gửi các field muốn thay đổi.

**Request body:**
```json
{
  "name": "Tên mới",
  "description": "Mô tả mới"
}
```

---

### Thành viên (Members)

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/groups/:group_id/members` | Member | Danh sách thành viên |
| POST | `/api/groups/:group_id/members` | Owner | Thêm thành viên |
| DELETE | `/api/groups/:group_id/members/:user_id` | Owner / Chính mình | Xoá thành viên hoặc tự rời nhóm |

#### GET `/api/groups/:group_id/members`

Trả về danh sách thành viên kèm `fullname` (lấy từ auth-service qua internal call).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "group_id": 1,
      "user_id": 42,
      "role": "owner",
      "fullname": "Nguyễn Văn A",
      "created_at": "2026-04-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "group_id": 1,
      "user_id": 43,
      "role": "member",
      "fullname": "Trần Thị B",
      "created_at": "2026-04-02T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/groups/:group_id/members`

Chỉ owner mới có quyền thêm. Trả về 409 nếu user đã là thành viên.

**Request body:**
```json
{
  "user_id": 43
}
```

#### DELETE `/api/groups/:group_id/members/:user_id`

- **Owner** có thể xoá bất kỳ thành viên nào (trừ chính mình).
- **Thành viên** có thể tự rời nhóm.
- **Owner không thể tự rời nhóm** (chưa có cơ chế chuyển quyền owner).

---

### Giao dịch nhóm (Group Transactions)

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/groups/:group_id/transactions` | Member | Danh sách giao dịch của nhóm |
| POST | `/api/groups/:group_id/transactions` | Member | Tạo giao dịch nhóm |
| GET | `/api/groups/:group_id/transactions/summary` | Member | Thống kê tổng thu/chi nhóm |
| GET | `/api/groups/:group_id/transactions/:transaction_id` | Member | Chi tiết giao dịch kèm shares |

#### POST `/api/groups/:group_id/transactions`

Chỉ thành viên nhóm mới có thể tạo giao dịch. Hỗ trợ chia tiền (split bill) qua field `shares`.

**Request body:**
```json
{
  "type": "expense",
  "category": "food",
  "amount": 300000,
  "date": "2026-04-15",
  "note": "Ăn tối cả nhóm",
  "shares": [
    { "user_id": 42, "amount": 100000 },
    { "user_id": 43, "amount": 100000 },
    { "user_id": 44, "amount": 100000 }
  ]
}
```

| Field | Bắt buộc | Kiểu | Mô tả |
|-------|----------|------|-------|
| `type` | ✅ | `income` \| `expense` | Loại giao dịch |
| `category` | ✅ | string | Danh mục |
| `amount` | ✅ | number (> 0) | Tổng số tiền |
| `date` | ✅ | date (YYYY-MM-DD) | Ngày giao dịch |
| `note` | ❌ | string | Ghi chú |
| `shares` | ❌ | array | Danh sách chia tiền. Nếu bỏ qua, giao dịch không có share |

**Response:**
```json
{
  "success": true,
  "message": "Thêm giao dịch nhóm thành công",
  "data": { "transaction_id": 7 }
}
```

#### GET `/api/groups/:group_id/transactions/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "group_id": 1,
    "total_income": 500000,
    "total_expense": 300000,
    "closing_balance": 200000
  }
}
```

#### GET `/api/groups/:group_id/transactions/:transaction_id`

Trả về chi tiết giao dịch kèm thông tin người tạo và danh sách chia tiền, mỗi share có `fullname` của user (lấy từ auth-service).

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": 7,
      "group_id": 1,
      "user_id": 42,
      "type": "expense",
      "category": "food",
      "amount": 300000,
      "date": "2026-04-15",
      "note": "Ăn tối cả nhóm",
      "user": { "id": 42, "fullname": "Nguyễn Văn A" }
    },
    "shares": [
      { "id": 1, "transaction_id": 7, "user_id": 42, "amount": 100000, "user": { "id": 42, "fullname": "Nguyễn Văn A" } },
      { "id": 2, "transaction_id": 7, "user_id": 43, "amount": 100000, "user": { "id": 43, "fullname": "Trần Thị B" } }
    ]
  }
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

## Phân quyền

| Hành động | Owner | Member |
|-----------|-------|--------|
| Xem danh sách nhóm | ✅ | ✅ |
| Cập nhật / Xoá nhóm | ✅ | ❌ |
| Xem thành viên | ✅ | ✅ |
| Thêm thành viên | ✅ | ❌ |
| Xoá thành viên khác | ✅ | ❌ |
| Tự rời nhóm | ❌ (owner) | ✅ |
| Xem / Tạo giao dịch | ✅ | ✅ |
| Xem thống kê nhóm | ✅ | ✅ |

## Internal Service Communication

Group service gọi auth-service để lấy `fullname` của các user khi trả về danh sách thành viên và chi tiết giao dịch. Request dùng `x-internal-key` header, không cần JWT.

```
group-service → POST http://auth-service:8081/api/auth/users/bulk
                Headers: x-internal-key: <INTERNAL_API_KEY>
                Body: { "ids": [42, 43, 44] }
```

Nếu auth-service không phản hồi, service vẫn hoạt động bình thường — `fullname` sẽ trả về `null` thay vì báo lỗi.
