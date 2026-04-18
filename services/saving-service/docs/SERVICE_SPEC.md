# Đặc tả Saving Service

## 1. Mục đích
`saving-service` quản lý hai nhóm nghiệp vụ chính:

- Saving plans: kế hoạch tiết kiệm theo mục tiêu.
- Saving installments: các lần đóng góp vào một kế hoạch tiết kiệm.
- Installment plans: các khoản trả góp và lịch sử thanh toán từng kỳ.

Ngoài CRUD và thống kê, service này còn gọi ra:

- `transaction-service` để tạo transaction khi hoàn thành kế hoạch tiết kiệm hoặc thanh toán một kỳ trả góp.
- `notification-service` để phát notification khi kế hoạch hoàn thành hoặc khoản trả góp sắp hoàn thành/đã hoàn thành.

## 2. Quy ước chung
- Base path nội bộ:
  - `/health`
  - `/api/saving`
  - `/api/installment`
- Content type: `application/json`
- Không có query params ở các endpoint hiện tại.
- Các endpoint đọc dữ liệu thường trả thẳng object hoặc array từ DB.
- Các endpoint tạo/cập nhật/xóa thường trả object dạng `{ message, ... }`.

### Format lỗi hiện tại
- Lỗi validation request thường trả:

```json
{
  "message": "Du lieu khong hop le",
  "error": [
    "..."
  ]
}
```

- Lỗi domain như không tìm thấy dữ liệu thường trả:

```json
{
  "message": "Không tìm thấy ..."
}
```

- Một số lỗi server nội bộ hoặc lỗi không được bọc lại trả:

```json
{
  "error": "..."
}
```

- Một số lỗi downstream service được bọc lại trả:

```json
{
  "message": "Thanh toán kỳ nhưng tạo transaction thất bại",
  "error": "..."
}
```

## 3. Tài nguyên chính

### 3.1 `SavingPlan`

```json
{
  "id": 1,
  "user_id": 7,
  "title": "Mua laptop",
  "target_amount": 30000000,
  "current_amount": 5000000,
  "start_date": "2026-04-01",
  "end_date": "2026-12-31",
  "completed": false,
  "progress_percentage": 16.67,
  "created_at": "2026-04-18T03:10:00.000Z",
  "updated_at": "2026-04-18T03:10:00.000Z"
}
```

### 3.2 `SavingInstallment`

```json
{
  "id": 12,
  "saving_plan_id": 1,
  "amount": 1000000,
  "note": "Đóng góp tháng 4",
  "payment_date": "2026-04-18 10:00:00",
  "created_at": "2026-04-18T03:10:00.000Z",
  "updated_at": "2026-04-18T03:10:00.000Z"
}
```

### 3.3 `InstallmentPlan`

```json
{
  "id": 3,
  "user_id": 7,
  "title": "Trả góp điện thoại",
  "total_amount": 24000000,
  "paid_amount": 8000000,
  "monthly_payment": 2000000,
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "current_term": 4,
  "total_terms": 12,
  "completed": false,
  "progress_percentage": 33.33,
  "created_at": "2026-04-18T03:10:00.000Z",
  "updated_at": "2026-04-18T03:10:00.000Z"
}
```

### 3.4 `InstallmentPayment`

```json
{
  "id": 21,
  "plan_id": 3,
  "term_number": 5,
  "amount": 2000000,
  "note": "Thanh toán kỳ 5 (18/04/2026)",
  "pay_date": "2026-04-18 10:00:00",
  "created_at": "2026-04-18T03:10:00.000Z",
  "updated_at": "2026-04-18T03:10:00.000Z"
}
```

### 3.5 `SavingProgressPoint`
Dùng cho endpoint lịch sử tiến độ saving.

```json
{
  "date": "2026-04-18",
  "progress": 33.33
}
```

### 3.6 `InstallmentHistoryPoint`
Dùng cho endpoint lịch sử thanh toán trả góp.

```json
{
  "date": "18/04/2026",
  "amount": 2000000,
  "term": 5,
  "note": "Thanh toán kỳ 5 (18/04/2026)"
}
```

### 3.7 `InstallmentChartPoint`
Dùng cho endpoint chart thanh toán trả góp.

```json
{
  "date": "18/04/2026",
  "amount": 4000000
}
```

