# System Architecture & Design

This document details the architectural rules and structural patterns for the Prarthna platform.

## 1. Architectural Style: Modular Monolith

Prarthna is built as a modular monolith. All business modules run in a single deployable backend service (`apps/api`), with a separate background worker (`apps/worker`) running tasks off a shared database queue.

### Core Architecture Rules

1. **No Redis during MVP:** All caching, session management, and job queues are backed by PostgreSQL.
2. **PostgreSQL Jobs:** Background tasks use `pg-boss` running on PostgreSQL.
3. **Application Domain Boundaries:** Business rules must reside in the NestJS application/domain layer. NestJS controllers delegate logic to application services.
4. **No Database Access from Frontend:** The Next.js admin dashboard must never connect directly to the database; it must use the `/v1` REST API of `apps/api`.
5. **No Business Rules in UI:** Neither Next.js page components nor Flutter widgets should contain database queries or core business logic.

---

## 2. Multi-Repository Workspace Structure

The platform is organized into three separate standalone project directories:

```
prarthna-platform/
├── prarthna-backend/       # NestJS API, Background Worker, packages & Prisma schema
│   ├── apps/
│   │   ├── api/            # NestJS API App
│   │   └── worker/         # NestJS Worker App
│   ├── packages/
│   │   ├── contracts/
│   │   └── validation/
│   ├── prisma/             # Schema & migrations
│   └── docker-compose.yml  # PostgreSQL & Redis infrastructure containers
├── prarthna-admin/         # Standalone Next.js 15.1 Vercel-ready dashboard
│   ├── src/
│   │   └── app/            # App Router routes and screens
│   └── package.json
└── prarthna-mobile/        # Standalone Flutter 3.44.6/Dart 3.12.2 application
    ├── lib/
    │   ├── screens/        # Home, Library, Sankalp, Community, Profile screens
    │   └── main.dart       # Routing and Riverpod Providers
    └── pubspec.yaml
```

---

## 3. Generic Content Hierarchy

To support diverse spiritual scriptures (Bhagavad Gita, Ramayana, Puranas, custom collections) without redesigning tables, we use a single, generic hierarchy:

```
Content Collection (e.g., Bhagavad Gita)
  └── Content Node (e.g., Chapter)
        └── Child Content Node (e.g., Sub-section or Sarga - optional)
              └── Content Unit (e.g., Verse / Shloka)
```

### Database Tables (Prisma)

- **`ContentCollection`**: Represents a book/scripture (e.g., Bhagavad Gita).
- **`ContentNode`**: Represents a structural divider (e.g., Chapter 1). Nodes can self-reference parent nodes for arbitrary nesting (e.g., Collection -> Kanda -> Sarga -> Verse).
- **`ContentUnit`**: Represents the leaf nodes (e.g., Verse 1).
- **`LocalizedContent`**: Key-value translations and transliterations (e.g., Sanskrit original text, English translation, commentary).
- **`ContentSource`**: Source attribution (e.g., translator, author).
- **`MediaAsset`**: Audio/video mappings.
- **`AudioVariant`**: Specific files, formats, bitrates, and durations.

No scripture-specific tables like `BhagavadGitaChapter` are allowed.

---

## 4. API Design Standards

- **Routing:** Versioned REST routes under `/v1/`.
- **OpenAPI:** Swagger specifications generated automatically from NestJS controllers.
- **Format:** Errors must conform to **RFC 9457-style Problem Details**.
- **Security:** Access token authentication, role-based permissions verified backend-side, and request validation.

---

## 5. Offline & Sync Design

The mobile application implements an **outbox-based synchronization pattern**:

1. Actions taken offline (reading progress, bookmarks, local Sankalp progress) are saved to the local SQLite database (via Drift) and appended to a sync queue.
2. The UI shows a "pending sync" status indicator.
3. When network connectivity returns, the queue is drained sequentially using idempotent API endpoints.
4. **Progress Guard:** Progress timestamps are validated. Server progress can never roll backward because an older client synced later.
