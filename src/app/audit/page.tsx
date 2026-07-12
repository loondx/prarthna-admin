'use client';

import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { StatusBadge, inputCls } from '@/components/ui/kit';

function SkeletonRow() {
  return (
    <tr className="border-b border-[#EFE6DD]">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="py-4 pr-4">
          <div className="h-3 bg-[#EFE6DD] rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function AuditLogsPage() {
  const { data, apiLoading } = useStore();
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('All');

  const modules = useMemo(
    () => ['All', ...Array.from(new Set(data.audit.map((a) => a.module)))],
    [data.audit],
  );

  const logs = data.audit.filter((l) => {
    const matchesModule = module === 'All' || l.module === module;
    const q = query.toLowerCase();
    const matchesQuery =
      q === '' || l.action.toLowerCase().includes(q) || l.actor.toLowerCase().includes(q);
    return matchesModule && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">System Audit Logs</h1>
          <p className="text-[#8C7E77] text-xs mt-1">
            Every change made in this panel is recorded here in real time.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] bg-[#FAF6F0] border border-[#EFE6DD] px-3 py-1.5 rounded-full">
          {logs.length} entr{logs.length === 1 ? 'y' : 'ies'}
        </span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions or users…"
          className={`${inputCls} max-w-xs`}
        />
        <select value={module} onChange={(e) => setModule(e.target.value)} className={`${inputCls} max-w-[160px]`}>
          {modules.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm animate-rise-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-[#8C7E77]">
            <thead>
              <tr className="border-b border-[#EFE6DD]">
                {['Timestamp', 'User', 'Action', 'Module', 'IP Address'].map((h) => (
                  <th key={h} className="pb-3 pr-4 font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apiLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-[#EFE6DD] hover:bg-[#FAF6F0]/30 transition-colors">
                    <td className="py-4 pr-4 font-semibold text-[#2D1E17] whitespace-nowrap">{log.date}</td>
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-[#2D1E17]">{log.actor}</p>
                      <p className="text-[10px] text-[#8C7E77]">{log.email}</p>
                    </td>
                    <td className="py-4 pr-4 text-[#2D1E17] max-w-[260px] truncate" title={log.action}>{log.action}</td>
                    <td className="py-4 pr-4"><StatusBadge status={log.module} /></td>
                    <td className="py-4 text-[#2D1E17] font-mono text-[10px]">{log.ip}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-[#8C7E77]">
                    <div className="text-3xl mb-2">📜</div>
                    <p className="text-sm font-medium">No log entries match your filters.</p>
                    <p className="text-xs mt-1 opacity-60">Try clearing your search or selecting a different module.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
