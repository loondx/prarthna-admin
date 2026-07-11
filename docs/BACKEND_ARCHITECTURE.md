# NestJS Backend API Architecture

This document outlines the architecture, layout, design principles, and request-response lifecycle of the backend platform.

## Architecture Overview

The backend uses a modular monorepo layout powered by NestJS and pnpm workspaces:

- **`apps/api`:** NestJS API gateway, controller, and HTTP interface.
- **`apps/worker`:** Background event polling, long-running tasks, and audio transcoding.
- **`packages/contracts`:** Shared TypeScript types, API interfaces, and schemas.
- **`packages/validation`:** Shared input validation decorators and DTOs.
- **`prisma/`:** Database models, relations, and migrations.

## Module Structure

NestJS modules group related controllers, services, and repositories:

- **`PrismaModule` (Global):** Instantiates the global `PrismaService` which connects and disconnects Postgres connection pooling on NestJS lifecycle start/stop.
- **`AuthModule`:** Firebase JWT validation, session validation, and RBAC guards.
- **`ContentModule`:** Manages ContentCollection, ContentNode, and ContentUnit entities.
- **`SankalpModule`:** Active habit plans, streaks, and progress calculations.
- **`AudioModule`:** Audio transcoding status and file uploads.
- **`SystemModule`:** Terminus health check controller.

## Request Lifecycle

1. **HTTP Request:** Hits port 3001. Prefix `/v1/` route is resolved.
2. **Middleware:** CORS and helmet headers are verified.
3. **Guards:** `FirebaseAuthGuard` validates the Bearer token. `RolesGuard` matches user claims against requested endpoints.
4. **Interceptors:** Serializes payloads and records audit actions.
5. **Pipes:** NestJS `ValidationPipe` utilizes `class-validator` to enforce correct formats.
6. **Controller:** Maps request parameters to services.
7. **Service:** Executes database queries via Prisma client.
8. **HTTP Response:** Returns JSON payloads with consistent error schemas.
