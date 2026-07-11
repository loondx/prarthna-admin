# Locked Technology Stack

This document locks the versions of all frameworks, libraries, and tools used in the Prarthna project to ensure consistent and reproducible development, testing, and production environments.

## Platform (Backend & Worker)

| Technology             | Version     | Purpose                                  |
| ---------------------- | ----------- | ---------------------------------------- |
| **Node.js**            | `22.22.2`   | Production LTS runtime                   |
| **TypeScript**         | `5.7.2`     | Programming language                     |
| **NestJS**             | `10.4.15`   | REST API framework (`apps/api`)          |
| **Prisma**             | `6.1.0`     | Database ORM                             |
| **pg-boss**            | `9.0.3`     | PostgreSQL-backed background job queue   |
| **PostgreSQL**         | `16-alpine` | Relational database (Docker container)   |
| **FFmpeg**             | `6.x`       | Audio processing (worker)                |
| **Firebase Admin SDK** | `13.0.1`    | Auth verification and push notifications |

## Admin Dashboard (Frontend)

| Technology          | Version  | Purpose                                    |
| ------------------- | -------- | ------------------------------------------ |
| **Next.js**         | `15.1.3` | Admin dashboard application (`apps/admin`) |
| **React**           | `19.0.0` | UI library (Next.js 15 peer)               |
| **Tailwind CSS**    | `3.4.17` | Utility-first CSS styling                  |
| **TanStack Query**  | `5.62.7` | Client-side state and data fetching        |
| **React Hook Form** | `7.54.1` | Form state management                      |
| **Zod**             | `3.24.1` | Runtime schema validation                  |

## Mobile Application

| Technology        | Version   | Purpose                      |
| ----------------- | --------- | ---------------------------- |
| **Flutter SDK**   | `3.44.6`  | Cross-platform mobile SDK    |
| **Dart SDK**      | `3.12.2`  | Programming language         |
| **Riverpod**      | `2.5.2`   | Reactive state management    |
| **GoRouter**      | `14.3.0`  | Declarative routing          |
| **Dio**           | `5.7.0`   | HTTP client                  |
| **Drift**         | `2.22.0`  | Reactive SQLite database     |
| **just_audio**    | `0.9.42`  | Audio playback engine        |
| **audio_service** | `0.18.15` | Background audio integration |

## Infrastructure & DevOps

| Tool               | Version  | Purpose                             |
| ------------------ | -------- | ----------------------------------- |
| **Docker**         | `29.5.0` | Containerization platform           |
| **Docker Compose** | `v5.1.3` | Local multi-container orchestration |
| **Nginx**          | `1.27.x` | Reverse proxy and media server      |
| **Uptime Kuma**    | `1.23.x` | Service monitoring                  |
