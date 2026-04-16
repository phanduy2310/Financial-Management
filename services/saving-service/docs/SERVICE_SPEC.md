# Đặc tả Saving Service

## 1. Mục đích
Saving service chịu trách nhiệm cho bounded context `wealth`, tập trung vào:
- quản lý kế hoạch tiết kiệm theo mục tiêu
- ghi nhận các lần đóng góp vào kế hoạch tiết kiệm
- quản lý kế hoạch trả góp riêng biệt cho người dùng
- ghi nhận lịch sử thanh toán trả góp
- phát sinh transaction khi hoàn thành mục tiêu tiết kiệm hoặc thanh toán kỳ trả góp
- phát notification khi hoàn thành kế hoạch hoặc khi khoản trả góp sắp hoàn tất

Service này không phụ trách:
- xác thực hoặc phân quyền người dùng ở cấp service
- quản lý số dư ví/tài khoản tổng
- quản lý danh mục giao dịch tài chính đầy đủ
- orchestration notification UI hoặc delivery logic bên trong `notification-service`

## 2. Phạm vi
Trong phạm vi:
- `GET /health`
- `POST /api/saving`
- `GET /api/saving/all`
- `GET /api/saving/:user_id`
- `GET /api/saving/:user_id/stats`
- `GET /api/saving/:user_id/top`
- `GET /api/saving/:id/history`
- `PUT /api/saving/:id/progress`
- `PUT /api/saving/:id/complete`
- `PUT /api/saving/:id`
- `DELETE /api/saving/:id`
- `POST /api/saving/:saving_plan_id/installments`
- `GET /api/saving/:saving_plan_id/installments`
- `DELETE /api/saving/installments/:id`
- `POST /api/installment`
- `GET /api/installment/:user_id`
- `GET /api/installment/detail/:id`
- `GET /api/installment/stats/:user_id`
- `GET /api/installment/top/:user_id`
- `GET /api/installment/history/:id`
- `GET /api/installment/payments/chart/:user_id`
- `PATCH /api/installment/:id/pay`
- `PATCH /api/installment/:id/update`
- `DELETE /api/installment/:id`

Ngoài phạm vi:
- xác minh user id có tồn tại hay không từ `auth-service`
- xử lý ledger/accounting chính xác kiểu double-entry
- đồng bộ hóa trạng thái giao dịch nếu `transaction-service` xử lý bất đồng bộ
- scheduler nhắc hạn định kỳ cho saving/installment
- reporting tài chính đa chiều ngoài các endpoint thống kê hiện có

## 3. Tech lựa chọn
- Runtime: Node.js
- Web framework: Express 5
- ORM/query layer: Objection.js + Knex.js
- Database: MySQL 8
- HTTP client gọi service khác: axios
- Logging HTTP: morgan
- CORS: cors
- Config: dotenv

## 4. Kiến trúc
Luồng xử lý request chính:

```text
client hoặc gateway
  -> routes
  -> controllers
  -> models
  -> MySQL
```

Tích hợp ra ngoài:

```text
saving-service
  -> transaction-service /api/transactions
  -> notification-service /internal/publish
```

Các module chính:
- `src/routes`: khai báo route cho saving plan và installment plan
- `src/controllers`: xử lý request, business rules và orchestration gọi service ngoài
- `src/models`: ánh xạ bảng `saving_plans`, `saving_installments`, `installment_plans`, `installment_payments`
- `src/clients`: client tái sử dụng để gọi `transaction-service` và `notification-service`
- `src/config`: khởi tạo kết nối Knex/Objection
- `src/migrations`: định nghĩa schema DB

Lưu ý kiến trúc:
- Service hiện không có auth middleware nội bộ; xác thực được giả định đã xử lý ở gateway.
- Nhiều endpoint nhận `user_id` trực tiếp từ path hoặc body, nên boundary tin cậy giữa gateway và service cần được chốt rõ.

## 5. Dữ liệu sở hữu
Database sở hữu: `financial_saving`

