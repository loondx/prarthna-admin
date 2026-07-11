# Caching & Background Jobs Specification

This document details the scheduling, task queues, and caching design for the Prarthna platform.

## Caching Strategy

To maximize query speed and minimize database read load (prioritizing system performance):

- **In-Memory Cache:** Use NestJS `cache-manager` inside the API.
- **Cache Targets:**
  - `GET /v1/content/collections/*` (TTL: 24 hours, invalidated on admin content updates)
  - `GET /v1/content/nodes/*` (TTL: 12 hours)
  - `GET /v1/content/units/*` (TTL: 12 hours)
- **Invalidation:** Implement cache invalidation hooks inside admin-facing controllers. When an editor updates a collection or shloka, the respective key is purged.

## Background Jobs Strategy

Long-running or async tasks are decoupled from HTTP request handling using a PostgreSQL-backed job queue (**pg-boss**):

```
HTTP Request ──> NestJS API ──> Insert Job into pgboss.job ──> Commit to Postgres
                                                                    │
NestJS Worker App <── Polls Jobs <── pgboss.job Table <─────────────┘
```

### Queue Instances

1. **Audio Transcoding Queue:** Manages FFmpeg processing and audio variant transcoding.
2. **Streak & Sankalp Recalculation Queue:** Cron job running daily at midnight UTC to increment streaks and calculate daily reading template plans.
3. **Notification Queue:** Dispatches Firebase Cloud Messages (FCM) to active mobile device tokens.

### Advantages of pg-boss over Redis

- **Dependency Minimization:** Reuses the existing PostgreSQL infrastructure, avoiding the overhead of managing Redis in the initial stages.
- **Transaction Consistency:** Job dispatch is scoped inside the database transaction, ensuring no lost jobs if the HTTP controller fails to commit.
- **Easy Maintenance:** Backups of database capture both app state and pending queue jobs simultaneously.
