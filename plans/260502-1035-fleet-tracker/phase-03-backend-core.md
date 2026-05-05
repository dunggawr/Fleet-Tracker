# Phase 03: Backend — Core CRUD APIs

**Status:** ✅ Completed
**Dependencies:** Phase 02 (Database & Auth)
**Ước tính:** 4-5 ngày

---

## Objective

Implement đầy đủ CRUD APIs cho Vehicles, Drivers, Orders với validation, pagination, filtering, sorting, và file upload.

## Implementation Steps

### 1. Vehicles Module
- [x] `VehiclesModule` — module setup
- [x] `VehiclesController`:
  - [x] `GET /vehicles` — List all (filter by status, type; pagination; search by plate)
  - [x] `GET /vehicles/:id` — Get by ID (include driver info)
  - [x] `POST /vehicles` — Create (admin only)
  - [x] `PATCH /vehicles/:id` — Update (admin only)
  - [x] `DELETE /vehicles/:id` — Soft delete (admin only, block nếu đang delivering)
  - [x] `GET /vehicles/available` — Xe rảnh + đủ tải trọng
  - [x] `POST /vehicles/:id/image` — Upload ảnh xe
- [x] `VehiclesService` — business logic
- [x] DTOs:
  - [x] `CreateVehicleDto` — plate_number, type, max_capacity_kg
  - [x] `UpdateVehicleDto` — partial update
  - [x] `VehicleQueryDto` — filter, pagination, sort
  - [x] `VehicleResponseDto` — response shape
- [x] Validation rules:
  - [x] plate_number: unique, format check
  - [x] max_capacity_kg: > 0
  - [x] Không xóa xe đang `delivering`
  - [x] Không gán driver đang `on_trip`

### 2. Drivers Module
- [x] `DriversModule` — module setup
- [x] `DriversController`:
  - [x] `GET /drivers` — List all (filter by status; pagination; search by name/phone)
  - [x] `GET /drivers/:id` — Get by ID (include KPI, vehicle info)
  - [x] `POST /drivers` — Create (admin only, tự tạo user account)
  - [x] `PATCH /drivers/:id` — Update (admin only)
  - [x] `DELETE /drivers/:id` — Soft delete (admin only, block nếu đang on_trip)
  - [x] `GET /drivers/:id/kpi` — KPI chi tiết
  - [x] `GET /drivers/:id/trips` — Lịch sử chuyến
  - [x] `GET /drivers/:id/violations` — Lịch sử vi phạm
- [x] `DriversService` — business logic
- [x] DTOs:
  - [x] `CreateDriverDto` — full_name, phone, email, password, license_class, license_expiry
  - [x] `UpdateDriverDto` — partial update (không đổi email)
  - [x] `DriverQueryDto` — filter, pagination
  - [x] `DriverResponseDto` — response (hide password)
  - [x] `DriverKpiResponseDto` — KPI data
- [x] Validation rules:
  - [x] phone: format VN (10 số)
  - [x] email: unique
  - [x] license_expiry: cảnh báo nếu < 30 ngày
  - [x] Không xóa driver đang `on_trip`

### 3. Orders Module
- [x] `OrdersModule` — module setup
- [x] `OrdersController`:
  - [x] `GET /orders` — List all (filter by status; pagination; date range)
  - [x] `GET /orders/:id` — Get by ID (include trip info)
  - [x] `POST /orders` — Create (admin only)
  - [x] `PATCH /orders/:id` — Update (admin only, chỉ khi pending)
  - [x] `PATCH /orders/:id/status` — Update status
  - [x] `DELETE /orders/:id` — Cancel (chỉ khi pending)
  - [x] `GET /orders/pending` — Đơn chưa gán
- [x] `OrdersService` — business logic
- [x] DTOs:
  - [x] `CreateOrderDto` — pickup_address, pickup_lat, pickup_lng, delivery_address, delivery_lat, delivery_lng, weight_kg, description
  - [x] `UpdateOrderDto` — partial (chỉ khi pending)
  - [x] `UpdateOrderStatusDto` — status transition validation
  - [x] `OrderQueryDto` — filter, pagination
- [x] Validation rules:
  - [x] weight_kg: > 0
  - [x] pickup ≠ delivery location
  - [x] Status transitions: pending → assigned → picked_up → delivering → delivered/failed
  - [x] Không sửa/xóa đơn đã assigned trở đi

### 4. File Upload (Ảnh xe, Ảnh xác nhận)
- [x] Implement file upload service (Supabase Storage)
- [x] Endpoint: `POST /upload` — generic upload
- [x] Max file size: 5MB
- [x] Accepted types: jpg, png, webp
- [x] Return public URL

### 5. Common Utilities
- [x] Pagination helper (offset-based)
  ```typescript
  // Input: page, limit
  // Output: { data, total, page, limit, totalPages }
  ```
- [x] Search/Filter pipe
- [x] Response interceptor (consistent response format)
- [x] Exception filter (consistent error format)

## Files to Create/Modify

```
fleet-api/src/
├── vehicles/
│   ├── vehicles.module.ts
│   ├── vehicles.controller.ts
│   ├── vehicles.service.ts
│   └── dto/
│       ├── create-vehicle.dto.ts
│       ├── update-vehicle.dto.ts
│       ├── vehicle-query.dto.ts
│       └── vehicle-response.dto.ts
├── drivers/
│   ├── drivers.module.ts
│   ├── drivers.controller.ts
│   ├── drivers.service.ts
│   └── dto/
│       ├── create-driver.dto.ts
│       ├── update-driver.dto.ts
│       ├── driver-query.dto.ts
│       └── driver-response.dto.ts
├── orders/
│   ├── orders.module.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── dto/
│       ├── create-order.dto.ts
│       ├── update-order.dto.ts
│       ├── update-order-status.dto.ts
│       ├── order-query.dto.ts
│       └── order-response.dto.ts
├── upload/
│   ├── upload.module.ts
│   ├── upload.controller.ts
│   └── upload.service.ts
└── common/
    ├── dto/
    │   └── pagination.dto.ts
    ├── interceptors/
    │   └── response.interceptor.ts
    └── filters/
        └── http-exception.filter.ts
```

## Test Criteria
- [x] CRUD Vehicles: create, read, update, delete — tất cả hoạt động
- [x] CRUD Drivers: create (tự tạo user), read (include KPI), update, delete
- [x] CRUD Orders: create (với lat/lng), filter by status, status transitions
- [x] File upload: upload ảnh → nhận URL → hiển thị được
- [x] Pagination: page=1&limit=10 → đúng số lượng
- [x] Filter: status=available → chỉ trả available
- [x] Validation: thiếu field → 400 Bad Request
- [x] Auth: admin routes cần JWT + admin role

---

**Next Phase:** [Phase 04 — Backend Dispatch & Assignment](./phase-04-backend-dispatch.md)