### `saving_plans`
- `id`
- `user_id`
- `title`
- `target_amount`
- `current_amount`
- `start_date`
- `end_date`
- `completed`
- `progress_percentage`
- `created_at`
- `updated_at`

### `saving_installments`
- `id`
- `saving_plan_id`
- `amount`
- `note`
- `payment_date`
- `created_at`
- `updated_at`

### `installment_plans`
- `id`
- `user_id`
- `title`
- `total_amount`
- `paid_amount`
- `monthly_payment`
- `start_date`
- `end_date`
- `current_term`
- `total_terms`
- `completed`
- `progress_percentage`
- `created_at`
- `updated_at`

### `installment_payments`
- `id`
- `plan_id`
- `term_number`
- `amount`
- `note`
- `pay_date`
- `created_at`
- `updated_at`

## 6. Quy tắc chính
- Saving plan bắt buộc có `user_id`, `title`, `target_amount`, `start_date`, `end_date`.
- Khi tạo saving plan, `current_amount` khởi tạo bằng `0` và `completed` khởi tạo bằng `false`.
- `progress_percentage` của saving plan và installment plan luôn bị chặn tối đa ở `100`.
- Nếu `current_amount >= target_amount` thì saving plan được xem là hoàn thành.
- `PUT /api/saving/:id/progress` có thể vừa cập nhật tiến độ vừa đánh dấu hoàn thành nếu đạt mục tiêu.
- Khi saving plan chuyển sang hoàn thành qua `updateProgress` hoặc `markCompleted`, service phải gọi `transaction-service` để tạo transaction loại `expense`.
- Nếu gọi `transaction-service` thất bại trong luồng hoàn thành saving plan, request phải fail; riêng `markCompleted` còn rollback trạng thái completed trong DB.
- Notification cho sự kiện hoàn thành saving plan là fire-and-forget; lỗi notification không chặn luồng chính.
- Mỗi lần thêm một bản ghi `saving_installments`, `current_amount` và `progress_percentage` của saving plan phải được cộng dồn tương ứng.
- Xóa một `saving_installments` phải trừ lại `current_amount`, tính lại `progress_percentage` và cập nhật lại cờ `completed`.
- Installment plan bắt buộc có `user_id`, `title`, `total_amount`, `monthly_payment`, `start_date`, `end_date`, `total_terms`.
- Khi tạo installment plan, `paid_amount = 0`, `current_term = 0`, `completed = false`.
- `PATCH /api/installment/:id/pay` chỉ được phép chạy khi plan chưa hoàn thành và `current_term < total_terms`.
- Mỗi lần thanh toán kỳ trả góp sẽ tăng `current_term` thêm 1, cộng `monthly_payment` vào `paid_amount` và ghi lịch sử vào `installment_payments`.
- `paid_amount` không được vượt quá `total_amount`; nếu cộng dồn vượt ngưỡng thì phải chặn ở đúng `total_amount`.
- Installment plan được xem là hoàn thành nếu `paid_amount >= total_amount` hoặc `current_term >= total_terms`.
- Trong luồng thanh toán installment, service gọi `transaction-service` trước khi ghi DB để tránh trạng thái đã lưu kế hoạch nhưng thiếu transaction.
- Nếu gọi `transaction-service` thất bại khi thanh toán installment, request phải fail và không ghi payment history.
- Notification của installment hiện dùng event `INSTALLMENT_DUE_SOON` cho cả trường hợp sắp hoàn thành và đã hoàn thành; đây là behavior hiện tại của code.

## 7. Bề mặt API
Các endpoint public nội bộ sau gateway:
- `GET /health`
- toàn bộ nhóm `/api/saving`
- toàn bộ nhóm `/api/installment`

Các nhóm chức năng chính:
- Saving plans
  - tạo, sửa, xóa kế hoạch
  - lấy danh sách theo user hoặc toàn hệ thống
  - thống kê tổng quan và top plan theo tiến độ
  - cập nhật tiến độ thủ công hoặc đánh dấu hoàn thành
