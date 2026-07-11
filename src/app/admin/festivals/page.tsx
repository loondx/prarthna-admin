'use client';

import React, { useMemo, useState } from 'react';
import { useStore, FestivalItem } from '@/lib/store';
import { Field, GhostBtn, Modal, PrimaryBtn, StatusBadge, inputCls } from '@/components/ui/kit';

const EMPTY: Omit<FestivalItem, 'id'> = {
  name: '',
  date: '',
  category: 'Hindu',
  icon: '🪔',
  status: 'Active',
};

export default function FestivalsPage() {
  const { data, update, toast } = useStore();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<FestivalItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);

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
    setForm({ name: f.name, date: f.date, category: f.category, icon: f.icon, status: f.status });
    setEditing(f);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = () => {
    if (!form.name.trim() || !form.date) {
      toast('Name and date are required', 'error');
      return;
    }
    if (creating) {
      update(
        (d) => ({
          ...d,
          festivals: [...d.festivals, { ...form, id: `f${Date.now()}` }],
        }),
        { action: `Created festival "${form.name}"`, module: 'Festivals' },
      );
      toast(`Festival "${form.name}" created`);
    } else if (editing) {
      update(
        (d) => ({
          ...d,
          festivals: d.festivals.map((f) => (f.id === editing.id ? { ...f, ...form } : f)),
        }),
        { action: `Updated festival "${form.name}"`, module: 'Festivals' },
      );
      toast(`Festival "${form.name}" updated`);
    }
    close();
  };

  const remove = (f: FestivalItem) => {
    if (!confirm(`Delete "${f.name}"? This also removes its reminders.`)) return;
    update(
      (d) => ({ ...d, festivals: d.festivals.filter((x) => x.id !== f.id) }),
      { action: `Deleted festival "${f.name}"`, module: 'Festivals' },
    );
    toast(`Festival "${f.name}" deleted`, 'info');
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
        <PrimaryBtn onClick={openCreate}>+ Add Festival</PrimaryBtn>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search festivals..."
        className={`${inputCls} max-w-xs`}
      />

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
                        onClick={() => remove(f)}
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

      <Modal title={creating ? 'Add Festival' : 'Edit Festival'} open={creating || !!editing} onClose={close}>
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
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={close}>Cancel</GhostBtn>
            <PrimaryBtn onClick={save}>{creating ? 'Create Festival' : 'Save Changes'}</PrimaryBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
