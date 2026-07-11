# Database Schema & Migrations

This document details the PostgreSQL schema designed via Prisma ORM for the Prarthna platform.

## Database Design Guidelines

1. **Migrations-driven:** All schema changes must be declared in `prisma/schema.prisma` and applied via `prisma migrate dev`. Direct database modifications are forbidden.
2. **No scripture-specific tables:** All scriptures (Bhagavad Gita, Ramayana) are normalized into the generic content tables.
3. **Database Indexes:** Indexes must be added to all foreign keys and frequently queried fields (e.g., `userId`, `collectionId`, `nodeId`, `syncStatus`).
4. **Soft Deletion:** Business-critical entities must support soft-deletion via a `deletedAt` timestamp instead of hard DELETE operations.
5. **No Business Rules in DB:** Do not use database triggers, stored procedures, or foreign key cascading behaviors that execute complex business logic. Let NestJS handle integrity constraints where practical.

---

## Core Entities

Below is the layout of the database tables implemented in `apps/api/prisma/schema.prisma`.

### 1. User & Identity Management

- **`User`**: Tracks the user account.
  - Fields: `id`, `firebaseUid` (unique, indexed), `email` (unique, indexed), `role` (USER, ADMIN, MODERATOR), `createdAt`, `updatedAt`, `deletedAt`.

### 2. Generic Content Library

- **`ContentCollection`**: Top-level scripture or prayer collections.
  - Fields: `id`, `title`, `type` (e.g. "SCRIPTURE"), `description`, `createdAt`, `updatedAt`, `deletedAt`.
- **`ContentNode`**: Hierarchical structure for chapters/divisions, supporting recursive nesting.
  - Fields: `id`, `collectionId` (foreign key, indexed), `parentId` (self-referencing parent foreign key, indexed), `title`, `order`, `createdAt`, `updatedAt`, `deletedAt`.
- **`ContentUnit`**: Leaf content nodes (verses, chaupais, stanzas).
  - Fields: `id`, `nodeId` (foreign key, indexed), `verseNumber`, `contentSanskrit`, `contentEnglish`, `createdAt`, `updatedAt`, `deletedAt`.
- **`MediaAsset`**: Audio tracks linked to specific content units.
  - Fields: `id`, `contentUnitId` (foreign key, indexed), `audioUrl`, `duration` (seconds), `size` (bytes), `createdAt`, `updatedAt`, `deletedAt`.

### 3. Habits & Sankalp

- **`Sankalp`**: User spiritual commitments.
  - Fields: `id`, `userId` (foreign key, indexed), `title`, `description`, `targetDays`, `currentDays`, `progress` (float), `status` (ACTIVE, COMPLETED, ABANDONED), `createdAt`, `updatedAt`, `deletedAt`.

### 4. Admin & Auditing

- **`AuditLog`**: System audit records for tracking admin edits.
  - Fields: `id`, `userId` (foreign key, indexed), `entityName`, `action` (CREATE, UPDATE, DELETE), `beforeState` (JSON), `afterState` (JSON), `createdAt`.
- **`JobQueue`**: Handled via PostgreSQL-backed `pg-boss` queue tables inside the `pgboss` database schema.
