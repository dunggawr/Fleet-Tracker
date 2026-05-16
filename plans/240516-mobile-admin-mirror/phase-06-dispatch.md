# Phase 06: Mobile Dispatching
Status: ✅ Completed
Dependencies: Phase 04, Phase 05

## Objective
Enable admin users to assign orders to vehicles and drivers directly from the mobile app.

## Requirements
- [x] View list of Pending/Unassigned orders.
- [x] View list of Available drivers/vehicles.
- [x] Drag-and-drop or Pick-to-assign interface for dispatching.
- [x] Integrate "Smart Suggest" API for optimal vehicle selection.
- [x] Visual feedback for successful dispatch.

## Implementation Steps
1. [x] Create `useDispatchStore` or extend `useOrderStore` for assignment logic.
2. [x] Build Dispatch Center screen (`app/admin/dispatch/index.tsx`).
3. [x] Implement Order selection and Vehicle selection flow.
4. [x] Integrate `POST /dispatch/assign` and `POST /dispatch/bulk-assign` endpoints.
5. [x] Add real-time updates via WebSockets for dispatch status.

## Files to Create/Modify
- `fleet-driver/app/admin/dispatch/index.tsx`
- `fleet-driver/store/useOrderStore.ts` (Update with dispatch actions)
- `fleet-driver/components/admin/OrderDispatchItem.tsx`
- `fleet-driver/components/admin/VehicleDispatchItem.tsx`
