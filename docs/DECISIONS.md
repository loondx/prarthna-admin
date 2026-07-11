# Architectural Decisions Log

This document records the major architectural decisions made during the design and development of the Prarthna platform.

## ADR 1: Modular Monolith Over Microservices

- **Status:** Approved
- **Context:** Prarthna is a spiritual reading and habit-building app with moderate transactional traffic initially. The tech stack must be maintainable by a small engineering team without complex orchestration overhead.
- **Decision:** We use a modular monolith architecture. All business logic runs in a single `apps/api` NestJS server. Background jobs are decoupled via `apps/worker` but run in the same monorepo, sharing the same Prisma domain models.
- **Consequences:** Easier deployments, unified migrations, simpler transaction management, lower VPS resource utilization. We avoid microservices complexity.

## ADR 2: PostgreSQL and pg-boss for Background Jobs

- **Status:** Approved
- **Context:** The application requires background jobs (audio processing, notifications, Sankalp recalculation). A message broker or Redis is typically used for this (e.g., BullMQ).
- **Decision:** To minimize infrastructure complexity during the MVP phase, we will not deploy Redis. Instead, we use `pg-boss` which runs entirely on our existing PostgreSQL database.
- **Consequences:** One less service to maintain in Docker and production. Low memory footprint, reliable transactional integrity (jobs and business writes can run in the same database transactions).

## ADR 3: Generic Content Hierarchy

- **Status:** Approved
- **Context:** The app's first content collection is the Bhagavad Gita (Chapters and Verses), but the platform must easily support future content like the Ramayana (Kandas, Sargas, Verses), Shiv Purana, Hanuman Chalisa, Stotras, and custom collections.
- **Decision:** Do not create specific scripture tables (e.g., `GitaChapter`). We model content using generic tables: `ContentCollection`, `ContentNode`, `ContentUnit`, and `LocalizedContent`.
- **Consequences:** Flexibility to import any scripture structure. Schema changes are avoided when adding new text types.

## ADR 4: Local filesystem storage for MVP

- **Status:** Approved
- **Context:** The application processes audio files. These must be stored and served to mobile clients.
- **Decision:** Use local filesystem storage on the VPS for the MVP. A standard `StorageProvider` abstraction interface will be coded, allowing seamless migration to S3-compatible cloud storage in the future.
- **Consequences:** Simple uploads, low cost during MVP, easy backups. No external AWS/S3 dependencies.