## 4. API contract chi tiết

### 4.1 Health

#### `GET /health`
- Mục đích: kiểm tra service còn hoạt động hay không.
- Đầu vào: không có.
- Đầu ra `200`:

```json
{
  "status": "ok"
}
```

### 4.2 Saving plan APIs

#### `POST /api/saving`
- Mục đích: tạo kế hoạch tiết kiệm mới.
- Body bắt buộc:
  - `user_id`: số nguyên dương.
  - `title`: chuỗi không rỗng.
  - `target_amount`: số dương.
  - `start_date`: định dạng `YYYY-MM-DD`.
  - `end_date`: định dạng `YYYY-MM-DD`.
- Không được gửi các field: `current_amount`, `completed`, `progress_percentage`.
- Đầu ra `201`:

```json
{
  "message": "Tạo kế hoạch thành công",
  "plan": {
    "id": 1,
    "user_id": 7,
    "title": "Mua laptop",
    "target_amount": 30000000,
    "current_amount": 0,
    "start_date": "2026-04-01",
    "end_date": "2026-12-31",
    "completed": false,
    "progress_percentage": 0
  }
}
```

- Lỗi thường gặp:
  - `400`: thiếu field, sai kiểu, `start_date > end_date`, hoặc gửi field cấm.

#### `GET /api/saving/all`
- Mục đích: lấy tất cả saving plans trong hệ thống.
- Đầu vào: không có.
- Đầu ra `200`: `SavingPlan[]`, sắp xếp theo `created_at desc`.

#### `GET /api/saving/:user_id`
- Mục đích: lấy toàn bộ saving plans của một user.
- Path params:
  - `user_id`: id user.
- Đầu ra `200`: `SavingPlan[]`, sắp xếp theo `created_at desc`.

#### `GET /api/saving/:user_id/stats`
- Mục đích: lấy thống kê tổng quan saving plans của user.
- Path params:
  - `user_id`: id user.
- Đầu ra `200`:

```json
{
  "total_plans": 3,
  "completed": 1,
  "total_saving": 12500000,
  "avg_progress": 41.67
}
```

- Nếu user chưa có plan nào thì vẫn trả `200` với toàn bộ giá trị bằng `0`.

#### `GET /api/saving/:user_id/top`
- Mục đích: lấy tối đa 3 saving plans có tiến độ cao nhất của user.
- Path params:
  - `user_id`: id user.
- Đầu ra `200`: `SavingPlan[]`, sắp xếp theo `progress_percentage desc`, tối đa 3 phần tử.

#### `GET /api/saving/:id/history`
- Mục đích: lấy lịch sử tiến độ saving dựa trên các khoản đóng góp đã ghi nhận.
- Path params:
  - `id`: id của saving plan.
- Đầu ra `200`: `SavingProgressPoint[]`, sắp xếp theo `payment_date asc`.

```json
[
  {
    "date": "2026-04-01",
    "progress": 10
  },
  {
    "date": "2026-04-18",
    "progress": 33.33
  }
]
```

- Lỗi thường gặp:
  - `404`: không tìm thấy kế hoạch.

#### `PUT /api/saving/:id/progress`
- Mục đích: cập nhật `current_amount` của saving plan.
- Path params:
  - `id`: id của saving plan.
- Body bắt buộc:
  - `current_amount`: số không âm.
- Không được gửi các field: `completed`, `progress_percentage`.
- Đầu ra `200`:

```json
{
  "message": "Cập nhật tiến độ thành công",
  "plan": {
    "id": 1,
    "current_amount": 12000000,
    "progress_percentage": 40,
    "completed": false
  }
}
```

- Ghi chú:
  - Nếu `current_amount >= target_amount`, plan sẽ tự chuyển sang `completed = true`.
  - Khi plan vừa hoàn thành, service sẽ gọi `transaction-service`.
- Lỗi thường gặp:
  - `400`: `current_amount` âm hoặc body sai format.
  - `404`: không tìm thấy kế hoạch.
  - `500`: cập nhật được tiến độ nghiệp vụ nhưng tạo transaction thất bại.

#### `PUT /api/saving/:id/complete`
- Mục đích: đánh dấu kế hoạch là hoàn thành ngay lập tức.
- Path params:
  - `id`: id của saving plan.
