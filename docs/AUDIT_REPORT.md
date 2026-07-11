# Prarthna Platform - Engineering Audit Report

This report documents the solution architecture and engineering audit across the three codebases of the Prarthna platform.

## Audit Table

| Area         | Current State                                                                                                       | Problem                                                                                        | Risk       | Recommendation                                                                                                      | Priority |
| :----------- | :------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------ | :------- |
| **Security** | API lacks Firebase Auth verification (currently stubbed).                                                           | Unauthenticated requests could query or mutate sensitive user data.                            | **High**   | Implement Firebase Auth Guard using standard JWT validation.                                                        | **P0**   |
| **Security** | Mock/stub role-aware RBAC in Admin layout.                                                                          | Users can view/edit parts of the admin dashboard without server-enforced validation.           | **High**   | Enforce Server-Side Next.js session validation and NestJS API RBAC Guards.                                          | **P0**   |
| **Database** | Database URL is hardcoded or relies on system environment without validation.                                       | Application crash on boot if environment variables are missing or misconfigured.               | **Medium** | Integrate NestJS `@nestjs/config` with `joi` or `zod` schema verification for all environment variables.            | **P1**   |
| **Backend**  | Background jobs via pg-boss / BullMQ are not implemented yet.                                                       | Audio processing, transcribing, and bulk template generation would block the main HTTP thread. | **High**   | Build a dedicated worker process reading jobs from a PostgreSQL-backed queue.                                       | **P1**   |
| **Caching**  | No caching layer for scripture/content queries.                                                                     | DB bottleneck on launch if thousands of users fetch daily shlokas simultaneously.              | **Medium** | Implement memory caching in NestJS (`cache-manager`) for static content nodes/units.                                | **P1**   |
| **Mobile**   | State is held locally inside StatefulWidgets; Riverpod provider scoping exists but isn't used for data/audio state. | Hard to manage player synchronization, page re-rendering, and global offline syncing.          | **Medium** | Migrate screens to use Riverpod `StateNotifierProvider` or code-generated providers for playback and content state. | **P1**   |
| **Mobile**   | SQLite/Drift offline sync is stubbed.                                                                               | App cannot work offline or cache read verses for future sessions.                              | **Medium** | Implement local Drift DB repository and offline synchronization job.                                                | **P1**   |
| **Admin**    | React Hook Form and Zod are installed but forms are unvalidated placeholders.                                       | Bad/malformed inputs could bypass client side and crash API database constraints.              | **Medium** | Add Zod validation schemas for scripture content entry, templates, and settings.                                    | **P2**   |
| **Logging**  | Console logging is standard/unstructured.                                                                           | Hard to trace background errors, exceptions, or production API performance anomalies.          | **Low**    | Implement structured JSON logging (Winston or Pino) in backend.                                                     | **P2**   |
| **Testing**  | Admin panel has no unit or E2E tests configured.                                                                    | Visual regressions or layout issues could go unnoticed on changes.                             | **Low**    | Configure Jest and React Testing Library for core dashboard components.                                             | **P2**   |
| **Linting**  | Backend has no lint script or eslint setup, leading to interactive prompt blocks.                                   | Inconsistent styling and formatting across backend files in CI/CD.                             | **Low**    | Create `.eslintrc.json` at root of backend and add `lint` scripts to workspace apps.                                | **P2**   |

---

## Codebases Audited

1. **Flutter Mobile Application (`prarthna-mobile`)**: Static analysis, formatting, dependencies, routing shell, widget compilation, and unit/widget tests.
2. **Next.js Admin Dashboard (`prarthna-admin`)**: Production compilation, layout routing, client/server boundary definition, type-checking, and Tailwind CSS styles.
3. **Backend API and Database Platform (`prarthna-backend`)**: NestJS core compiles, Prisma database schema models, database connectivity health check, Swagger config, and Docker Compose services.

## Main Architecture Findings

### 1. Flutter Mobile App

- **Architecture:** Feature-first approach with screens split logically.
- **Navigation:** Premium GoRouter `StatefulShellRoute` setup prevents loss of tab state.
- **Offline Strategy:** Drift + SQLite planned but currently mock-driven.

### 2. Next.js Admin Panel

- **Architecture:** Next.js 15.1 App Router. Client/Server boundaries are correctly set.
- **Security:** Standard Next.js client-side role simulation. Needs server-side route guards.

### 3. NestJS Backend & Database

- **Architecture:** Monorepo using `pnpm` workspaces for package code-sharing (`contracts`, `validation`).
- **Prisma Integration:** Complete schema covering core entities. Validated schema compilation.
- **Health System:** Real database query verification for status uptime.

## Recommended Improvement Order

1. **Phase 1 (P0): Security & Identity**
   - Implement Firebase JWT token verification guard in NestJS.
   - Wire Next.js session validation and server-side redirects for admin roles.
2. **Phase 2 (P1): State & Offline Storage**
   - Introduce Riverpod providers to drive state in the mobile screens (instead of local stateful widgets).
   - Hook up Drift SQLite databases for offline local storage.
3. **Phase 3 (P1): Background Jobs & Queue**
   - Configure PostgreSQL-based background jobs for audio transcoding (FFmpeg) and template calculations.
4. **Phase 4 (P2): Validation & Testing**
   - Introduce Zod schema validation in admin forms.
   - Configure eslint settings and add test suites for Next.js.
