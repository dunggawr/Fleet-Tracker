# Phase 05: Backend — Real-time GPS & Alerts

**Status:** ✅ Completed
**Dependencies:** Phase 04 (Dispatch)
**Ước tính:** 5-7 ngày

---

## Objective

Implement WebSocket gateway để nhận GPS data real-time từ Driver App, lưu vào PostGIS, broadcast vị trí xe cho Admin Dashboard, và hệ thống cảnh báo (vượt tốc, sai tuyến, dừng bất thường).

## Implementation Steps

### 1. WebSocket Gateway (NestJS)
- [x] `TrackingModule` — module setup
- [x] `TrackingGateway` (WebSocket):
  - `@SubscribeMessage('gps:update')` — Nhận GPS từ Driver
  - Emit `'vehicle:location'` → Broadcast cho tất cả Admin clients
  - Emit `'alert:new'` → Khi phát hiện vi phạm
  - Emit `'trip:status'` → Khi trip status thay đổi
- [x] WebSocket authentication:
  - Validate JWT token khi connect
  - Chỉ driver có active trip mới được emit GPS
  - Admin được subscribe tất cả events
- [x] Room management:
  - Room `admin` — tất cả admin clients
  - Room `trip:{tripId}` — theo dõi trip cụ thể
  - Room `driver:{driverId}` — channel riêng cho driver

### 2. GPS Data Processing
- [x] `TrackingService`:
  - `processGpsUpdate(data)`:
    1. Validate data (lat/lng range, speed > 0)
    2. Save to `gps_locations` table (PostGIS point)
    3. Update `vehicles.last_known_location`
    4. Run violation checks (async)
    5. Broadcast updated location to admin room
- [x] Batch insert optimization:
  - Buffer GPS points, insert batch every 5 seconds
  - Reduce DB writes (10 xe × 5s interval = 2 writes/s thay vì 2/s per xe)

### 3. Alert System — Violation Detection
- [x] `AlertsModule` + `AlertsService`
- [x] **Speed Violation:**
  - Check: `speed > MAX_SPEED` (configurable, default 80 km/h)
  - Action: Tạo alert + emit `alert:new`
- [x] **Route Deviation:**
  - Check: `ST_Distance(current_location, planned_route) > THRESHOLD` (default 500m)
  - Action: Tạo alert + emit `alert:new`
- [x] **Abnormal Stop:**
  - Check: vehicle speed = 0 liên tục > 10 phút (configurable)
  - Action: Tạo alert + emit `alert:new`
- [x] **Incident Report (Manual):**
  - Driver bấm nút báo sự cố → `POST /trips/:id/incident`
  - Tạo alert với type = 'incident', severity = 'critical'
  - Emit `alert:new` ngay lập tức

### 4. Alert Management
- [x] `AlertsController`:
  - `GET /alerts` — List alerts (filter: type, severity, is_resolved, date range)
  - `GET /alerts/active` — Alerts chưa resolve
  - `PATCH /alerts/:id/resolve` — Mark as resolved (admin)
  - `GET /alerts/stats` — Thống kê alerts (count by type, by day)
- [x] Alert notification:
  - WebSocket emit cho admin dashboard

### 5. Geofencing Utilities
- [x] PostGIS helper functions
- [x] Route corridor: Tạo buffer 500m quanh planned_route

### 6. Location History
- [x] `GET /tracking/history/:vehicleId` — Lịch sử GPS
- [x] `GET /tracking/live` — Vị trí hiện tại tất cả xe active

## Test Criteria
- [x] WebSocket connection với JWT → thành công
- [x] GPS update → saved to DB → broadcast to admin
- [x] Speed > 80 km/h → alert created + emitted
- [x] Location > 500m from route → route deviation alert
- [x] Speed = 0 for > 10 min → abnormal stop alert
- [x] Incident report → critical alert + emitted
- [x] Location history → correct time range filter
- [x] Live locations → all active vehicles

---

**Next Phase:** [Phase 06 — Backend Reports & Optimization](./phase-06-backend-reports.md)
