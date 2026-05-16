# Phase 01: Multi-Role Navigation Setup
Status: ✅ Completed
Dependencies: None

## Objective
Enable different navigation structures for Admin and Driver.

## Requirements
- [x] Detect user role in root layout.
- [x] Define Admin-specific tab set (Dashboard, Tracking, Management, Profile).
- [x] Define Driver-specific tab set (Trips, Map, Profile).
- [x] Prevent role cross-access.

## Implementation Steps
1. [x] Update `useAuthStore` to ensure role is reliable.
2. [x] Modify `app/(tabs)/_layout.tsx` to use conditional `Tabs.Screen` based on role.
3. [x] Create placeholder screens for new Admin tabs.

## Files to Create/Modify
- `fleet-driver/app/(tabs)/_layout.tsx`
- `fleet-driver/app/(tabs)/admin-dashboard.tsx`
- `fleet-driver/app/(tabs)/admin-tracking.tsx`
- `fleet-driver/app/(tabs)/admin-orders.tsx`
- `fleet-driver/app/(tabs)/admin-fleet.tsx`

## Test Criteria
- [x] Login as Driver → See Trips/Map/Profile.
- [x] Login as Admin → See Dashboard/Tracking/Management/Profile.
