# Phase 02: Database Design & Authentication

**Status:** ✅ Completed
**Dependencies:** Phase 01 (Setup)
**Ước tính:** 3-4 ngày

---

## Objective

Thiết kế database schema đầy đủ với PostGIS, tạo migration files, implement JWT authentication với role-based access (Admin/Driver).

## Implementation Steps

### 1. Database Schema & Migrations
- [x] Enable PostGIS extension trên Supabase
- [x] Tạo migration: `users` table (Implemented via TypeORM Entity)
- [x] Tạo migration: `drivers` table (Implemented via TypeORM Entity)
- [x] Tạo migration: `vehicles` table (Implemented via TypeORM Entity)
- [x] Tạo migration: `orders` table (Implemented via TypeORM Entity)
- [x] Tạo migration: `trips` table (Implemented via TypeORM Entity)
- [x] Tạo migration: `trip_orders` table (Implemented via TypeORM Entity)
- [x] Tạo migration: `gps_locations` table (Implemented via TypeORM Entity)
- [x] Tạo migration: `alerts` table (Implemented via TypeORM Entity)
- [x] Tạo migration: `driver_kpi` table (Implemented via TypeORM Entity)

### 2. Seed Data
- [x] Tạo seed script: 1 Admin user
- [x] Tạo seed script: 5 Drivers + 5 Driver users
- [x] Tạo seed script: 5 Vehicles
- [x] Tạo seed script: 10 sample Orders (với tọa độ HCM/HN)

### 3. Authentication Module (NestJS)
- [x] Implement `AuthModule`:
  - [x] `POST /auth/register` — Tạo user (Admin only)
  - [x] `POST /auth/login` — Email + password → JWT access + refresh token
  - [x] `POST /auth/refresh` — Refresh token → new access token
  - [x] `GET /auth/me` — User info từ JWT
- [x] Implement `JwtAuthGuard` — protect routes
- [x] Implement `RolesGuard` — role-based access (`@Roles('admin')`)
- [x] Implement `@CurrentUser()` decorator — extract user từ JWT
- [x] Hash passwords với bcrypt
- [x] JWT config: access token 1h, refresh token 7d

### 4. TypeORM Entities
- [x] Tạo TypeORM entities cho tất cả tables
- [x] Setup PostGIS column types trong entities
- [x] Configure TypeORM connection trong NestJS

## Files to Create/Modify

```
fleet-api/src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── token-response.dto.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── entities/
│   ├── user.entity.ts
│   ├── driver.entity.ts
│   ├── vehicle.entity.ts
│   ├── order.entity.ts
│   ├── trip.entity.ts
│   ├── trip-order.entity.ts
│   ├── gps-location.entity.ts
│   ├── alert.entity.ts
│   └── driver-kpi.entity.ts
└── database/
    └── seeds/
        └── seed.ts
```

## Test Criteria
- [x] Migration chạy thành công, tạo đủ tables (via Entity sync)
- [x] PostGIS functions hoạt động: `ST_Distance`, `ST_DWithin`, `ST_MakePoint`
- [x] Login → nhận JWT token
- [x] Access protected route với valid token → 200
- [x] Access protected route không có token → 401
- [x] Driver access admin route → 403
- [x] Refresh token hoạt động

---

**Next Phase:** [Phase 03 — Backend Core CRUD APIs](./phase-03-backend-core.md)
