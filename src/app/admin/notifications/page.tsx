'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { BarChart, Field, GhostBtn, Modal, PrimaryBtn, StatusBadge, inputCls } from '@/components/ui/kit';

const CLICKS = [
  { label: 'Mon', value: 1850 },
  { label: 'Tue', value: 2200 },
  { label: 'Wed', value: 1960 },
  { label: 'Thu', value: 2510 },
  { label: 'Fri', value: 2380 },
  { label: 'Sat', value: 2890 },
  { label: 'Sun', value: 3120 },
];

export default function NotificationsPage() {
  const { data, actions, toast } = useStore();
  const [open, setOpen] = useState(false);
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
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#2D1E17] mb-4">Reminder Clicks (this week)</h2>
          <BarChart points={CLICKS} />
          <div className="mt-4 pt-4 border-t border-[#EFE6DD] grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[#8C7E77] uppercase font-bold text-[10px] tracking-wider">Delivered</p>
              <p className="text-lg font-bold text-[#2D1E17]">16.9k</p>
            </div>
            <div>
              <p className="text-[#8C7E77] uppercase font-bold text-[10px] tracking-wider">Open rate</p>
              <p className="text-lg font-bold text-[#2D1E17]">38.4%</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#2D1E17] mb-5">All Notifications</h2>
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
                {data.notifications.map((n) => (
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
