# Prarthna Platform - Next.js Admin Dashboard

This directory houses the standalone Next.js 15.1 administrative panel. It connects exclusively to the NestJS API gateway for updating scripture content, scheduling habits, uploading chanting audios, and monitoring analytics.

## Folder structure

```
prarthna-admin/
├── src/
│   └── app/               # Next.js App Router (Layouts & Pages)
│       ├── admin/
│       │   ├── audio/     # Audio Studio panel
│       │   ├── audit/     # Audit activity list
│       │   ├── content/   # Scripture library publisher
│       │   ├── dashboard/ # System statistics overview
│       │   ├── sankalp/   # Sankalp templates list
│       │   ├── settings/  # System configuration settings
│       │   ├── shloka/    # Daily shloka setup page
│       │   └── layout.tsx # Role-aware navigation sidebar layout
│       ├── globals.css    # Core styling tokens
│       ├── layout.tsx     # Global page wrapper
│       └── page.tsx       # Root entry redirector
├── docs/                  # Platform documentation files
└── package.json           # Scripts and dependencies
```

## Setup & Running Locally

### 1. Install Dependencies

Ensure you have `pnpm` installed and run:
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

Compile the production bundle (this runs TypeScript compiler checks and ESLint checks):
```bash
pnpm build
```

## Deploying to Vercel

Since this dashboard is completely decoupled, you can link this subfolder to Vercel directly as a standalone project:
- Framework Preset: **Next.js**
- Root Directory: **`prarthna-admin`**
- Configure `NEXT_PUBLIC_API_URL` pointing to your hosted NestJS backend domain.