- Saving installments
  - thêm/xóa các lần đóng góp cho saving plan
  - lấy lịch sử đóng góp theo kế hoạch
- Installment plans
  - tạo, sửa, xóa khoản trả góp
  - thanh toán từng kỳ
  - xem thống kê, top plan, chi tiết và lịch sử thanh toán
  - dựng dữ liệu chart thanh toán theo ngày

Lưu ý:
- OpenAPI hiện nằm tại `docs/api-specs/saving-service.yaml`.
- Code hiện có `DELETE /api/saving/installments/:id` nhưng endpoint này chưa xuất hiện trong file OpenAPI; cần đồng bộ lại contract nếu dùng chính thức.
- Service hiện không kiểm tra quyền sở hữu tài nguyên theo `user_id` tại lớp controller.

## 8. Phụ thuộc bên ngoài
Các env var bắt buộc:
- `PORT`
- `MYSQL_HOST`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `TRANSACTION_SERVICE_URL`
- `NOTIFICATION_SERVICE_URL`
- `INTERNAL_API_KEY`

Các env var có hỗ trợ nhưng không bắt buộc:
- `SERVICE_REQUEST_TIMEOUT_MS`

Phụ thuộc external service:
- `transaction-service`
  - endpoint: `/api/transactions`
  - mục đích:
    - ghi transaction khi hoàn thành saving plan
    - ghi transaction khi thanh toán một kỳ trả góp
- `notification-service`
  - endpoint: `/internal/publish`
  - mục đích:
    - publish event `SAVING_PLAN_COMPLETED`
    - publish event `INSTALLMENT_DUE_SOON`

## 9. Ghi chú về bảo mật
- Service hiện dựa vào gateway cho xác thực; bản thân service chưa verify JWT hay session.
- Các request đi sang `notification-service` dùng header `x-internal-key`.
- Vì service nhận `user_id` trực tiếp từ client/gateway, cần tránh để client giả mạo `user_id` nếu gateway chưa gắn context user đáng tin cậy.
- Các endpoint mutation hiện chưa có validation schema chuyên biệt ở tầng route/controller ngoài các kiểm tra required field thủ công.
- Các route lấy toàn bộ dữ liệu như `GET /api/saving/all` cần được xem là endpoint nội bộ hoặc admin-only nếu đưa vào production.

## 10. Checklist trước khi code
Trước khi viết mới hoặc mở rộng code, cần xác nhận:
- saving plan và installment plan có tiếp tục nằm chung một service hay sẽ tách bounded context
- contract chuẩn cho response `success/error` giữa các endpoint
- quyền truy cập: user có được phép đọc/sửa/xóa mọi bản ghi mang `user_id` của chính mình hay không
- validation rule cho số tiền, ngày bắt đầu/kết thúc, `total_terms`, `monthly_payment`
- có cần idempotency cho các API thanh toán và hoàn thành kế hoạch hay không
- policy nhất quán khi `transaction-service` lỗi: rollback ở mức nào, có retry hay outbox hay không
- event name cho installment hoàn thành có nên tách khỏi `INSTALLMENT_DUE_SOON`
- đồng bộ OpenAPI với code hiện tại, đặc biệt với route xóa `saving_installments`
- index DB cho các query phổ biến theo `user_id`, `saving_plan_id`, `plan_id`
- test case bắt buộc cho các luồng hoàn thành mục tiêu, rollback khi transaction lỗi, và cập nhật progress/history

## 11. Thứ tự triển khai đề xuất
1. Chốt API contract và business rules cho saving plan, saving installments và installment plan.
2. Chốt ownership/security model giữa gateway và service.
3. Thiết kế migration, foreign key và index.
4. Hoàn thiện validation input ở route/controller.
5. Implement đầy đủ flow tạo, cập nhật, xóa và thống kê.
6. Chuẩn hóa integration với `transaction-service` và `notification-service`.
7. Đồng bộ OpenAPI, README và service spec.
8. Bổ sung test cho các case thành công, lỗi tích hợp và edge case progress/payment.
