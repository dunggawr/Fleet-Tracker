# API Documentation - Fleet Tracker

Ngày cập nhật: 2026-05-07
Base URL: `http://localhost:3001`

---

## 🔐 Authentication

### POST `/auth/login`
Đăng nhập vào hệ thống.

**Request Body:**
```json
{
  "email": "admin@fleettracker.com",
  "password": "Password@123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "admin@fleettracker.com",
    "role": "admin",
    "isActive": true
  }
}
```

---

## 🚚 Vehicles

### GET `/vehicles`
Lấy danh sách phương tiện.

### POST `/vehicles`
Tạo phương tiện mới.

### PATCH `/vehicles/:id`
Cập nhật thông tin phương tiện.

### DELETE `/vehicles/:id`
Xóa phương tiện.

---

## 👥 Drivers

### GET `/drivers`
Lấy danh sách tài xế.

### POST `/drivers`
Đăng ký tài xế mới (tự động tạo User).

---

## 📦 Orders

### GET `/orders`
Lấy danh sách đơn hàng.

### POST `/orders`
Tạo đơn hàng mới.

### POST `/orders/:id/assign`
Gán đơn hàng cho phương tiện.

---

## 📊 Reports & Analytics

### GET `/reports/fleet-performance`
Lấy thông tin tổng quan hiệu suất đội xe trong một khoảng thời gian.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| from | date | Yes | Ngày bắt đầu (ISO) |
| to | date | Yes | Ngày kết thúc (ISO) |

**Response (200):**
```json
{
  "totalTrips": 10,
  "completedTrips": 8,
  "failedTrips": 2,
  "completionRate": 80,
  "totalDistanceKm": 450.5,
  "estimatedFuelCost": 1200000,
  "averageTripDuration": 120,
  "totalAlerts": 5,
  "alertsByType": { "speed": 2, "route": 1, "stop": 1, "incident": 1 }
}
```

---

### GET `/reports/fuel-cost`
Báo cáo chi phí nhiên liệu chi tiết từng xe.

**Response (200):**
```json
{
  "29A-12345": { "distance": 150, "fuel": 12, "cost": 300000 },
  "30B-67890": { "distance": 200, "fuel": 24, "cost": 600000 }
}
```

---

### GET `/reports/export`
Xuất báo cáo dưới dạng file Excel hoặc PDF.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | `fleet-performance` \| `fuel-cost` |
| format | string | Yes | `xlsx` \| `pdf` |
| from | date | Yes | Ngày bắt đầu |
| to | date | Yes | Ngày kết thúc |

**Response:** File stream (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` hoặc `application/pdf`).

---

## 🗺️ Route Optimization

### GET `/optimization/trip/:id/eta`
Dự đoán thời gian đến (ETA) của một chuyến đi dựa trên vị trí hiện tại của tài xế.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| lat | number | Yes | Vĩ độ hiện tại |
| lng | number | Yes | Kinh độ hiện tại |

**Response (200):**
```json
{
  "estimatedArrival": "2026-05-05T16:00:00.000Z",
  "remainingDistanceKm": 15.2,
  "remainingDurationMin": 45
}
```

---

## 📡 Tracking (WebSocket)
**Endpoint:** `ws://localhost:3001/tracking`

**Authentication:** 
Yêu cầu gửi token qua:
- `auth.token` trong handshake (Khuyên dùng)
- `Authorization` header trong handshake.
*(Lưu ý: Không hỗ trợ gửi token qua query string)*

### Events Emitted (Client -> Server):

#### `updateLocation`
Gửi dữ liệu tọa độ GPS thực tế của tài xế. Dữ liệu sẽ được gom batch 5 giây/lần trước khi lưu DB.
**Payload:**
```json
{
  "vehicleId": "uuid",
  "tripId": "uuid",
  "latitude": 10.123,
  "longitude": 106.456,
  "speed": 50,
  "heading": 90,
  "timestamp": 1651854000000
}
```

#### `subscribeTrip`
Đăng ký nhận thông tin realtime của một chuyến đi (Chỉ tài xế được gán mới có quyền).
**Payload:**
```json
{ "tripId": "uuid" }
```

---

## 🔔 Alerts

### POST `/alerts/report-incident`
Tài xế báo cáo sự cố thủ công.
**Request Body:**
```json
{
  "vehicleId": "uuid",
  "tripId": "uuid",
  "message": "Sự cố lốp xe",
  "latitude": 10.123,
  "longitude": 106.456
}
```

### POST `/alerts/:id/resolve`
Đánh dấu cảnh báo đã được xử lý (Admin).
**Response (200):**
```json
{ "id": "uuid", "isResolved": true, "resolvedAt": "..." }
```
