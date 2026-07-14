'use client';

import React, { useMemo, useState } from 'react';
import { useStore, FestivalItem } from '@/lib/store';
import { Field, GhostBtn, Modal, PrimaryBtn, StatusBadge, inputCls } from '@/components/ui/kit';

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 text-[#8C5A3C] inline"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const EMPTY = {
  name: '',
  date: '',
  category: 'Hindu',
  icon: '🪔',
  status: 'Active' as FestivalItem['status'],
  description: '',
  observances: '',
};

export default function FestivalsPage() {
  const { data, actions, toast, apiLoading } = useStore();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<FestivalItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [deleting, setDeleting] = useState<FestivalItem | null>(null);

  const list = useMemo(
    () =>
      [...data.festivals]
        .sort((a, b) => a.date.localeCompare(b.date))
        .filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [data.festivals, query],
  );

  const openCreate = () => {
    setForm(EMPTY);
    setCreating(true);
  };

  const openEdit = (f: FestivalItem) => {
    setForm({
      name: f.name,
      date: f.date,
      category: f.category,
      icon: f.icon,
      status: f.status,
      description: f.description ?? '',
      observances: (f.observances ?? []).join('\n'),
    });
    setEditing(f);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    if (!form.name.trim() || !form.date) {
      toast('Name and date are required', 'error');
      return;
    }
    const payload = {
      name: form.name.trim(),
      date: form.date,
      category: form.category,
      icon: form.icon,
      status: form.status,
      description: form.description.trim() || undefined,
      observances: form.observances.split('\n').map(x => x.trim()).filter(Boolean),
    };
    const ok = creating
      ? await actions.createFestival(payload as any)
      : editing
        ? await actions.updateFestival(editing.id, payload as any)
        : false;
    if (ok) close();
  };

  const confirmRemove = async (f: FestivalItem) => {
    await actions.deleteFestival(f.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">Festival Management</h1>
          <p className="text-[#8C7E77] text-xs mt-1">
            Configure festivals, dates, and reminder notifications shown in the user app.
          </p>
        </div>
        <div className="flex gap-2">
          <GhostBtn onClick={async () => {
            await actions.syncFestivals();
          }}>
            🔄 Sync Hindu Calendar
          </GhostBtn>
          <PrimaryBtn onClick={openCreate}>+ Add Festival</PrimaryBtn>
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search festivals..."
        className={`${inputCls} max-w-xs`}
      />

      {apiLoading && data.festivals.length === 0 ? (
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm space-y-4 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-4 bg-[#EFE6DD]/60 rounded w-1/4" />
              <div className="h-4 bg-[#EFE6DD]/60 rounded w-1/6" />
              <div className="h-4 bg-[#EFE6DD]/60 rounded w-1/6" />
              <div className="h-4 bg-[#EFE6DD]/60 rounded w-12" />
              <div className="ml-auto flex gap-2">
                <div className="h-8 bg-[#EFE6DD]/40 rounded w-12" />
                <div className="h-8 bg-[#EFE6DD]/40 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm animate-rise-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-[#8C7E77]">
              <thead>
                <tr className="border-b border-[#EFE6DD]">
                  {['Festival', 'Date', 'Category', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="pb-3 font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((f) => (
                  <tr key={f.id} className="border-b border-[#EFE6DD] hover:bg-[#FAF6F0]/30 transition-colors">
                    <td className="py-4 font-semibold text-[#2D1E17]">
                      <span className="mr-2">{f.icon}</span>
                      {f.name}
                    </td>
                    <td className="py-4 text-[#2D1E17]">{f.date}</td>
                    <td className="py-4 text-[#2D1E17]">{f.category}</td>
                    <td className="py-4"><StatusBadge status={f.status} /></td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <GhostBtn onClick={() => openEdit(f)}>Edit</GhostBtn>
                        <button
                          onClick={() => setDeleting(f)}
                          className="text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 font-semibold text-xs px-3 py-2 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#8C7E77]">
                      No festivals match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal title={creating ? 'Add Festival' : 'Edit Festival'} open={creating || !!editing} onClose={close} disableOutsideClick={true}>
        <div className="space-y-4">
          <Field label="Festival name *">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Hanuman Jayanti"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date *">
              <input
                type="date"
                className={inputCls}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Icon">
              <select
                className={inputCls}
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              >
                {['🪔', '🦚', '🐘', '🌺', '🎗️', '🐒', '🏹'].map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {['Hindu', 'Buddhist', 'Jain', 'Sikh'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as FestivalItem['status'] })}
              >
                <option>Active</option>
                <option>Draft</option>
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className={`${inputCls} min-h-16`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Celebrates the birth of Lord Hanuman..."
            />
          </Field>
          <Field label="Observances (one per line)">
            <textarea
              className={`${inputCls} min-h-20`}
              value={form.observances}
              onChange={(e) => setForm({ ...form, observances: e.target.value })}
              placeholder="e.g. Fasting&#10;Chanting Hanuman Chalisa&#10;Visiting temples"
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={close}>Cancel</GhostBtn>
            <PrimaryBtn onClick={save}>{creating ? 'Create Festival' : 'Save Changes'}</PrimaryBtn>
          </div>
        </div>
      </Modal>

      <Modal title="Delete Festival" open={!!deleting} onClose={() => setDeleting(null)}>
        <div className="space-y-4">
          <p className="text-[#8C7E77] text-xs">
            Are you sure you want to delete <strong className="text-[#2D1E17]">"{deleting?.name}"</strong>? This will also remove any user reminders associated with it. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={() => setDeleting(null)}>Cancel</GhostBtn>
            <button
              onClick={() => {
                if (deleting) {
                  confirmRemove(deleting);
                  setDeleting(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
