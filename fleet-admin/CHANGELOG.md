# Changelog

All notable changes to this project will be documented in this file.

## [2026-05-11]
### Added
- Proactive session refresh before WebSocket connection/reconnection in `socket.ts`.
- Server-side filtering and pagination support in `VehiclesPage`.

### Optimized
- `useDispatch` hook now fetches `available` vehicles directly from the server to ensure data consistency.
- `useVehicles` hook updated to support server-side parameters.

### Fixed
- UI: Scrollbar overflow in Dispatch sidebars by adding `min-height: 0` to flex content.
- Data Consistency: Fixed discrepancy between total vehicle count in `/vehicles` and available count in `/dispatch`.
- Stability: Reduced "Unauthorized" WebSocket disconnection issues.
- API: Fixed `HTTP 400` error when creating vehicles by stripping restricted fields (`status`, `driverId`) from POST payload.
- API: Fixed `HttpClient` parameter stringification bug (`undefined` becoming `"undefined"`).
- Validation: Fixed Zod schema to allow empty strings for `driverId` (Unassigned state).
- Debugging: Added detailed API error logging to `HttpClient.request`.

## [2026-05-10]
### Added
- Initial project structure for Fleet-Tracker Admin.
- Tailwind CSS v4 configuration.
- Basic dashboard layouts and mapping components.
