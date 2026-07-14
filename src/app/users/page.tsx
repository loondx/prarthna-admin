'use client';

import React, { useMemo, useState } from 'react';
import { useStore, AppUser } from '@/lib/store';
import { SearchInput } from '@/components/ui/kit';

export default function AppUsersPage() {
  const { data, apiLoading } = useStore();
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    return [...data.appUsers]
      .filter((u) => {
        const q = query.toLowerCase();
        return (
          (u.name ?? '').toLowerCase().includes(q) ||
          (u.phone ?? '').toLowerCase().includes(q) ||
          (u.email ?? '').toLowerCase().includes(q) ||
          (u.city ?? '').toLowerCase().includes(q)
        );
      });
  }, [data.appUsers, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">App Users</h1>
          <p className="text-[#8C7E77] text-xs mt-1">
            View active mobile application users, their streaks, and spiritual points.
          </p>
        </div>
        <div className="bg-[#8C5A3C]/10 text-[#8C5A3C] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          Total: {data.appUsers.length} Users
        </div>
      </div>

      <div className="max-w-xs">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name, phone, city..."
        />
      </div>

      {apiLoading && data.appUsers.length === 0 ? (
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm space-y-4 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-4 bg-[#EFE6DD]/60 rounded w-1/4" />
              <div className="h-4 bg-[#EFE6DD]/60 rounded w-1/6" />
              <div className="h-4 bg-[#EFE6DD]/60 rounded w-1/6" />
              <div className="h-4 bg-[#EFE6DD]/60 rounded w-12" />
              <div className="ml-auto h-4 bg-[#EFE6DD]/40 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm animate-rise-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-[#8C7E77]">
              <thead>
                <tr className="border-b border-[#EFE6DD]">
                  {['Name', 'Phone / Email', 'City', 'Language', 'Streak', 'Points', 'Registered'].map((h) => (
                    <th key={h} className="pb-3 font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id} className="border-b border-[#EFE6DD] hover:bg-[#FAF6F0]/30 transition-colors">
                    <td className="py-4 font-semibold text-[#2D1E17]">
                      {u.name || 'Guest User'}
                    </td>
                    <td className="py-4 space-y-0.5">
                      <p className="text-[#2D1E17] font-medium">{u.phone || '—'}</p>
                      {u.email && <p className="text-[10px] text-[#8C7E77]">{u.email}</p>}
                    </td>
                    <td className="py-4 text-[#2D1E17]">{u.city || '—'}</td>
                    <td className="py-4">
                      <span className="bg-[#FAF6F0] border border-[#EFE6DD] text-[#8C5A3C] px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {u.language || 'en'}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-amber-600">
                      🔥 {u.streak} Days
                    </td>
                    <td className="py-4 font-semibold text-emerald-600">
                      ⭐ {u.points} pts
                    </td>
                    <td className="py-4 text-[#8C7E77]">{u.createdAt}</td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#8C7E77]">
                      No app users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