- Đầu vào body: không có.
- Đầu ra `200`:

```json
{
  "message": "Đã đánh dấu hoàn thành kế hoạch",
  "plan": {
    "id": 1,
    "current_amount": 30000000,
    "progress_percentage": 100,
    "completed": true
  }
}
```

- Ghi chú:
  - Service sẽ set `current_amount = target_amount`.
  - Service sẽ gọi `transaction-service` trước khi commit transaction.
- Lỗi thường gặp:
  - `400`: kế hoạch đã hoàn thành trước đó.
  - `404`: không tìm thấy kế hoạch.
  - `500`: tạo transaction thất bại.

#### `PUT /api/saving/:id`
- Mục đích: cập nhật thông tin cơ bản của saving plan.
- Path params:
  - `id`: id của saving plan.
- Body cho phép:
  - `title`: chuỗi không rỗng.
  - `target_amount`: số dương.
  - `start_date`: `YYYY-MM-DD`.
  - `end_date`: `YYYY-MM-DD`.
- Không được gửi các field: `current_amount`, `completed`, `progress_percentage`.
- Phải có ít nhất một field hợp lệ để cập nhật.
- Đầu ra `200`:

```json
{
  "message": "Cập nhật thông tin kế hoạch thành công",
  "plan": {
    "id": 1,
    "title": "Mua laptop mới",
    "target_amount": 35000000,
    "progress_percentage": 34.29,
    "completed": false
  }
}
```

- Ghi chú:
  - Nếu đổi `target_amount` làm plan đạt ngưỡng hoàn thành, service cũng sẽ tự hoàn thành plan và gọi `transaction-service`.
- Lỗi thường gặp:
  - `400`: body không có field hợp lệ, sai kiểu, field cấm, hoặc `start_date > end_date`.
  - `404`: không tìm thấy kế hoạch.
  - `500`: tạo transaction thất bại khi plan vừa chuyển sang hoàn thành.

#### `DELETE /api/saving/:id`
- Mục đích: xóa saving plan.
- Path params:
  - `id`: id của saving plan.
- Đầu ra `200`:

```json
{
  "message": "Đã xóa kế hoạch thành công"
}
```

- Lỗi thường gặp:
  - `404`: không tìm thấy kế hoạch để xóa.

### 4.3 Saving installment APIs

#### `POST /api/saving/:saving_plan_id/installments`
- Mục đích: thêm một khoản đóng góp vào saving plan.
- Path params:
  - `saving_plan_id`: id của saving plan.
- Body bắt buộc:
  - `amount`: số dương.
- Body tùy chọn:
  - `note`: chuỗi.
  - `payment_date`: ngày hợp lệ. Chấp nhận `YYYY-MM-DD`, ISO datetime, hoặc `YYYY-MM-DD HH:mm:ss`.
- Nếu không gửi `payment_date`, service dùng thời điểm hiện tại.
- Đầu ra `201`:

```json
{
  "message": "Đã thêm khoản trả góp",
  "installment": {
    "id": 12,
    "saving_plan_id": 1,
    "amount": 1000000,
    "note": "Đóng góp tháng 4",
    "payment_date": "2026-04-18 10:00:00"
  },
  "new_progress": 33.33
}
```

- Ghi chú:
  - Mỗi lần thêm installment, `current_amount` và `progress_percentage` của saving plan sẽ tăng tương ứng.
  - Nếu plan vừa hoàn thành, service sẽ gọi `transaction-service`.
- Lỗi thường gặp:
  - `400`: `saving_plan_id` không hợp lệ, `amount <= 0`, `payment_date` không hợp lệ.
  - `404`: không tìm thấy saving plan.
  - `500`: thêm installment nhưng tạo transaction thất bại khi plan vừa hoàn thành.

#### `GET /api/saving/:saving_plan_id/installments`
- Mục đích: lấy danh sách các khoản đóng góp của một saving plan.
- Path params:
  - `saving_plan_id`: id của saving plan.
- Đầu ra `200`: `SavingInstallment[]`, sắp xếp theo `payment_date desc`.
- Ghi chú:
  - Endpoint này không kiểm tra plan có tồn tại hay không; nếu không có dữ liệu thì trả mảng rỗng.

