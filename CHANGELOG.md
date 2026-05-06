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
### Updated
- Đồng bộ trạng thái tài liệu: Phase 05 (Real-time GPS & Alerts) và Phase 06 (Reports & Optimization) đã hoàn tất trong backend.
- Cập nhật kế hoạch phát triển để phản ánh đúng tiến độ hiện tại của dự án.
