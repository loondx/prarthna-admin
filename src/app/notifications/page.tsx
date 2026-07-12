'use client';

import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { Field, GhostBtn, Modal, PrimaryBtn, SearchInput, StatusBadge, inputCls } from '@/components/ui/kit';

export default function NotificationsPage() {
  const { data, actions, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    title: '',
    category: 'Spiritual',
    audience: 'All users',
    schedule: 'now',
    date: '',
  });

  const send = async () => {
    if (!form.title.trim()) {
      toast('Notification title is required', 'error');
      return;
    }
    const isNow = form.schedule === 'now';
    const ok = await actions.createNotification({
      title: form.title.trim(),
      category: form.category,
      audience: form.audience,
      status: isNow ? 'Sent' : 'Scheduled',
      sentAt: isNow
        ? undefined
        : new Date(
            `${form.date || new Date().toISOString().slice(0, 10)}T08:00:00`,
          ).toISOString(),
    });
    if (ok) {
      setOpen(false);
      setForm({ title: '', category: 'Spiritual', audience: 'All users', schedule: 'now', date: '' });
    }
  };

  const remove = async (id: string, _title: string) => {
    await actions.deleteNotification(id);
  };

  const sentCount = data.notifications.filter((n) => n.status === 'Sent').length;
  const scheduledCount = data.notifications.filter((n) => n.status === 'Scheduled').length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.notifications;
    return data.notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.audience.toLowerCase().includes(q),
    );
  }, [data.notifications, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">Notification Management</h1>
          <p className="text-[#8C7E77] text-xs mt-1">
            Create, schedule, and track push notifications sent to the mobile app.
          </p>
        </div>
        <PrimaryBtn onClick={() => setOpen(true)}>+ Create Notification</PrimaryBtn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger">
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#2D1E17] mb-4">Campaign Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF6F0]/60 border border-[#EFE6DD]">
              <span className="text-xs font-semibold text-[#8C7E77]">Total campaigns</span>
              <span className="text-2xl font-bold text-[#2D1E17]">{data.notifications.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">Sent</p>
                <p className="text-xl font-bold text-emerald-800">{sentCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-amber-700">Scheduled</p>
                <p className="text-xl font-bold text-amber-800">{scheduledCount}</p>
              </div>
            </div>
            <p className="text-[10px] text-[#8C7E77] leading-relaxed pt-1">
              Push delivery via FCM is pending Firebase credentials — campaigns are recorded and
              scheduled in the registry.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <h2 className="text-sm font-bold text-[#2D1E17]">All Notifications</h2>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search notifications…"
              className="w-full sm:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-[#8C7E77]">
              <thead>
                <tr className="border-b border-[#EFE6DD]">
                  {['Title', 'Category', 'Audience', 'When', 'Status', ''].map((h, i) => (
                    <th key={i} className="pb-3 font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((n) => (
                  <tr key={n.id} className="border-b border-[#EFE6DD] hover:bg-[#FAF6F0]/30 transition-colors">
                    <td className="py-4 font-semibold text-[#2D1E17]">{n.title}</td>
                    <td className="py-4 text-[#2D1E17]">{n.category}</td>
                    <td className="py-4 text-[#2D1E17]">{n.audience}</td>
                    <td className="py-4 text-[#2D1E17]">{n.sentAt}</td>
                    <td className="py-4"><StatusBadge status={n.status} /></td>
                    <td className="py-4">
                      <button
                        onClick={() => remove(n.id, n.title)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        aria-label={`Delete ${n.title}`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {data.notifications.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#8C7E77]">
                      No notifications yet — create your first one.
                    </td>
                  </tr>
                )}
                {data.notifications.length > 0 && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#8C7E77]">
                      No notifications match “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal title="Create Notification" open={open} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <Field label="Title *">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Morning Prayer Time 🙏"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {['Spiritual', 'Reading', 'Festival', 'Sankalp'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Audience">
              <select
                className={inputCls}
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
              >
                {['All users', 'Gita readers', 'Sankalp takers', 'Inactive 7 days'].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Delivery">
              <select
                className={inputCls}
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
              >
                <option value="now">Send now</option>
                <option value="later">Schedule</option>
              </select>
            </Field>
            {form.schedule === 'later' && (
              <Field label="Date">
                <input
                  type="date"
                  className={inputCls}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={() => setOpen(false)}>Cancel</GhostBtn>
            <PrimaryBtn onClick={send}>
              {form.schedule === 'now' ? '🔔 Send Now' : '🗓️ Schedule'}
            </PrimaryBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