#### `DELETE /api/saving/installments/:id`
- Mục đích: xóa một khoản đóng góp đã ghi nhận.
- Path params:
  - `id`: id của `SavingInstallment`.
- Đầu ra `200`:

```json
{
  "message": "Đã xóa khoản trả góp",
  "new_progress": 20
}
```

- Ghi chú:
  - Sau khi xóa, service sẽ tính lại `current_amount`, `progress_percentage` và `completed` của saving plan.
- Lỗi thường gặp:
  - `404`: không tìm thấy installment cần xóa.

### 4.4 Installment plan APIs

#### `POST /api/installment`
- Mục đích: tạo khoản trả góp mới.
- Body bắt buộc:
  - `user_id`: số nguyên dương.
  - `title`: chuỗi không rỗng.
  - `total_amount`: số dương.
  - `monthly_payment`: số dương.
  - `start_date`: `YYYY-MM-DD`.
  - `end_date`: `YYYY-MM-DD`.
  - `total_terms`: số nguyên dương.
- Không được gửi các field: `paid_amount`, `current_term`, `completed`, `progress_percentage`.
- Đầu ra `201`:

```json
{
  "message": "Tạo khoản trả góp thành công",
  "plan": {
    "id": 3,
    "user_id": 7,
    "title": "Trả góp điện thoại",
    "total_amount": 24000000,
    "paid_amount": 0,
    "monthly_payment": 2000000,
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "current_term": 0,
    "total_terms": 12,
    "completed": false,
    "progress_percentage": 0
  }
}
```

- Lỗi thường gặp:
  - `400`: thiếu field, sai kiểu, field cấm, hoặc `start_date > end_date`.

#### `GET /api/installment/:user_id`
- Mục đích: lấy toàn bộ khoản trả góp của một user.
- Path params:
  - `user_id`: id user.
- Đầu ra `200`: `InstallmentPlan[]`, sắp xếp theo `created_at desc`.

#### `GET /api/installment/detail/:id`
- Mục đích: lấy chi tiết một khoản trả góp theo id.
- Path params:
  - `id`: id của installment plan.
- Đầu ra `200`: `InstallmentPlan`.
- Lỗi thường gặp:
  - `404`: không tìm thấy khoản trả góp.

#### `GET /api/installment/stats/:user_id`
- Mục đích: lấy thống kê tổng quan các khoản trả góp của user.
- Path params:
  - `user_id`: id user.
- Đầu ra `200`:

```json
{
  "total_plans": 2,
  "completed": 1,
  "total_debt": 6000000,
  "total_paid": 18000000,
  "avg_progress": 62.5
}
```

- Nếu user chưa có plan nào thì vẫn trả `200` với toàn bộ giá trị bằng `0`.

#### `GET /api/installment/top/:user_id`
- Mục đích: lấy tối đa 3 khoản trả góp có tiến độ cao nhất.
- Path params:
  - `user_id`: id user.
- Đầu ra `200`: `InstallmentPlan[]`, sắp xếp theo `progress_percentage desc`, tối đa 3 phần tử.

#### `GET /api/installment/history/:id`
- Mục đích: lấy lịch sử thanh toán của một installment plan.
- Path params:
  - `id`: id của installment plan.
- Đầu ra `200`: `InstallmentHistoryPoint[]`, sắp xếp theo `pay_date asc`.

```json
[
  {
    "date": "18/03/2026",
    "amount": 2000000,
    "term": 1,
    "note": "Thanh toán kỳ 1 (18/03/2026)"
  }
]
```

- Ghi chú:
  - `date` được format theo locale `vi-VN`, không phải ISO date.
  - Endpoint không kiểm tra plan có tồn tại hay không; nếu chưa có payment thì trả mảng rỗng.

#### `GET /api/installment/payments/chart/:user_id`
- Mục đích: lấy dữ liệu biểu đồ thanh toán đã gom nhóm theo ngày.
- Path params:
  - `user_id`: id user.
- Đầu ra `200`: `InstallmentChartPoint[]`, sắp xếp theo `pay_date asc` trước khi gom nhóm.

```json
[
  {
    "date": "18/03/2026",
    "amount": 2000000
  },
  {
    "date": "18/04/2026",
    "amount": 4000000
  }
]
```

