# Phase 07: Reports & Analytics
Status: ⬜ Pending
Dependencies: Phase 02, Phase 04

## Objective
Provide admin users with visual insights into fleet performance, including trips, utilization, and driver KPIs, directly on the mobile app.

## Requirements
- [x] Overview dashboard for reports (Fuel, Trips, Utilization, KPI).
- [x] Visual charts for Trip trends (Daily/Weekly).
- [x] Driver Performance Ranking (KPIs).
- [x] Vehicle Utilization analytics.
- [x] Export to PDF/CSV functionality (Streamlined for mobile).

## Implementation Steps
1. [x] Create `useReportStore` to handle data fetching for different report types.
2. [x] Build Reports Overview screen (`app/admin/reports/index.tsx`).
3. [x] Implement specific report detail screens:
   - `app/admin/reports/trips.tsx`
   - `app/admin/reports/kpi.tsx`
4. [x] Integrate `react-native-chart-kit` or similar for data visualization.
5. [x] Style with Tailwind CSS and Glassmorphism design consistent with previous phases.

## Files to Create/Modify
- `fleet-driver/store/useReportStore.ts`
- `fleet-driver/app/admin/reports/index.tsx`
- `fleet-driver/app/admin/reports/trips.tsx`
- `fleet-driver/app/admin/reports/kpi.tsx`
- `fleet-driver/components/admin/ReportCard.tsx`
- `fleet-driver/components/admin/KPIRankingItem.tsx`
