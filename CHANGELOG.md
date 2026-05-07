# Changelog

Tất cả các thay đổi quan trọng đối với dự án FleetTracker sẽ được ghi nhận tại đây.

## [2026-05-02]
### Added
- Khởi tạo cấu trúc monorepo: `fleet-api`, `fleet-admin`, `fleet-driver`.
- Thêm file `README.md` gốc với đầy đủ thông tin dự án và hướng dẫn khởi chạy.
- Thiết lập kế hoạch phát triển chi tiết trong thư mục `plans/`.
- Tài liệu hóa dự án trong thư mục `docs/` (`BRIEF.md`, `DESIGN.md`).

### Fixed
- Lỗi thiếu tài liệu hướng dẫn tổng quan tại thư mục gốc.

## [2026-05-05]
### Added
- Backend: Hoàn thiện Phase 04 - Điều phối và Gán đơn hàng.
- Backend: Triển khai tính năng gán đơn hàng hàng loạt (`bulk-assign`).
- Backend: Tích hợp tự động cập nhật KPI tài xế khi hoàn thành chuyến đi.
- Backend: Thắt chặt logic validation trạng thái xe và tài xế trong quá trình gán đơn.

## [2026-05-05] - Phase 06
### Added
- Backend: Triển khai **KPI Engine** tự động cập nhật điểm thưởng/phạt dựa trên sự kiện (Speed, Route, Stop, Incident).
- Backend: Thêm **ReportsModule** hỗ trợ báo cáo hiệu suất đội xe, chi phí nhiên liệu và tỷ lệ sử dụng xe.
- Backend: Tích hợp **ExportService** xuất báo cáo định dạng Excel (XLSX) và PDF.
- Backend: Triển khai **OptimizationModule** tích hợp Mapbox Directions API để tối ưu tuyến đường.
- Backend: Sử dụng PostGIS để tính quãng đường di chuyển thực tế từ lịch sử GPS.
- Backend: Thêm bộ test suite tự động cho các logic tính toán quan trọng (KPI, Fuel, Optimization).

## [2026-05-06]
### Added
- **Frontend (Admin Dashboard - Phase 07)**:
    - Hoàn thiện toàn bộ giao diện quản trị: Dashboard Overview, Vehicles, Drivers, Orders, Dispatch Control Center.
    - Đồng bộ hóa logic xác thực (Auth) và xử lý NestJS API response wrapper (`{data, statusCode, message}`).
    - Kết nối thành công dữ liệu thực tế từ backend vào UI thông qua React Query.
    - Khắc phục triệt để lỗi Redirect Loop khi đăng nhập.
    - Cập nhật script `comprehensive-seed.ts` để khởi tạo dữ liệu mẫu cho toàn bộ hệ thống.
### Fixed
- Lỗi mismatch kiểu dữ liệu giữa Frontend và Backend (Status ENUMs, field names như `customerName` vs `deliveryAddress`).
## [2026-05-07]
### Added
- Backend: Thêm biến môi trường cho mật khẩu seeding (`ADMIN_PASSWORD`, `DRIVER_PASSWORD`, `DISPATCHER_PASSWORD`).
- Backend: Bổ sung kiểm tra địa chỉ nhận/giao không trùng nhau trong `OrdersService`.
### Fixed
- Backend: Chuyển `synchronize: true` sang chỉ áp dụng cho môi trường development.
- Backend: Cấu hình hardened cho `UploadService` (config validation, robust extension extraction).
- Backend: Sửa lỗi TypeScript compile trong `AuthService` và `CreateOrderDto`.
- Backend: Sử dụng Enum `DriverStatus` thay vì hardcoded string trong `seed.ts`.

## [2026-05-07] - Refactoring & Security (PR #3)
### Added
- Backend: Triển khai bộ unit test cho `ViolationDetectorService` kiểm tra debouncing và caching.
- Backend: Cập nhật unit test cho `TrackingService` bao phủ cơ chế batching mới.

### Changed
- Backend: Tối ưu hóa **Tracking Module**:
    - Chuyển sang lưu trữ batch GPS (Buffer) để giảm tải cho Database.
    - Bảo mật hóa WebSocket: Cấm token trong query string, thêm ownership check cho tài xế.
    - Fix SQL Injection bằng cách sử dụng Parameterized Query trong `vehicleRepository`.
- Backend: Nâng cấp **Alerts Module**:
    - Thêm cơ chế **Route Caching** và **Alert Debouncing** (5 phút cooldown) để tránh notification spam.
    - Chuẩn hóa Enums cho `AlertsController`.
    - `Alert` entity: `driverId` cho phép nullable để xử lý linh hoạt hơn.

### Fixed
- Backend: Sửa lỗi khai báo trùng lặp biến `authHeader` trong `TrackingGateway`.
