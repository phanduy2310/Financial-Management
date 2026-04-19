# Frontend — PTIT-Financial

React SPA quản lý tài chính cá nhân. Giao tiếp hoàn toàn qua API Gateway.

## Tech Stack
- React 19, React Router, TailwindCSS, Recharts, Framer Motion

## Port
- `5000` (host) → `3000` (container via nginx)

## Getting Started

```bash
# From project root
docker compose up frontend --build

# Or run locally
cd src/
npm install
npm start
```

## Environment Variables

| Variable                     | Description            | Default                      |
|------------------------------|------------------------|------------------------------|
| `REACT_APP_API_BASE_URL`     | URL API Gateway        | `http://localhost:5444/api`  |
| `REACT_APP_GATEWAY_URL`      | URL Gateway (SSE)      | `http://localhost:5444`      |

## Notes

- Mọi API call đi qua **Gateway** tại `http://localhost:5444`
- Build production bằng nginx, phục vụ qua port 3000 trong container