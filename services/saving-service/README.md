# saving-service

> **Bounded Context**: Wealth — quản lý kế hoạch tiết kiệm, các khoản đóng góp vào kế hoạch và các khoản trả góp của người dùng.

## Overview

`saving-service` chịu trách nhiệm cho hai nhóm nghiệp vụ chính:

- **Saving plans**: tạo kế hoạch tiết kiệm theo mục tiêu, theo dõi tiến độ và đánh dấu hoàn thành.
- **Saving installments**: ghi nhận các lần đóng góp vào kế hoạch tiết kiệm.
- **Installment plans**: quản lý khoản trả góp, thanh toán từng kỳ và xem lịch sử thanh toán.

Ngoài CRUD và thống kê, service này còn tích hợp với:

- `transaction-service` để tạo transaction khi hoàn thành kế hoạch tiết kiệm hoặc thanh toán một kỳ trả góp.
- `notification-service` để publish event thông báo khi kế hoạch hoàn thành hoặc khoản trả góp sắp hoàn thành/đã hoàn thành.

Service hiện **không tự xác thực JWT** ở cấp service. Các endpoint được giả định đi qua gateway hoặc một trusted caller phía trước.

**Database sở hữu**: `financial_saving`

**Các bảng chính**:

- `saving_plans`
- `saving_installments`
- `installment_plans`
- `installment_payments`

## Business Problem

Trong đời sống thực tế, người dùng thường có các mục tiêu tài chính như mua laptop, đi du lịch, lập quỹ khẩn cấp hoặc chuẩn bị học phí, nhưng rất khó theo dõi chính xác mình đã tiết kiệm được bao nhiêu và còn cách mục tiêu bao xa. Tương tự, với các khoản mua trả góp như điện thoại, xe máy hoặc thiết bị học tập, người dùng cũng dễ quên mình đã trả đến kỳ nào, còn nợ bao nhiêu và khoản nào sắp hoàn thành.

`saving-service` được xây ra để giải quyết chính bài toán đó. Service này biến các cam kết tài chính cá nhân thành dữ liệu có thể quản lý được: tạo kế hoạch tiết kiệm, ghi nhận từng lần đóng góp, tính tiến độ hoàn thành, theo dõi khoản trả góp theo từng kỳ và cung cấp thống kê tổng quan để người dùng biết mình đang ở đâu trên hành trình tài chính của mình.

Nói ngắn gọn, service này giúp trả lời các câu hỏi rất thực tế:

- Tôi đang tiết kiệm cho mục tiêu nào?
- Tôi đã góp được bao nhiêu và còn thiếu bao nhiêu?
- Tôi còn bao nhiêu kỳ trả góp chưa thanh toán?
- Kế hoạch hoặc khoản trả góp nào sắp hoàn thành nhất?

## Tech Stack

| Component | Choice |
|-----------|--------|
| Language | Node.js |
| Framework | Express 5 |
| ORM / Query Builder | Objection.js + Knex.js |
| Database | MySQL 8 |
| HTTP Client | axios |
| Logging | morgan |
| Runtime port | `8083` mặc định |

## API Overview

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

### Saving Plans — prefix `/api/saving`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/saving` | Tạo kế hoạch tiết kiệm mới |
| GET | `/api/saving/all` | Lấy tất cả kế hoạch tiết kiệm |
| GET | `/api/saving/:user_id` | Lấy danh sách kế hoạch của user |
| GET | `/api/saving/:user_id/stats` | Lấy thống kê saving plans của user |
| GET | `/api/saving/:user_id/top` | Lấy tối đa 3 kế hoạch có tiến độ cao nhất |
| GET | `/api/saving/:id/history` | Lấy lịch sử tiến độ của kế hoạch |
| PUT | `/api/saving/:id/progress` | Cập nhật `current_amount` |
| PUT | `/api/saving/:id/complete` | Đánh dấu kế hoạch hoàn thành |
| PUT | `/api/saving/:id` | Cập nhật thông tin kế hoạch |
| DELETE | `/api/saving/:id` | Xóa kế hoạch |

### Saving Installments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/saving/:saving_plan_id/installments` | Thêm khoản đóng góp vào saving plan |
| GET | `/api/saving/:saving_plan_id/installments` | Lấy danh sách khoản đóng góp của plan |
| DELETE | `/api/saving/installments/:id` | Xóa một khoản đóng góp |

### Installment Plans — prefix `/api/installment`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/installment` | Tạo khoản trả góp mới |
| GET | `/api/installment/:user_id` | Lấy danh sách khoản trả góp của user |
| GET | `/api/installment/detail/:id` | Lấy chi tiết khoản trả góp |
| GET | `/api/installment/stats/:user_id` | Lấy thống kê khoản trả góp |
| GET | `/api/installment/top/:user_id` | Lấy tối đa 3 khoản trả góp có tiến độ cao nhất |
| GET | `/api/installment/history/:id` | Lấy lịch sử thanh toán |
| GET | `/api/installment/payments/chart/:user_id` | Lấy dữ liệu chart thanh toán theo ngày |
| PATCH | `/api/installment/:id/pay` | Thanh toán kỳ tiếp theo |
| PATCH | `/api/installment/:id/update` | Cập nhật thông tin khoản trả góp |
| DELETE | `/api/installment/:id` | Xóa khoản trả góp và lịch sử liên quan |

> Full API contract:
>
> - [docs/SERVICE_SPEC.md](docs/SERVICE_SPEC.md)
> - [../../docs/api-specs/saving-service.yaml](../../docs/api-specs/saving-service.yaml)

