'use client';

import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { StatusBadge, inputCls } from '@/components/ui/kit';

export default function AuditLogsPage() {
  const { data } = useStore();
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
      <div>
        <h1 className="text-2xl font-bold text-[#2D1E17]">System Audit Logs</h1>
        <p className="text-[#8C7E77] text-xs mt-1">
          Every change made in this panel is recorded here in real time.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions or users..."
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
                  <th key={h} className="pb-3 font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[#EFE6DD] hover:bg-[#FAF6F0]/30 transition-colors">
                  <td className="py-4 font-semibold text-[#2D1E17] whitespace-nowrap">{log.date}</td>
                  <td className="py-4">
                    <p className="font-semibold text-[#2D1E17]">{log.actor}</p>
                    <p className="text-[10px] text-[#8C7E77]">{log.email}</p>
                  </td>
                  <td className="py-4 text-[#2D1E17]">{log.action}</td>
                  <td className="py-4"><StatusBadge status={log.module} /></td>
                  <td className="py-4 text-[#2D1E17]">{log.ip}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#8C7E77]">
                    No log entries match your filters.
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
