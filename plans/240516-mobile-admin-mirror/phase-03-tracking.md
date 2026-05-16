# Phase 03: Fleet Tracking (Live Map)
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Enable real-time tracking of all vehicles for Admins.

## Requirements
- [ ] Render all active vehicles on map with distinct markers.
- [ ] Show vehicle info on marker press.
- [ ] Auto-center/fit bounds for entire fleet.

## Implementation Steps
1. [ ] Create `useFleetTrackingStore` for global GPS state.
2. [ ] Integrate WebSockets for live fleet updates.
3. [ ] Update `app/(tabs)/tracking.tsx` with fleet map logic.

## Files to Create/Modify
- `fleet-driver/store/useFleetTrackingStore.ts`
- `fleet-driver/app/(tabs)/tracking.tsx`
- `fleet-driver/components/map/FleetMarker.tsx`