## Prerequisites

Trước khi chạy service này, bạn nên có:

- Node.js 20+
- npm 10+
- MySQL 8+
- Database `financial_saving`
- `transaction-service` đang chạy và reachable từ `saving-service`
- `notification-service` nếu bạn muốn kiểm thử luồng publish notification

## Environment Variables

Service này đọc cấu hình từ file **`.env.dev`** trong thư mục `services/saving-service`.

> Lưu ý quan trọng: code hiện tại load **`.env.dev`**, không phải `.env`.

### Bắt buộc

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port chạy service | `8083` |
| `MYSQL_HOST` | MySQL hostname | `127.0.0.1` |
| `MYSQL_USER` | MySQL username | `root` |
| `MYSQL_PASSWORD` | MySQL password | `secret` |
| `MYSQL_DATABASE` | Tên database của service | `financial_saving` |
| `TRANSACTION_SERVICE_URL` | Base URL của `transaction-service` | `http://localhost:8082` |

### Tùy chọn nhưng nên có

| Variable | Description | Example |
|----------|-------------|---------|
| `NOTIFICATION_SERVICE_URL` | Base URL của `notification-service` | `http://localhost:8084` |
| `INTERNAL_API_KEY` | Header `x-internal-key` khi publish notification | `dev-internal-key` |
| `SERVICE_REQUEST_TIMEOUT_MS` | Timeout khi gọi service khác | `5000` |

### Sample `.env.dev`

```env
PORT=8083

MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_DATABASE=financial_saving

TRANSACTION_SERVICE_URL=http://localhost:8082
NOTIFICATION_SERVICE_URL=http://localhost:8084
INTERNAL_API_KEY=dev-internal-key
SERVICE_REQUEST_TIMEOUT_MS=5000
```

## Running Locally

### 1. Cài dependencies

```bash
cd services/saving-service
npm install
```

### 2. Tạo file `.env.dev`

Tạo file `services/saving-service/.env.dev` theo mẫu ở trên.

### 3. Chạy migrations

```bash
npx knex migrate:latest --knexfile knexfile.js
```

Nếu muốn rollback migration gần nhất:

```bash
npx knex migrate:rollback --knexfile knexfile.js
```

### 4. Khởi động service

Chạy development mode với `nodemon`:

```bash
npm run dev
```

Hoặc chạy trực tiếp bằng Node.js:

```bash
node server.js
```

Mặc định service lắng nghe ở:

```text
http://localhost:8083
```

### 5. Kiểm tra health check

```bash
curl http://localhost:8083/health
```

Expected response:

```json
{
  "status": "ok"
}
```

## Running With Docker

### Build image

```bash
cd services/saving-service
docker build -t saving-service .
```

### Run migrations bằng container

```bash
docker run --rm --env-file .env.dev saving-service npx knex migrate:latest --knexfile knexfile.js
```

### Start container

```bash
docker run --rm -p 8083:8083 --env-file .env.dev saving-service
```

> Nếu MySQL chạy trên máy host và bạn chạy `saving-service` trong Docker, giá trị `MYSQL_HOST` có thể cần đổi thành `host.docker.internal` thay vì `127.0.0.1`.

## Test

Chạy toàn bộ test:

```bash
npm test
```

Hiện tại service có test cho:

- validator request
- domain aggregate / policy
- application flow của saving plan
- application flow của installment plan

## Project Structure

```text
saving-service/
├── Dockerfile
├── knexfile.js
├── package.json
├── server.js
├── README.md
├── docs/
│   └── SERVICE_SPEC.md
├── src/
│   ├── app.js
│   ├── application/
│   ├── clients/
│   ├── config/
│   ├── controllers/
│   ├── domain/
│   ├── migrations/
│   ├── models/
│   ├── routes/
│   └── utils/
└── test/
```

## Common Workflow

Một vòng làm việc local điển hình:

1. Bảo đảm MySQL, `transaction-service` và tùy chọn `notification-service` đang chạy.
2. Cập nhật `services/saving-service/.env.dev`.
3. Chạy `npx knex migrate:latest --knexfile knexfile.js`.
4. Chạy `npm run dev`.
5. Gọi `GET /health`.
6. Dùng Postman, curl hoặc frontend để test các endpoint.

## Common Issues

### Service không boot vì thiếu `TRANSACTION_SERVICE_URL`

Code hiện tại khởi tạo HTTP client cho `transaction-service` ngay khi import module. Nếu thiếu biến này, service sẽ fail khi startup. Hãy kiểm tra lại file `.env.dev`.

### Health check lên nhưng API business lỗi DB

`GET /health` chỉ xác nhận app đang chạy. Nếu DB chưa tạo hoặc chưa migrate, các API nghiệp vụ vẫn sẽ lỗi. Hãy tạo database `financial_saving` và chạy migration trước.

### Notification không gửi đi

`NOTIFICATION_SERVICE_URL` không bắt buộc để app boot. Nếu thiếu biến này, luồng publish notification sẽ bị bỏ qua. Nếu có cấu hình notification, hãy chắc rằng `INTERNAL_API_KEY` cũng đúng.

### Đổi `.env` nhưng app không nhận

Service không đọc `.env` mặc định. Hãy sửa đúng file `.env.dev`.

## Related Docs

- [docs/SERVICE_SPEC.md](docs/SERVICE_SPEC.md)
- [../../docs/api-specs/saving-service.yaml](../../docs/api-specs/saving-service.yaml)
- [../../README.md](../../README.md)
