# Plan: FleetTracker — Hệ Thống Điều Phối & Quản Lý Đội Xe

**Created:** 2026-05-02
**Status:** 🟡 In Progress
**Type:** Full Feature (Dự án học tập)
**Brief:** [BRIEF.md](../../docs/BRIEF.md)
**Spec:** [fleet_tracker_spec.md](../../docs/specs/fleet_tracker_spec.md)

---

## Overview

Hệ thống quản lý đội xe vận tải gồm 3 ứng dụng:
- **fleet-api** — Backend NestJS (REST + WebSocket)
- **fleet-admin** — Admin Dashboard Next.js
- **fleet-driver** — Driver Mobile App React Native (Expo)

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend API | NestJS + TypeScript | v10+ |
| Admin Frontend | Next.js (App Router) | v14+ |
| Driver Mobile | React Native (Expo) | SDK 52+ |
| Database | PostgreSQL + PostGIS | v15+ (Supabase) |
| Real-time | Socket.io (NestJS Gateway) | v4+ |
| Auth | JWT (Passport.js) | - |
| Maps | Mapbox GL JS + Directions API | - |
| Storage | Supabase Storage | - |
| Hosting | Vercel + Railway | Free tier |

## Project Structure

```
fleet-tracker/
├── fleet-api/              # NestJS Backend
│   ├── src/
│   │   ├── auth/           # JWT Auth module
│   │   ├── vehicles/       # Vehicle CRUD
│   │   ├── drivers/        # Driver CRUD
│   │   ├── orders/         # Order management
│   │   ├── dispatch/       # Auto-matching & assignment
│   │   ├── tracking/       # GPS WebSocket gateway
│   │   ├── alerts/         # Geofencing & violation alerts
│   │   ├── reports/        # KPI & analytics
│   │   ├── optimization/   # Route optimization & clustering
│   │   └── common/         # Shared DTOs, guards, pipes
│   └── ...
├── fleet-admin/            # Next.js Admin Dashboard
│   ├── app/
│   │   ├── (auth)/         # Login pages
│   │   ├── (dashboard)/    # Protected pages
│   │   │   ├── vehicles/
│   │   │   ├── drivers/
│   │   │   ├── orders/
│   │   │   ├── dispatch/
│   │   │   ├── tracking/   # Live map
│   │   │   └── reports/
│   │   └── ...
│   └── ...
├── fleet-driver/           # React Native Expo App
│   ├── app/                # Expo Router
│   │   ├── (auth)/
│   │   ├── (tabs)/
│   │   │   ├── trips/
│   │   │   ├── map/
│   │   │   └── profile/
│   │   └── ...
│   └── ...
└── docs/
    ├── BRIEF.md
    └── specs/
```

## Phases

| Phase | Name | Status | Tasks | Ước tính |
|-------|------|--------|-------|----------|
| 01 | Setup & Infrastructure | ✅ Complete | 12 | 2-3 ngày |
| 02 | Database & Authentication | ✅ Complete | 15 | 3-4 ngày |
| 03 | Backend — Core CRUD APIs | ✅ Complete | 18 | 4-5 ngày |
| 04 | Backend — Dispatch & Assignment | ✅ Complete | 10 | 3-4 ngày |
| 05 | Backend — Real-time GPS & Alerts | ✅ Complete | 14 | 5-7 ngày |
| 06 | Backend — Reports & Optimization | ✅ Complete | 12 | 4-5 ngày |
| 07 | Admin Dashboard — Core UI | ✅ Complete | 20 | 6-8 ngày |
| 08 | Admin Dashboard — Maps & Monitoring | ✅ Completed | 12 | 5-6 ngày |
| 09 | Admin Dashboard — Reports & Analytics | ✅ Complete | 10 | 3-4 ngày |
| 10 | Driver Mobile App | 🟡 In Progress | 16 | 7-10 ngày |

**Tổng: ~139 tasks | ~42-56 ngày**

## Dependencies Graph

```
Phase 01 (Setup)
    ↓
Phase 02 (DB + Auth)
    ↓
Phase 03 (Core CRUD) ←──────────────────────┐
    ↓                                        │
Phase 04 (Dispatch) ──→ Phase 07 (Admin UI) ─┘
    ↓                       ↓
Phase 05 (GPS/RT) ──→ Phase 08 (Admin Maps)
    ↓                       ↓
Phase 06 (Reports) ──→ Phase 09 (Admin Reports)
    ↓
Phase 10 (Driver App) — Cần Phase 02, 03, 05
```

## Quick Commands

```
Bắt đầu Phase 1:   /code phase-01
Xem progress:       /next
Lưu context:        /save-brain
Thiết kế DB/API:    /design
Thiết kế UI:        /visualize
```
