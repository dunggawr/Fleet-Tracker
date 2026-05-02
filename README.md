# FleetTracker — Hệ Thống Điều Phối & Quản Lý Đội Xe

FleetTracker là một hệ thống quản lý và điều phối đội xe vận tải toàn diện, được thiết kế để tối ưu hóa việc theo dõi vị trí thời gian thực, quản lý đơn hàng và điều phối tài xế.

## 🏗️ Cấu Trúc Dự Án

Dự án là một monorepo gồm 3 thành phần chính:

*   **`fleet-api/`**: Backend xây dựng trên NestJS (TypeScript). Cung cấp RESTful API và WebSocket cho việc theo dõi GPS thời gian thực.
*   **`fleet-admin/`**: Dashboard dành cho quản trị viên xây dựng bằng Next.js (App Router). Cho phép quản lý đội xe, tài xế, đơn hàng và xem bản đồ trực tuyến.
*   **`fleet-driver/`**: Ứng dụng di động dành cho tài xế xây dựng bằng React Native (Expo). Hỗ trợ nhận chuyến, điều hướng và cập nhật vị trí GPS.
*   **`docs/`**: Tài liệu hướng dẫn chi tiết và đặc tả kỹ thuật.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Lớp | Công nghệ | Phiên bản |
| :--- | :--- | :--- |
| **Backend** | NestJS, TypeScript, Socket.io | v10+ |
| **Admin Dashboard** | Next.js, TailwindCSS, Mapbox GL | v14+ |
| **Mobile App** | React Native, Expo SDK | v52+ |
| **Database** | PostgreSQL + PostGIS (Supabase) | v15+ |
| **Auth** | JWT, Passport.js | - |

## 🚀 Khởi Chạy Nhanh

### Yêu cầu hệ thống
*   Node.js v18+
*   npm hoặc pnpm
*   Tài khoản Supabase & Mapbox API Key

### Các bước thực hiện

1.  **Cài đặt dependencies cho từng phần:**
    ```bash
    # Backend
    cd fleet-api && npm install
    
    # Admin Dashboard
    cd ../fleet-admin && npm install
    
    # Driver App
    cd ../fleet-driver && npm install
    ```

2.  **Cấu hình môi trường:**
    Sao chép `.env.example` thành `.env` trong từng thư mục và điền đầy đủ các thông số cần thiết.

3.  **Chạy dự án ở chế độ Development:**
    ```bash
    # Chạy API
    cd fleet-api && npm run start:dev
    
    # Chạy Admin Dashboard
    cd fleet-admin && npm run dev
    
    # Chạy Driver App
    cd fleet-driver && npm start
    ```

## 📋 Tài Liệu Tham Khảo

*   [Đặc tả kỹ thuật (Specs)](docs/specs/fleet_tracker_spec.md)
*   [Kế hoạch phát triển (Phases)](plans/260502-1035-fleet-tracker/plan.md)

---
*Dự án đang trong quá trình phát triển (In Progress).*