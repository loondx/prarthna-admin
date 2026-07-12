# Prarthna Platform - Next.js Admin Dashboard

This directory houses the standalone Next.js 16 administrative panel. It connects exclusively to the NestJS API gateway for updating scripture content, scheduling habits, uploading chanting audios, and monitoring analytics.

## Folder Structure

```
prarthna-admin/
├── src/
│   ├── app/               # Next.js App Router — one dir per section
│   │   ├── dashboard/     # Live statistics from /admin/stats
│   │   ├── content/       # Collections CRUD (create/edit/delete/publish) + chapter & verse manager
│   │   ├── audio/         # Real uploads → /content/media/upload + review queue
│   │   ├── shloka/ sankalp/ festivals/ notifications/ admins/ settings/ audit/
│   │   ├── layout.tsx     # Navigation sidebar layout
│   │   └── page.tsx       # Root entry redirector
│   ├── lib/
│   │   ├── api.ts         # Central typed API client (env base URL, JWT header, 401 handling)
│   │   ├── store.tsx      # Backend-driven data store + typed mutation actions
│   │   └── auth.tsx       # Admin session (JWT cookie ↔ /admin/login, /admin/me)
│   └── proxy.ts           # Route gate: redirects unauthenticated visits to /login
├── package.json           # Scripts and dependencies
└── pnpm-workspace.yaml    # Node workspaces configuration
```

---

## Setup & Running Locally

### 1. Install Dependencies
Ensure you have Node.js and `pnpm` installed, then run:
```bash
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file inside the root folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start Development Server
Run the Next.js dev server:
```bash
pnpm dev
```
Open `http://localhost:3000` to preview the interface.

### 4. Build for Production
```bash
pnpm build
```

---

## Production Deployment

The panel is a stateless Next.js app that talks to the API over HTTPS.

1. **Environment** — set `NEXT_PUBLIC_API_URL` to the API's public base URL (no trailing slash,
   no `/api/v1`). It is inlined at build time, so build after setting it.
2. **Build & run**
   ```bash
   pnpm install --frozen-lockfile
   pnpm build
   pnpm start            # serves the optimized production build (default :3000)
   ```
3. **Type/lint gate** — `pnpm lint` runs `tsc --noEmit`; the build fails on type errors.
4. **CORS** — the API's `CORS_ORIGINS` must include this panel's public origin.
5. **Auth** — a single admin account type; the JWT is stored in a `SameSite=Strict` cookie
   (adds `Secure` automatically over HTTPS). `src/proxy.ts` redirects unauthenticated requests
   to `/login`; the API is the source of truth for every read and write (no mock/local data).

---

## Multi-Device Git Workflow & Collaboration

To work seamlessly across multiple machines, follow these steps:

### 1. Synchronize Before Coding
Always align your local state with the remote server:
```bash
git checkout main
git pull origin main
```

### 2. Lockfile Sync
When updating dependencies on one machine, push both the updated `package.json` and the `pnpm-lock.yaml` file so other devices pull clean, identical dependency versions.

### 3. Resolving Build Cache Errors
If Next.js crashes due to cached artifacts on a different OS/device:
```bash
rm -rf .next node_modules
pnpm install
```
