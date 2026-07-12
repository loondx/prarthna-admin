'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DonutChart, LineChart, StatusBadge } from '@/components/ui/kit';

const USER_GROWTH = [
  { label: '1 Jun', value: 8200 },
  { label: '8 Jun', value: 9100 },
  { label: '15 Jun', value: 9800 },
  { label: '22 Jun', value: 10900 },
  { label: '29 Jun', value: 11700 },
  { label: '6 Jul', value: 12460 },
  { label: '12 Jul', value: 12840 },
];

interface LiveStats {
  totalUsers: number;
  totalCollections: number;
  totalFestivals: number;
  totalSankalps: number;
  recentAuditLogs: any[];
}

function StatCard({
  name, value, subtext, icon, color, href,
}: {
  name: string; value: string | number; subtext: string; icon: string; color: string; href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-[#EFE6DD] rounded-2xl p-6 transition-all duration-300 hover:border-[#8C5A3C]/40 hover:shadow-lg hover:-translate-y-0.5 block group"
    >
      <div className="flex items-center justify-between">
        <span className="text-[#8C7E77] text-xs font-semibold uppercase tracking-wider">{name}</span>
        <span className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
          {icon}
        </span>
      </div>
      <div className="mt-4">
        <span className="text-3xl font-bold tracking-tight text-[#2D1E17]">{value}</span>
        <p className="text-xs text-[#8C7E77] mt-1.5">{subtext}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { data } = useStore();
  const { token } = useAuth();
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Pull real stats from backend
  useEffect(() => {
    if (!token) return;
    apiGet<LiveStats>('/admin/stats')
      .then((d) => setLiveStats(d))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [token]);

  const published = data.collections.filter((c) => c.status === 'Published').length;
  const audioPublished = data.audio.filter((a) => a.status === 'published').length;
  const activeFestivals = data.festivals.filter((f) => f.status === 'Active').length;
  const scheduled = data.notifications.filter((n) => n.status === 'Scheduled').length;

  const stats = [
    {
      name: 'Registered Users',
      value: liveStats ? liveStats.totalUsers.toLocaleString() : '—',
      subtext: statsLoading ? 'Loading from DB…' : `${liveStats?.totalSankalps ?? 0} active sankalps`,
      icon: '👤',
      color: 'from-[#8C5A3C] to-[#D99B26]',
      href: '/dashboard',
    },
    {
      name: 'Published Collections',
      value: liveStats ? `${liveStats.totalCollections}` : `${published}/${data.collections.length}`,
      subtext: statsLoading ? 'Loading from DB…' : `${data.collections.length - published} in draft`,
      icon: '📚',
      color: 'from-[#4E785A] to-[#6A8F74]',
      href: '/content',
    },
    {
      name: 'Audio Tracks Live',
      value: `${audioPublished}`,
      subtext: `${data.audio.length - audioPublished} in pipeline`,
      icon: '🎙️',
      color: 'from-[#E05B35] to-[#8C5A3C]',
      href: '/audio',
    },
    {
      name: 'Active Festivals',
      value: liveStats ? `${liveStats.totalFestivals}` : `${activeFestivals}`,
      subtext: `${scheduled} notification${scheduled === 1 ? '' : 's'} scheduled`,
      icon: '🪔',
      color: 'from-[#8C5A3C] to-[#A67C52]',
      href: '/festivals',
    },
  ];

  const upcoming = [...data.festivals]
    .filter((f) => new Date(f.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const auditDisplay = liveStats?.recentAuditLogs?.length
    ? liveStats.recentAuditLogs.map((l: any) => ({
        id: l.id,
        actor: l.user?.email ?? 'System',
        action: l.action,
        module: l.entityName,
        date: new Date(l.createdAt).toLocaleString(),
      }))
    : data.audit.slice(0, 5).map((a) => ({ id: a.id, actor: a.actor, action: a.action, module: a.module, date: a.date }));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="animate-rise-in rounded-2xl bg-gradient-to-r from-[#8C5A3C] via-[#9E6F4D] to-[#D99B26] p-8 shadow-xl shadow-[#8C5A3C]/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 text-[180px] pointer-events-none font-bold text-white leading-none">
          🕉️
        </div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome to Prarthna Admin</h1>
          <p className="text-[#FAF6F0] text-sm leading-relaxed opacity-90">
            Manage scriptures, audio pipeline, sankalp templates, festivals, and notifications — all connected to your live PostgreSQL database.
          </p>
        </div>
        {/* Live DB indicator */}
        {liveStats && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/20 rounded-full px-3 py-1.5 text-[11px] text-white/80 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live DB Connected
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger">
        <div className="lg:col-span-2 bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2D1E17] flex items-center gap-2">
              <span>📈</span> User Growth
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              +14% this week
            </span>
          </div>
          <LineChart points={USER_GROWTH} />
        </div>

        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#2D1E17] mb-4 flex items-center gap-2">
            <span>🧭</span> Content Mix
          </h2>
          <DonutChart
            slices={[
              { label: 'Verses', value: 700, color: '#8C5A3C' },
              { label: 'Audio', value: 320, color: '#D99B26' },
              { label: 'Mantras', value: 108, color: '#4E785A' },
              { label: 'Notes', value: 96, color: '#E05B35' },
            ]}
          />
          <p className="text-[11px] text-[#8C7E77] mt-4 leading-relaxed">
            Bhagavad Gita fully seeded. Audio coverage at 46% of published verses.
          </p>
        </div>
      </div>

      {/* Upcoming festivals + audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger">
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#2D1E17] flex items-center gap-2">
              <span>🪔</span> Upcoming Festivals
            </h2>
            <Link href="/festivals" className="text-[11px] font-bold text-[#8C5A3C] hover:underline">
              Manage →
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((f) => {
              const days = Math.ceil((new Date(f.date).getTime() - Date.now()) / 86400000);
              return (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6F0]/60 border border-[#EFE6DD]">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#2D1E17]">{f.name}</p>
                      <p className="text-[10px] text-[#8C7E77]">{f.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#8C5A3C] bg-[#8C5A3C]/10 px-2 py-0.5 rounded-full">
                    {days <= 0 ? 'Today' : `in ${days}d`}
                  </span>
                </div>
              );
            })}
            {upcoming.length === 0 && (
              <p className="text-xs text-[#8C7E77]">No upcoming festivals configured.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#2D1E17] flex items-center gap-2">
              <span>📜</span> Recent Activity
              {liveStats && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Live
                </span>
              )}
            </h2>
            <Link href="/audit" className="text-[11px] font-bold text-[#8C5A3C] hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2.5">
            {auditDisplay.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6F0]/50 border border-[#EFE6DD] hover:border-[#8C5A3C]/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-[#FAF6F0] flex items-center justify-center border border-[#EFE6DD] text-[#8C5A3C] text-xs font-semibold">
                    {(a.actor[0] ?? 'S').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#2D1E17] truncate">
                      <span className="font-semibold">{a.actor}</span> — {a.action}
                    </p>
                    <span className="text-[10px] text-[#8C7E77]">{a.date}</span>
                  </div>
                </div>
                <StatusBadge status={a.module} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
