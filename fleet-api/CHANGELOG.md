# Changelog

## [2026-05-10]
### Added
- **Dockerization:** Thêm `Dockerfile` (multi-stage), `.dockerignore` và `docker-compose.prod.yml`.
- **Database Migrations:** Thiết lập hệ thống TypeORM migrations, tạo migration đầu tiên `InitialSchema`.
- **Health Checks:** Thêm module `/api/health` dùng `@nestjs/terminus`.
- **CI/CD:** Cấu hình GitHub Actions tự động chạy Lint & Test cho Backend.
- **Railway Support:** Tối ưu Dockerfile để tự động chạy migrations khi deploy lên Railway.

### Changed
- **Security Hardening:** Ép buộc `synchronize: false` và bật `SSL` khi `NODE_ENV=production`.
- **Scripts:** Thêm các lệnh quản lý migration vào `package.json`.

### Fixed
- Khắc phục lỗi crash khi khởi tạo database ở môi trường production.




## [2026-05-07]
### Added
- Unit tests cho `DispatchService` (`src/dispatch/dispatch.service.spec.ts`).
- E2E tests cho `OrdersController` (`test/orders.e2e-spec.ts`).

### Changed
- Refactor `DispatchService.assignBulkOrders`:
    - Thêm logic deduplicate order IDs.
    - Sử dụng `In()` để fetch đơn hàng theo batch.
    - Sử dụng `manager.save()` theo mảng để tối ưu hóa lưu dữ liệu.
- Cập nhật `OrdersService` để validate địa chỉ nhận và giao không được trùng nhau.

### Fixed
- Lỗi `DataTypeNotSupportedError` trong `User` entity khi chạy trên Postgres.
- Lỗi logic validation tọa độ trong `OrdersService`.
