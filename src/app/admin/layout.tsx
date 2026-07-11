'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StoreProvider, useStore } from '@/lib/store';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Toaster } from '@/components/ui/kit';

/** Inner header — must live inside both StoreProvider and AuthProvider trees */
function AdminHeader({ currentRole, setCurrentRole }: { currentRole: string; setCurrentRole: (r: string) => void }) {
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
            {apiLoading ? 'Syncing…' : connected ? 'API Live' : 'Local Mode'}
          </span>
        </div>

        {/* Role Switcher (dev only) */}
        <div className="flex items-center gap-2 bg-[#FAF6F0] border border-[#EFE6DD] rounded-lg px-3 py-1.5 shadow-inner">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7E77]">Role:</label>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="bg-transparent text-xs text-[#8C5A3C] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="super_admin">Super Admin</option>
            <option value="editor">Content Editor</option>
            <option value="reviewer">Reviewer</option>
            <option value="audio_manager">Audio Manager</option>
            <option value="analytics">Analytics Viewer</option>
          </select>
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
                {session.role.replace('_', ' ')}
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
  allowedRoles: string[];
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊', allowedRoles: ['super_admin', 'editor', 'reviewer', 'audio_manager', 'analytics'] },
  { name: 'Content Library', href: '/admin/content', icon: '📚', allowedRoles: ['super_admin', 'editor', 'reviewer'] },
  { name: 'Audio Studio', href: '/admin/audio', icon: '🎙️', allowedRoles: ['super_admin', 'audio_manager', 'reviewer'] },
  { name: 'Daily Shloka', href: '/admin/shloka', icon: '🕉️', allowedRoles: ['super_admin', 'editor'] },
  { name: 'Sankalp Templates', href: '/admin/sankalp', icon: '📝', allowedRoles: ['super_admin', 'editor'] },
  { name: 'Festivals', href: '/admin/festivals', icon: '🪔', allowedRoles: ['super_admin', 'editor'] },
  { name: 'Notifications', href: '/admin/notifications', icon: '🔔', allowedRoles: ['super_admin', 'editor'] },
  { name: 'Admin Users', href: '/admin/admins', icon: '👤', allowedRoles: ['super_admin'] },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️', allowedRoles: ['super_admin'] },
  { name: 'Audit Logs', href: '/admin/audit', icon: '📜', allowedRoles: ['super_admin'] },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<string>('super_admin');

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
              const isAllowed = item.allowedRoles.includes(currentRole);
              const isActive = pathname === item.href;

              return (
                <div key={item.name}>
                  {isAllowed ? (
                    <Link
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
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/20 cursor-not-allowed select-none">
                      <span className="text-base opacity-20">{item.icon}</span>
                      <span className="line-through">{item.name}</span>
                      <span className="ml-auto text-[9px] uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded text-white/30 font-bold border border-white/10">
                        Locked
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer — shows real session user */}
        <SidebarFooter />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader currentRole={currentRole} setCurrentRole={setCurrentRole} />
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </StoreProvider>
    </AuthProvider>
  );
}
