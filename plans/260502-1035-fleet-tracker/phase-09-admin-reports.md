# Phase 09: Admin Dashboard — Reports & Analytics

**Status:** ✅ Complete
**Dependencies:** Phase 06 (Backend Reports), Phase 07 (Admin Core UI)
**Ước tính:** 3-4 ngày

---

## Objective

Xây dựng trang báo cáo & phân tích: fleet performance dashboard, KPI leaderboard, fuel cost analysis, charts (recharts), export PDF/Excel.

## Implementation Steps

### 1. Fleet Performance Dashboard (/reports)
- [x] Date range picker (today, 7 days, 30 days, custom)
- [x] Stat cards: Total trips, Completion rate, Total distance, Fuel cost
- [x] Charts (recharts):
  - [x] AreaChart: Trips per day/week
  - [x] BarChart: Trips by vehicle
  - [x] PieChart: Trip status distribution
  - [x] LineChart: Fleet performance trend

### 2. KPI Leaderboard (/reports/kpi)
- [x] Ranking table: # | Driver | Score | Trips | Completion % | Violations
- [x] KPI score bar per driver (substituted for gauge chart)
- [x] Color-coded rows: green (>80), yellow (50-80), red (<50)
- [x] Click driver → link to driver profile page

### 3. Fuel Cost Analysis (/reports/fuel)
- [x] Cost breakdown by vehicle type (small/medium/large)
- [x] Cost per trip average
- [x] Cost trend over time (LineChart)
- [x] Vehicle-level fuel cost table

### 4. Trip Summary (/reports/trips)
- [x] Filterable trip table: date range, vehicle, driver, status
- [x] Trip detail modal: route map, orders, timeline, violations
- [x] Summary stats at top

### 5. Export Functionality
- [x] Export buttons on each report page
- [x] PDF: formatted report with charts (server-side render)
- [x] Excel: raw data table download
- [x] Loading state while generating

## Test Criteria
- [x] All charts render with real data
- [x] Date range filter updates all charts
- [x] KPI leaderboard sorted correctly
- [x] Export PDF/Excel download successfully
- [x] Responsive layout for report pages

---

**Next Phase:** [Phase 10 — Driver Mobile App](./phase-10-driver-app.md)
