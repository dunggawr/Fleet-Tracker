# Phase 01: Project Setup & Infrastructure

**Status:** ✅ Completed
**Dependencies:** None
**Ước tính:** 2-3 ngày

---

## Objective

Khởi tạo 3 projects (backend, admin web, driver mobile), cài đặt dependencies, setup folder structure, cấu hình TypeScript/ESLint, kết nối Supabase, tạo Git repo.

## Implementation Steps

### 1. Backend (fleet-api)
- [x] Tạo NestJS project: `npx -y @nestjs/cli new fleet-api`
- [x] Cấu hình TypeScript strict mode
- [x] Install core dependencies:
  - `@nestjs/typeorm`, `typeorm`, `pg` (PostgreSQL)
  - `@nestjs/websockets`, `@nestjs/platform-socket.io` (WebSocket)
  - `@nestjs/passport`, `passport-jwt`, `@nestjs/jwt` (Auth)
  - `@nestjs/config` (Environment variables)
  - `class-validator`, `class-transformer` (DTO validation)
  - `@nestjs/swagger` (API docs)
- [x] Tạo folder structure theo module:
  ```
  src/
  ├── auth/
  ├── vehicles/
  ├── drivers/
  ├── orders/
  ├── trips/
  ├── dispatch/
  ├── tracking/
  ├── alerts/
  ├── reports/
  ├── optimization/
  └── common/
      ├── dto/
      ├── guards/
      ├── pipes/
      ├── interceptors/
      └── decorators/
  ```
- [x] Tạo `.env.example` với các biến cần thiết
- [x] Setup Swagger API documentation

### 2. Admin Dashboard (fleet-admin)
- [x] Tạo Next.js project: `npx -y create-next-app@latest fleet-admin --typescript --app --eslint --src-dir`
- [x] Install UI dependencies:
  - `lucide-react` (icons)
  - `recharts` (charts)
  - `mapbox-gl`, `react-map-gl` (maps)
  - `socket.io-client` (WebSocket)
  - `@tanstack/react-query` (data fetching)
  - `react-hook-form`, `zod` (forms + validation)
  - `date-fns` (date formatting)
- [x] Setup folder structure:
  ```
  src/
  ├── app/
  │   ├── (auth)/login/
  │   ├── (dashboard)/
  │   │   ├── layout.tsx
  │   │   ├── page.tsx (overview)
  │   │   ├── vehicles/
  │   │   ├── drivers/
  │   │   ├── orders/
  │   │   ├── dispatch/
  │   │   ├── tracking/
  │   │   └── reports/
  │   └── layout.tsx
  ├── components/
  │   ├── ui/          (shared components)
  │   ├── layout/      (sidebar, header)
  │   └── maps/        (map components)
  ├── hooks/
  ├── lib/
  │   ├── api.ts       (API client)
  │   ├── socket.ts    (WebSocket client)
  │   └── utils.ts
  ├── types/
  └── styles/
  ```
- [x] Tạo design system cơ bản (CSS variables, dark theme)

### 3. Driver Mobile App (fleet-driver)
- [x] Tạo Expo project: `npx -y create-expo-app fleet-driver --template tabs`
- [x] Install dependencies:
  - `expo-location` (GPS)
  - `expo-camera` (chụp ảnh xác nhận)
  - `expo-image-picker`
  - `react-native-maps` (bản đồ)
  - `socket.io-client` (WebSocket)
  - `@tanstack/react-query`
  - `expo-secure-store` (JWT storage)
- [x] Setup Expo Router navigation structure

### 4. Infrastructure
- [x] Setup Supabase project (PostgreSQL + PostGIS)
- [x] Enable PostGIS extension
- [x] Tạo `.env` files cho cả 3 projects
- [x] Setup Git repo + `.gitignore`
- [x] Initial commit

## Output Criteria
- [x] `fleet-api` chạy được: `npm run start:dev` → http://localhost:3001
- [x] `fleet-admin` chạy được: `npm run dev` → http://localhost:3000
- [x] `fleet-driver` chạy được: `npx expo start`
- [x] Swagger UI accessible tại http://localhost:3001/api
- [x] Supabase project ready với PostGIS enabled
- [x] Git repo với initial commit

---

**Next Phase:** [Phase 02 — Database & Authentication](./phase-02-database-auth.md)
