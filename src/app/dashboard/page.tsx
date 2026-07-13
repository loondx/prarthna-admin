'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BarChart, DonutChart, StatusBadge } from '@/components/ui/kit';

interface RecentUser {
  id: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  streak: number;
  points: number;
  badges: string[];
  lastActiveDate: string | null;
  createdAt: string;
}

interface LiveStats {
  totalUsers: number;
  newUsersThisWeek: number;
  totalCollections: number;
  totalFestivals: number;
  totalSankalps: number;
  totalPosts: number;
  totalActivities: number;
  activityCounts: { READ: number; LISTEN: number; SANKALP_COMPLETE: number };
  activeToday: number;
  activeThisWeek: number;
  avgStreak: number;
  maxStreak: number;
  recentUsers: RecentUser[];
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

function ActivityTile({
  label, value, icon, suffix, loading,
}: {
  label: string; value?: number; icon: string; suffix?: string; loading?: boolean;
}) {
  return (
    <div className="bg-[#FAF6F0]/60 border border-[#EFE6DD] rounded-xl p-3 text-center">
      <div className="text-lg">{icon}</div>
      <p className="text-xl font-bold text-[#2D1E17] mt-1">
        {loading ? '—' : `${(value ?? 0).toLocaleString()}${suffix ?? ''}`}
      </p>
      <p className="text-[9px] uppercase font-bold tracking-wider text-[#8C7E77] mt-0.5">{label}</p>
    </div>
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
      subtext: statsLoading
        ? 'Loading from DB…'
        : `+${liveStats?.newUsersThisWeek ?? 0} this week · ${liveStats?.activeToday ?? 0} active today`,
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

  // Real content composition derived from live store data
  const audioProcessing = data.audio.filter(
    (a) => a.status === 'processing' || a.status === 'uploading',
  ).length;
  const audioReview = data.audio.filter((a) => a.status === 'ready_for_review').length;

  const audioPipeline = [
    { label: 'Processing', value: audioProcessing },
    { label: 'In Review', value: audioReview },
    { label: 'Published', value: audioPublished },
  ];

  const contentMix = [
    { label: 'Collections', value: data.collections.length, color: '#8C5A3C' },
    { label: 'Audio', value: data.audio.length, color: '#D99B26' },
    { label: 'Templates', value: data.sankalps.length, color: '#4E785A' },
    { label: 'Festivals', value: data.festivals.length, color: '#E05B35' },
  ];
  const hasContent = contentMix.some((s) => s.value > 0);

  const upcoming = [...data.festivals]
    .filter((f) => new Date(f.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const auditDisplay = liveStats?.recentAuditLogs?.length
    ? liveStats.recentAuditLogs.map((l: any) => {
        const email = l.actorEmail ?? l.user?.email ?? 'system@prarthna.app';
        return {
          id: l.id,
          actor: email.split('@')[0],
          action: l.action,
          module: l.entityName,
          date: new Date(l.createdAt).toLocaleString(),
        };
      })
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

      {/* Charts row — derived from live data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger">
        <div className="lg:col-span-2 bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2D1E17] flex items-center gap-2">
              <span>🎙️</span> Audio Pipeline
            </h2>
            <Link href="/audio" className="text-[11px] font-bold text-[#8C5A3C] hover:underline">
              Open studio →
            </Link>
          </div>
          {data.audio.length === 0 ? (
            <div className="h-[150px] flex items-center justify-center text-xs text-[#8C7E77]">
              No audio tracks uploaded yet.
            </div>
          ) : (
            <BarChart points={audioPipeline} />
          )}
        </div>

        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#2D1E17] mb-4 flex items-center gap-2">
            <span>🧭</span> Content Mix
          </h2>
          {hasContent ? (
            <DonutChart slices={contentMix} />
          ) : (
            <div className="h-[140px] flex items-center justify-center text-xs text-[#8C7E77]">
              No content yet.
            </div>
          )}
          <p className="text-[11px] text-[#8C7E77] mt-4 leading-relaxed">
            Live counts across collections, audio tracks, sankalp templates, and festivals.
          </p>
        </div>
      </div>

      {/* User activity report */}
      <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-[#2D1E17] flex items-center gap-2">
            <span>📈</span> User Activity Report
          </h2>
          {liveStats && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <ActivityTile label="Total Activities" value={liveStats?.totalActivities} icon="⚡" loading={statsLoading} />
          <ActivityTile label="Verses Read" value={liveStats?.activityCounts?.READ} icon="📖" loading={statsLoading} />
          <ActivityTile label="Audio Played" value={liveStats?.activityCounts?.LISTEN} icon="🎧" loading={statsLoading} />
          <ActivityTile label="Sankalps Done" value={liveStats?.activityCounts?.SANKALP_COMPLETE} icon="🔥" loading={statsLoading} />
          <ActivityTile label="Active Today" value={liveStats?.activeToday} icon="🟢" loading={statsLoading} />
          <ActivityTile label="Active / 7d" value={liveStats?.activeThisWeek} icon="🗓️" loading={statsLoading} />
          <ActivityTile label="Best Streak" value={liveStats?.maxStreak} icon="🏆" suffix="d" loading={statsLoading} />
        </div>
        <p className="text-[11px] text-[#8C7E77] mt-4">
          Average streak across all users:{' '}
          <strong className="text-[#2D1E17]">{liveStats?.avgStreak ?? 0} days</strong>. Activity is
          logged from the mobile app (reading, listening, and completing sankalps).
        </p>
      </div>

      {/* Recent registered users */}
      <div className="bg-white border border-[#EFE6DD] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EFE6DD] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2D1E17] flex items-center gap-2">
            <span>👥</span> Recent Registered Users
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] bg-[#FAF6F0] border border-[#EFE6DD] px-3 py-1 rounded-full">
            {liveStats?.totalUsers ?? 0} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#8C7E77]">
            <thead className="border-b border-[#EFE6DD]">
              <tr>
                {['User', 'City', 'Streak', 'Points', 'Badges', 'Last Active', 'Joined'].map((h) => (
                  <th key={h} className="px-6 py-3 font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statsLoading &&
                [0, 1, 2].map((i) => (
                  <tr key={i} className="border-b border-[#EFE6DD]">
                    {[0, 1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-6 py-4"><div className="h-3 bg-[#EFE6DD] rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))}
              {!statsLoading && (liveStats?.recentUsers ?? []).map((u) => (
                <tr key={u.id} className="border-b border-[#EFE6DD] hover:bg-[#FAF6F0]/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8C5A3C] to-[#D99B26] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(u.name?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#2D1E17]">{u.name ?? 'Unnamed'}</p>
                        <p className="text-[10px]">{u.phone ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#2D1E17]">{u.city || '—'}</td>
                  <td className="px-6 py-4 font-semibold text-[#8C5A3C]">🔥 {u.streak}</td>
                  <td className="px-6 py-4 text-[#2D1E17]">{u.points}</td>
                  <td className="px-6 py-4 text-[#2D1E17]">{u.badges.length}</td>
                  <td className="px-6 py-4 text-[#2D1E17] whitespace-nowrap">{u.lastActiveDate ?? 'Never'}</td>
                  <td className="px-6 py-4 text-[#2D1E17] whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {!statsLoading && (liveStats?.recentUsers?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#8C7E77]">
                    <div className="text-3xl mb-2">👤</div>
                    <p className="text-sm font-medium">No registered users yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
