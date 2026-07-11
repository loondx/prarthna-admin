# Milestone 1: Research Documentation

In accordance with Section 16 (Official Documentation Rule), we reviewed the following official references prior to structuring the monorepo, backend health systems, Next.js shells, and Flutter navigation.

| Source URL | Topic | Recommendation | Project Decision |
|------------|-------|----------------|------------------|
| [pnpm workspaces](https://pnpm.io/workspaces) | Monorepo Setup | Declare workspaces using `pnpm-workspace.yaml` and reference local packages via `workspace:*`. | Implemented `pnpm-workspace.yaml` referencing `apps/*` and `packages/*`. |
| [NestJS Health Checks](https://docs.nestjs.com/recipes/terminus) | API & DB Health check | Use NestJS Terminus recipe with `@nestjs/terminus` to manage health indicators for db, disk, memory, etc. | Set up basic health indicator returning status for database and memory checks. |
| [Next.js App Router Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) | Admin Sidebar Shell | Utilize nested layouts (`layout.tsx`) to persist shared sidebar state and header UI without re-rendering. | Created `/admin/layout.tsx` enclosing administrative sub-routes. |
| [Flutter Navigation Bar](https://api.flutter.dev/flutter/material/NavigationBar-class.html) | Mobile Tab Navigation | Use Material 3 `NavigationBar` for standard modern navigation paradigms, wrapping states with index selectors. | Implemented state-based tab selection using `NavigationBar` in Flutter. |
| [Docker Compose Healthcheck](https://docs.docker.com/reference/compose-file/services/#healthcheck) | PostgreSQL Readiness | Configure service-level `healthcheck` in postgres and mark api as `depends_on: postgres: condition: service_healthy`. | Added healthchecks to postgres service to prevent API from connecting before the database is ready. |
