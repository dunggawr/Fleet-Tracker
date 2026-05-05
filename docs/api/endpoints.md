# API Documentation - Fleet Analytics & Optimization

Ngày cập nhật: 2026-05-05
Base URL: `http://localhost:3000`

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
