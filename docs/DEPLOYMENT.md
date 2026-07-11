# Deployment & Infrastructure Guide

This document describes the hosting, server setups, and automated deployment processes for the Prarthna platform.

## Infrastructure Architecture

The MVP runs entirely on a single Ubuntu VPS using Docker Compose to isolate services.

                    ┌──────────────────────────────────────────────┐
                    │                 Vercel                       │
                    │                                              │
                    │         Next.js Admin Dashboard (Serverless) │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           │ HTTPS requests
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │                 Ubuntu VPS                   │
                    │                                              │
                    │                  Port 443                    │
                    │                      │                       │
                    │                      ▼                       │
                    │                Nginx Reverse                 │
                    │                    Proxy                     │
                    │             (SSL by Let's Encrypt)           │
                    │                      │                       │
                    │                      ▼                       │
                    │                  Port 3001                   │
                    │                      │                       │
                    │               ┌─────────────┐                │
                    │               │  NestJS API │                │
                    │               │ (apps/api)  │                │
                    │               └──────┬──────┘                │
                    │                      │                       │
                    │                      ▼                       │
                    │                ┌───────────┐  ┌─────────────┐│
                    │                │ Postgres  │◄─┤ NestJS      ││
                    │                │ Database  │  │ Worker      ││
                    │                └───────────┘  │(apps/worker)││
                    │                               └─────────────┘│
                    └──────────────────────────────────────────────┘

---

## Service Ports

| Service           | Host Port    | Internal Port | Environment | Accessible Publicly?      |
| ----------------- | ------------ | ------------- | ----------- | ------------------------- |
| **PostgreSQL**    | `5432`       | `5432`        | Development | No (bound to `127.0.0.1`) |
| **NestJS API**    | `3001`       | `3001`        | Dev / Prod  | Yes (via Nginx proxy)     |
| **Next.js Admin** | `Serverless` | `N/A`         | Prod        | Yes (Direct Vercel URL)   |

---

## Environment Variables (.env)

The root folder contains a `.env.example` file specifying the variables required by the services.

### Essential Variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `PORT`: Port for the API server (default `3001`).
- `JWT_SECRET`: Secret key for JWT signatures (fallback/dev auth).
- `FIREBASE_PROJECT_ID`: ID of the Firebase Auth project.
- `FIREBASE_CLIENT_EMAIL`: Service account email.
- `FIREBASE_PRIVATE_KEY`: Service account certificate key.

---

## Production Build & Run Command

To build and run all services in production mode locally or on the VPS:

```bash
# Build production assets for NestJS apps and Next.js admin
pnpm build

# Start services using docker-compose
docker compose -f docker-compose.prod.yml up -d
```
