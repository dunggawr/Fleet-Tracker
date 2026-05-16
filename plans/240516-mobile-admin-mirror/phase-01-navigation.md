# Phase 01: Multi-Role Navigation Setup
Status: ⬜ Pending
Dependencies: None

## Objective
Enable different navigation structures for Admin and Driver.

## Requirements
- [ ] Detect user role in root layout.
- [ ] Define Admin-specific tab set (Dashboard, Tracking, Management, Profile).
- [ ] Define Driver-specific tab set (Trips, Map, Profile).
- [ ] Prevent role cross-access.

## Implementation Steps
1. [ ] Update `useAuthStore` to ensure role is reliable.
2. [ ] Modify `app/(tabs)/_layout.tsx` to use conditional `Tabs.Screen` based on role.
3. [ ] Create placeholder screens for new Admin tabs.

## Files to Create/Modify
- `fleet-driver/app/(tabs)/_layout.tsx`
- `fleet-driver/app/(tabs)/dashboard.tsx`
- `fleet-driver/app/(tabs)/tracking.tsx`
- `fleet-driver/app/(tabs)/management.tsx`

## Test Criteria
- [ ] Login as Driver → See Trips/Map/Profile.
- [ ] Login as Admin → See Dashboard/Tracking/Management/Profile.
