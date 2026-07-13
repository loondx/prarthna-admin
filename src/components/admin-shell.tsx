'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StoreProvider, useStore } from '@/lib/store';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Toaster } from '@/components/ui/kit';

/**
 * Client shell for the whole app: providers always wrap children; the admin
 * chrome (sidebar + header) is skipped on public routes like /login.
 */

/** Inner header — must live inside both StoreProvider and AuthProvider trees */
function AdminHeader() {
  const pathname = usePathname();
  const { connected, apiLoading } = useStore();
  const { session, logout } = useAuth();

  return (
    <header className="h-16 border-b border-[#EFE6DD] bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-[#8C7E77] font-medium text-sm">Pages</span>
        <span className="text-[#EFE6DD] text-xs">/</span>
        <span className="text-[#8C5A3C] font-semibold uppercase tracking-wider text-xs">
          {pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* API Connection Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          {apiLoading ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          ) : connected ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#8C7E77]/40" />
          )}
          <span className={apiLoading ? 'text-amber-600' : connected ? 'text-emerald-700' : 'text-[#8C7E77]'}>
            {apiLoading ? 'Syncing…' : connected ? 'API Live' : 'Offline'}
          </span>
        </div>

        {/* Session User + Logout */}
        {session && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#FAF6F0] border border-[#EFE6DD] rounded-lg px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#8C5A3C] to-[#D99B26] flex items-center justify-center text-[9px] font-bold text-white">
                {session.name[0]}
              </div>
              <span className="text-xs font-semibold text-[#2D1E17]">{session.name.split(' ')[0]}</span>
              <span className="text-[9px] font-bold uppercase text-[#8C5A3C] bg-[#8C5A3C]/10 px-1.5 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-2 text-sm rounded-lg hover:bg-red-50 hover:text-red-600 text-[#8C7E77] transition-all border border-transparent hover:border-red-100"
            >
              ⬡
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Content Library', href: '/content', icon: '📚' },
  { name: 'Manage Prayers', href: '/prayers', icon: '🙏' },
  { name: 'Audio Studio', href: '/audio', icon: '🎙️' },
  { name: 'Daily Shloka', href: '/shloka', icon: '🕉️' },
  { name: 'Sankalp Templates', href: '/sankalp', icon: '📝' },
  { name: 'Festivals', href: '/festivals', icon: '🪔' },
  { name: 'Notifications', href: '/notifications', icon: '🔔' },
  { name: 'Admin Users', href: '/admins', icon: '👤' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
  { name: 'Audit Logs', href: '/audit', icon: '📜' },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#FAF6F0] text-[#2D1E17]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#EFE6DD] bg-[#2D1E17] text-white flex flex-col justify-between shadow-lg shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3">
            <span className="text-2xl">🕉️</span>
            <div>
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#D99B26] tracking-wider">
                PRARTHNA
              </span>
              <p className="text-[10px] text-amber-200/60 uppercase tracking-widest font-semibold">Admin Panel</p>
            </div>
          </div>

          <nav className="p-4 space-y-0.5">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#8C5A3C] text-white shadow-md'
                      : 'text-[#D9CFC7]/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer — shows real session user */}
        <SidebarFooter />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

function SidebarFooter() {
  const { session, logout } = useAuth();
  return (
    <div className="p-4 border-t border-white/10 bg-black/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8C5A3C] to-[#D99B26] flex items-center justify-center font-bold text-white shadow-lg text-sm shrink-0">
          {session?.name?.[0] ?? 'A'}
        </div>
        <div className="overflow-hidden flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{session?.name ?? 'Admin'}</p>
          <p className="text-[10px] text-white/50 truncate">{session?.email ?? ''}</p>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="text-white/30 hover:text-red-400 transition-colors text-sm shrink-0"
        >
          ↩
        </button>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <ShellSwitch>{children}</ShellSwitch>
      </StoreProvider>
    </AuthProvider>
  );
}

/** Public routes render without the admin chrome. */
function ShellSwitch({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/login')) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