#### `PATCH /api/installment/:id/pay`
- Mục đích: thanh toán kỳ tiếp theo của khoản trả góp.
- Path params:
  - `id`: id của installment plan.
- Đầu vào body: không có.
- Đầu ra `200`:

```json
{
  "message": "Đã thanh toán kỳ mới thành công",
  "plan": {
    "id": 3,
    "paid_amount": 10000000,
    "current_term": 5,
    "progress_percentage": 41.67,
    "completed": false
  }
}
```

- Khi thanh toán kỳ cuối, `message` sẽ là:

```json
{
  "message": "Khoản trả góp đã hoàn thành"
}
```

- Ghi chú:
  - Service tính số tiền thực trả bằng `min(monthly_payment, total_amount - paid_amount)`.
  - Service gọi `transaction-service` trước khi ghi `installment_payments`.
  - Service tự tạo payment history với `term_number`, `amount`, `note`, `pay_date`.
  - Nếu còn tối đa 2 kỳ hoặc plan đã hoàn thành, service sẽ publish notification.
- Lỗi thường gặp:
  - `400`: khoản trả góp đã hoàn thành hoặc không thể thanh toán thêm.
  - `404`: không tìm thấy khoản trả góp.
  - `500`: tạo transaction thất bại.

#### `PATCH /api/installment/:id/update`
- Mục đích: cập nhật thông tin khoản trả góp.
- Path params:
  - `id`: id của installment plan.
- Body cho phép:
  - `title`: chuỗi không rỗng.
  - `total_amount`: số dương.
  - `monthly_payment`: số dương.
  - `start_date`: `YYYY-MM-DD`.
  - `end_date`: `YYYY-MM-DD`.
  - `total_terms`: số nguyên dương.
- Không được gửi các field: `paid_amount`, `current_term`, `completed`, `progress_percentage`.
- Phải có ít nhất một field hợp lệ để cập nhật.
- Đầu ra `200`:

```json
{
  "message": "Cập nhật thông tin thành công",
  "plan": {
    "id": 3,
    "title": "Trả góp điện thoại flagship",
    "total_amount": 26000000,
    "monthly_payment": 2000000,
    "total_terms": 13,
    "progress_percentage": 38.46,
    "completed": false
  }
}
```

- Lỗi thường gặp:
  - `400`: body không có field hợp lệ, sai kiểu, field cấm, `start_date > end_date`, `total_amount < paid_amount`, hoặc `total_terms < current_term`.
  - `404`: không tìm thấy khoản trả góp.

#### `DELETE /api/installment/:id`
- Mục đích: xóa khoản trả góp và toàn bộ lịch sử thanh toán liên quan.
- Path params:
  - `id`: id của installment plan.
- Đầu ra `200`:

```json
{
  "message": "Đã xóa khoản trả góp và lịch sử liên quan"
}
```

- Lỗi thường gặp:
  - `404`: không tìm thấy khoản trả góp để xóa.

## 5. Phụ thuộc bên ngoài

### `transaction-service`
- Endpoint được gọi: `POST /api/transactions`
- Dùng trong các luồng:
  - saving plan vừa hoàn thành
  - installment plan thanh toán thêm một kỳ

### `notification-service`
- Endpoint được gọi: `POST /internal/publish`
- Dùng trong các luồng:
  - saving plan hoàn thành với event `SAVING_PLAN_COMPLETED`
  - installment plan còn tối đa 2 kỳ hoặc đã hoàn thành với event `INSTALLMENT_DUE_SOON`

## 6. Lưu ý khi dùng service này
- Service hiện chưa tự xác thực người dùng; quyền truy cập được giả định đã xử lý ở gateway.
- Nhiều endpoint nhận `user_id` trực tiếp từ path hoặc body.
- Response format hiện chưa đồng nhất hoàn toàn giữa các endpoint đọc và ghi.
- `GET /api/installment/history/:id` và `GET /api/installment/payments/chart/:user_id` trả `date` theo `vi-VN`, trong khi saving history trả `YYYY-MM-DD`.
- `DELETE /api/saving/installments/:id` đang trả message `"Đã xóa khoản trả góp"` dù dữ liệu thực tế là một khoản đóng góp tiết kiệm.
