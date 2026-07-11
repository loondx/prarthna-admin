# Next.js Admin Panel Developer Guide (CLAUDE.md)

## Workspace Architecture

This project is a standalone Next.js 15.1 dashboard. It does not contain any database drivers and communicates exclusively over HTTP with the NestJS API gateway.

---

## Build & Development Commands

- Install dependencies: `pnpm install`
- Start local development server: `pnpm dev`
- Build for production: `pnpm build`
- Start production server locally: `pnpm start`

---

## Guidelines & Standards

1. **Database Separation:** Do not import db drivers or prisma client here. Use HTTP/REST requests.
2. **Components Boundary:** Ensure `'use client'` tags are placed on components holding hooks or interactive state.
3. **Role Lockouts:** Support client-side visually locked state indicators and server-side JWT verification checks.
4. **Layout:** Keep layout styling consistent with the dark theme and brand colors.
