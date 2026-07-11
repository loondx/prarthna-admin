# Prarthna Platform - Next.js Admin Dashboard

This directory houses the standalone Next.js 15.1 administrative panel. It connects exclusively to the NestJS API gateway for updating scripture content, scheduling habits, uploading chanting audios, and monitoring analytics.

## Folder Structure

```
prarthna-admin/
├── src/
│   └── app/               # Next.js App Router (Layouts & Pages)
│       ├── admin/
│       │   ├── audio/     # Audio Studio panel
│       │   ├── audit/     # Audit activity list
│       │   ├── content/   # Scripture library publisher
│       │   ├── dashboard/ # System statistics overview
│       │   └── layout.tsx # Role-aware navigation sidebar layout
│       ├── globals.css    # Core styling tokens
│       └── page.tsx       # Root entry redirector
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
