# QUẢN LÝ TÀI CHÍNH

> Hệ thống quản lý tài chính cá nhân theo kiến trúc microservices — theo dõi thu chi cá nhân, thu chi nhóm, kế hoạch tiết kiệm, trả góp và thông báo real-time.

**Repository**: https://github.com/phanduy2310/Financial-Management

---

## Thành viên nhóm

| Name | Student ID | Role | Contribution |
|------|------------|------|--------------|
| Phan Văn Duy | B22DCCN156 | Student | Transaction Service, Group Service |
| Bùi Văn Đạt | B22DCCN180 | Student | Auth Service, Saving Service |
| Trần Đức Hoàng | B22DCCN347 | Student | API Gateway, Notification Service |

---

## 🚀 Demo

**Live**: https://financial-management.up.railway.app

| Tài khoản | Email | Mật khẩu | Vai trò |
|-----------|-------|----------|---------|
| Test User | test@example.com | 123456 | user |

---

## Business Process

Hệ thống hỗ trợ người dùng quản lý tài chính cá nhân theo quy trình:

1. **Đăng ký / Đăng nhập** — xác thực danh tính, liên kết phụ huynh giám sát
2. **Ghi giao dịch** — theo dõi thu nhập và chi tiêu
3. **Nhóm chi tiêu** — theo dõi thu nhập và chi tiêu cho nhiều người
4. **Kế hoạch tiết kiệm** — đặt mục tiêu tích lũy với theo dõi tiến độ
5. **Trả góp** — quản lý các khoản vay theo từng kỳ thanh toán
6. **Thông báo real-time** — nhận thông báo giao dịch, nhắc kế hoạch tiết kiệm, liên kết phụ huynh qua SSE

---

## Kiến trúc hệ thống

```mermaid
flowchart TD
    FE["Frontend — React + nginx :5000"]
    GW["API Gateway — Express :8080"]

    subgraph Services["Backend Services"]
        NOTIFY["notification-service :8084"]
        SAVING["saving-service :8083"]
        TRANS["transaction-service :8082"]
        GROUP["group-service :8085"]
        AUTH["auth-service :8081"]
    end

    subgraph DBs["Databases — MySQL 8.0"]
        DB_NOTIFY[("financial_notification")]
        DB_SAVING[("financial_saving")]
        DB_TRANS[("financial_transaction")]
        DB_GROUP[("financial_group")]
        DB_AUTH[("financial_auth")]
    end

    FE --> GW
    GW --> NOTIFY
    GW --> SAVING
    GW --> TRANS
    GW --> GROUP
    GW --> AUTH

    NOTIFY --> DB_NOTIFY
    SAVING --> DB_SAVING
    TRANS --> DB_TRANS
    GROUP --> DB_GROUP
    AUTH --> DB_AUTH

    SAVING -.->|POST /transactions| TRANS
    GROUP -.->|POST /user/infor| AUTH
    AUTH -.->|event| NOTIFY
    TRANS -.->|event| NOTIFY
    SAVING -.->|event| NOTIFY

    style FE fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    style GW fill:#dcfce7,stroke:#22c55e,color:#14532d
    style NOTIFY fill:#fef9c3,stroke:#eab308,color:#713f12
    style SAVING fill:#ede9fe,stroke:#8b5cf6,color:#3b0764
    style TRANS fill:#ffedd5,stroke:#f97316,color:#7c2d12
    style GROUP fill:#fce7f3,stroke:#ec4899,color:#831843
    style AUTH fill:#e0f2fe,stroke:#0ea5e9,color:#0c4a6e
    style DB_NOTIFY fill:#fef9c3,stroke:#eab308,color:#713f12
    style DB_SAVING fill:#ede9fe,stroke:#8b5cf6,color:#3b0764
    style DB_TRANS fill:#ffedd5,stroke:#f97316,color:#7c2d12
    style DB_GROUP fill:#fce7f3,stroke:#ec4899,color:#831843
    style DB_AUTH fill:#e0f2fe,stroke:#0ea5e9,color:#0c4a6e
```

| Component | Trách nhiệm | Tech Stack | Port |
|-----------|-------------|------------|------|
| **Frontend** | React SPA — giao diện người dùng | React 19, TailwindCSS, Recharts | 5000 |
| **API Gateway** | Routing, CORS, proxy đến các service | Node.js, Express | 8080 |
| **auth-service** | Đăng ký, đăng nhập, JWT, liên kết phụ huynh | Node.js, Express, Objection.js | 8081 |
| **transaction-service** | Ghi nhận thu chi, quản lý ngân sách | Node.js, Express, Objection.js | 8082 |
| **saving-service** | Kế hoạch tiết kiệm và trả góp | Node.js, Express, Objection.js | 8083 |
| **notification-service** | Thông báo real-time qua SSE | Node.js, Express | 8084 |
| **group-service** | Nhóm chi tiêu, chia bill | Node.js, Express, Objection.js | 8085 |
| **MySQL** | Shared MySQL instance — mỗi service sở hữu một database riêng | MySQL 8.0 | 3306 |

---

## Khởi chạy

### Yêu cầu

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đang chạy

### Chạy toàn bộ hệ thống

```bash
docker compose up --build
```

Sau khi khởi động xong:

| URL | Mô tả |
|-----|-------|
| http://localhost:5000 | Giao diện người dùng |
| http://localhost:8080/health | API Gateway health check |

> Các backend service (auth, transaction, saving, notification, group) chỉ expose `GET /health` ở cấp container nội bộ — không accessible trực tiếp từ host. Kiểm tra trạng thái bằng `docker compose ps`.

### Thứ tự khởi động

1. `mysql` — chờ healthy (mysqladmin ping)
2. Các backend service (8081–8085) — chạy song song, mỗi service tự migrate DB
3. `gateway` — sau khi tất cả service healthy
4. `frontend` — sau khi gateway sẵn sàng

---

## Tài liệu

| Tài liệu | Mô tả |
|----------|-------|
| [`docs/analysis-and-design-ddd.md`](docs/analysis-and-design-ddd.md) | Phân tích & thiết kế theo DDD |
| [`docs/architecture.md`](docs/architecture.md) | Kiến trúc, patterns, deployment |
| [`docs/api-specs/auth-service.yaml`](docs/api-specs/auth-service.yaml) | OpenAPI — Auth Service |
| [`docs/api-specs/transaction-service.yaml`](docs/api-specs/transaction-service.yaml) | OpenAPI — Transaction Service |
| [`docs/api-specs/saving-service.yaml`](docs/api-specs/saving-service.yaml) | OpenAPI — Saving Service |
| [`docs/api-specs/notification-service.yaml`](docs/api-specs/notification-service.yaml) | OpenAPI — Notification Service |
| [`docs/api-specs/group-service.yaml`](docs/api-specs/group-service.yaml) | OpenAPI — Group Service |
