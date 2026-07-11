# Performance Optimization Guidelines

This document details the performance constraints, latency benchmarks, and optimization strategies for the Prarthna codebases.

## 1. Flutter Mobile Performance

To achieve 60/120 FPS rendering without stutter:

- **Minimize Rebuilds:** Declare widgets as `const` wherever possible. Rebuilding a widget with `const` does not re-instantiate it.
- **Lazy Rendering:** Grid and list displays must use `ListView.builder` or `GridView.builder` instead of default constructor columns. This dynamically renders only items visible on screen.
- **Audio Decoding:** Caching audio metadata locally avoids double network calls when scrubbing or skipping tracks.

## 2. Next.js Admin Performance

- **Static Pre-rendering:** Pages that do not change based on user session data (like general settings layouts or static pages) are marked for Static Site Generation (SSG).
- **Asset Optimization:** Use Next.js `<Image>` tags for dashboard logos to compress assets on the fly.
- **Bundle Optimization:** Avoid importing massive library sets unless tree-shaken correctly (e.g. only import required icons rather than an entire package library).

## 3. NestJS API & Database Performance

- **Prisma Connection Pooling:** Tune Prisma pool size to allow concurrent queries without exhausting database connection limits.
- **N+1 Query Prevention:** When querying ContentCollections, fetch related ContentNodes using Prisma's `.include` flag in a single joined select, rather than executing sequential select loops.
- **Database Indexes:** Foreign keys and fields queried by where clauses (e.g. `userId`, `firebaseUid`, `nodeId`) MUST possess corresponding B-Tree indexes inside `schema.prisma`.
