# Next.js Admin Dashboard Architecture

This document describes the design pattern, role-based layout, and state synchronization strategy of the Next.js admin dashboard.

## Design Concept & Technology Stack

The dashboard is built on **Next.js 15 (App Router)** and styled using **Tailwind CSS**.

- **App Router:** Routing is organized hierarchically inside `src/app/admin/`.
- **Global Theme:** Dark mode first (`#09090b` background), high-contrast borders, orange/amber gradients, and micro-interactions.
- **Client & Server Component Boundaries:**
  - Layout (`layout.tsx`) handles client state like side-bar toggles and mock role switcher (`'use client'`).
  - Child pages (`page.tsx`) leverage Server Components for initial rendering where possible, fetching configuration from Next.js server actions or proxying to the NestJS API.

## Database Separation Rule

> [!IMPORTANT]
> The admin dashboard MUST NEVER connect directly to the PostgreSQL database.

All database queries and mutations must occur through NestJS API endpoints. This maintains a clean boundary, preserves single-source-of-truth business rules, and simplifies deployment.

## Role-Based Access Control (RBAC)

The dashboard supports granular role restrictions:

- **`super_admin`:** Unrestricted access to all pages including Audit Logs, Settings, and Audio Studio.
- **`editor`:** Access to Content Library, Daily Shloka, and Sankalp Templates.
- **`reviewer`:** Access to Content Library, Audio Studio.
- **`audio_manager`:** Access to Audio Studio.
- **`analytics`:** Access to Dashboard charts.

Client-side routes render locked visual indicators when the current user's role does not match the page requirements. Enforced server-side checks reject API calls via JWT token introspection.

## Form Handling & API Queries

- **TanStack Query:** Manages client-side API state caching, background refetching, and pagination state.
- **React Hook Form + Zod:** Validates structured scripture imports, audio metadata, and settings values before submission.
