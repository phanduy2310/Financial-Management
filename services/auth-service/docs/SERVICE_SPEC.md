# Đặc tả Auth Service

## 1. Mục đích
Auth service chịu trách nhiệm cho phần identity và authentication của hệ thống.

Service này phụ trách:
- đăng ký và đăng nhập người dùng
- cấp và làm mới JWT token
- trả về thông tin người dùng hiện tại
- cung cấp các endpoint tra cứu user cho nội bộ hệ thống
- quản lý luồng liên kết parent-child

Service này không phụ trách:
- quản lý đầy đủ user profile
- render hoặc hiển thị UI của notification
- business logic của các domain khác

## 2. Phạm vi
Trong phạm vi:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/users/find`
- `GET /api/auth/users/:id`
- `POST /api/auth/users/bulk`
- `POST /api/parent/children`
- `POST /api/parent/confirm`
- `GET /api/parent/children`

Ngoài phạm vi:
- chỉnh sửa profile ngoài các trường phục vụ auth
- workflow quản trị user cho admin
- triển khai rate limiting và audit trail
- phần xử lý bên trong của `notification-service`

## 3. Tech lựa chọn
- Runtime: Node.js
- Web framework: Express 5
- ORM/query layer: Objection.js + Knex.js
- Database: MySQL 8
- Auth: JWT access token + refresh token
- Password hashing: bcrypt
- Request validation: Joi
- Service-to-service HTTP: axios

## 4. Kiến trúc
Luồng xử lý request chính:

```text
client hoặc gateway
  -> routes
  -> controllers
  -> middleware
  -> models
  -> MySQL
```

Tích hợp ra ngoài:

```text
auth-service
  -> notification-service /internal/publish
```

Các module chính:
- `src/routes`: khai báo route
- `src/controllers`: xử lý request và business logic
- `src/middleware`: authentication và authorization
- `src/models`: ánh xạ bảng và relation
- `src/services`: logic tích hợp ra service khác
- `src/utils`: helper cho JWT

## 5. Dữ liệu sở hữu
Database sở hữu: `financial_auth`

### `users`
- `id`
- `fullname`
- `email` unique
- `password` đã hash
- `role`
- `refresh_token`
- `created_at`
- `updated_at`

### `parent_child_links`
- `id`
- `parent_id`
- `child_id`
- `status`: `pending | accepted | rejected`
- `accepted_at`
- `created_at`
- `updated_at`

### `parent_child_tokens`
- `id`
- `parent_child_id`
- `token` unique
- `expired_at`
- `used`
- `created_at`

## 6. Quy tắc chính
- `email` của user phải là duy nhất.
- `password` phải được lưu dưới dạng bcrypt hash, không lưu plain text.
- Access token có thời gian sống ngắn. Giá trị mặc định hiện tại trong env là `15m`.
- Refresh token có thời gian sống dài hơn. Giá trị mặc định hiện tại trong env là `7d`.
- Refresh token được lưu trong DB và trong `httpOnly` cookie.
- Chỉ user có role `parent` mới được thêm child.
- Parent không được mời chính tài khoản của mình.
- Mỗi cặp parent-child chỉ được có một relation đang hoạt động.
- Nếu relation bị `rejected` thì có thể tạo lại bằng một lời mời mới.
- Token xác nhận parent-child hết hạn sau 2 ngày.
- Lỗi gửi notification không được chặn việc tạo lời mời thành công.

## 7. Bề mặt API
Các endpoint public:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/parent/confirm`

Các endpoint protected:
- `GET /api/auth/me`
- `POST /api/parent/children` với role `parent`
- `GET /api/parent/children` với role `parent`

Các endpoint tra cứu nội bộ:
- `GET /api/auth/users/find`
- `GET /api/auth/users/:id`
- `POST /api/auth/users/bulk`

Lưu ý:
- Các endpoint tra cứu nội bộ phải được xem là contract chỉ dành cho nội bộ hệ thống.
- Cách bảo vệ các endpoint này cần được chốt rõ trước khi mở rộng sử dụng.

## 8. Phụ thuộc bên ngoài
Các env var bắt buộc:
- `PORT`
- `MYSQL_HOST`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES`
- `JWT_REFRESH_EXPIRES`
- `FRONTEND_URL`
- `NOTIFICATION_SERVICE_URL`
- `INTERNAL_API_KEY`

Phụ thuộc external service:
- `notification-service`
  - endpoint: `/internal/publish`
  - mục đích: publish event `PARENT_LINK_REQUEST`

## 9. Ghi chú về bảo mật
- Dùng `Authorization: Bearer <token>` cho các endpoint protected.
- Không trả `password` trong bất kỳ response payload nào.
- Chính sách cookie hiện tại phù hợp cho local-dev; chính sách production cần được định nghĩa riêng.
- Kiểm tra role được thực hiện trong middleware.
- Các endpoint nội bộ không được xem là public API.

## 10. Checklist trước khi code
Trước khi viết mới hoặc mở rộng code, cần xác nhận:
- ranh giới service: auth và parent-child có còn thuộc cùng một service hay không
- ma trận role: `user`, `parent` và các hành động được phép
- chính sách token: expiry, rotation, logout, hành vi multi-device
- API response contract: format `success/error` thống nhất cho mọi endpoint
- cách bảo vệ internal API: chỉ qua gateway, dùng internal key, hay service mesh policy
- DB constraints và index đã đủ cho các query dự kiến hay chưa
- hành vi khi `notification-service` bị down
- các test case bắt buộc cho auth flow và parent-child flow

## 11. Thứ tự triển khai đề xuất
1. Chốt API contract và business rules.
2. Thiết kế bảng và migration.
3. Tạo model và relation.
4. Implement JWT helper và auth middleware.
5. Implement các auth endpoint.
6. Implement transaction flow cho parent-child.
7. Thêm integration gọi ra notification-service.
8. Bổ sung test, logging và docs.

