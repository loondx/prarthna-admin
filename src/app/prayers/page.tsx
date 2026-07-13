'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore, Collection } from '@/lib/store';
import { Field, GhostBtn, Modal, PrimaryBtn, SearchInput, inputCls } from '@/components/ui/kit';

const EMPTY = { title: '', type: 'PRAYER', description: '', category: '' };

const PRAYER_CATEGORIES = [
  'Morning Prayer',
  'Evening Prayer',
  'Before Food',
  'Before Study',
  'Before Sleep',
  'Daily Prayer',
  'Festival Prayer',
  'Health',
  'Wealth',
  'Success',
  'Peace',
  'Meditation',
  'Others'
];

export default function PrayersPage() {
  const { data, actions, toast, apiLoading } = useStore();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [deleting, setDeleting] = useState<Collection | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // Filter collections to only show PRAYER type
  const prayersList = useMemo(() => {
    return data.collections.filter((c) => c.units === 'PRAYER');
  }, [data.collections]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return prayersList;
    return prayersList.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.lang.toLowerCase().includes(q)
    );
  }, [prayersList, query]);

  const openCreate = () => {
    setForm(EMPTY);
    setCreating(true);
  };

  const openEdit = (c: Collection) => {
    setForm({ title: c.title, type: 'PRAYER', description: c.lang, category: c.category || '' });
    setEditing(c);
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast('Prayer title is required', 'error');
      return;
    }
    setSaving(true);
    const ok = creating
      ? await actions.createCollection({
          title: form.title.trim(),
          type: 'PRAYER',
          description: form.description || undefined,
          category: form.category || undefined,
        })
      : editing
        ? await actions.updateCollection(editing.id, {
            title: form.title.trim(),
            type: 'PRAYER',
            description: form.description,
            category: form.category || undefined,
          })
        : false;
    setSaving(false);
    if (ok) closeForm();
  };

  const toggleStatus = async (c: Collection) => {
    const next = c.status === 'Published' ? 'Draft' : 'Published';
    const ok = await actions.setCollectionStatus(c.id, next);
    if (ok) toast(`"${c.title}" is now ${next.toLowerCase()}`);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const ok = await actions.deleteCollection(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">Manage Prayers</h1>
          <p className="text-[#8C7E77] text-xs mt-1">
            Configure, manage, and publish prayers, recitations, and audio streams.
          </p>
        </div>
        <PrimaryBtn onClick={openCreate}>+ New Prayer</PrimaryBtn>
      </div>

      <div className="max-w-sm">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search prayers by title or description…"
        />
      </div>

      {/* Loading skeleton */}
      {apiLoading && prayersList.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-white border border-[#EFE6DD] animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty states */}
      {!apiLoading && prayersList.length === 0 && (
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-12 text-center">
          <span className="text-3xl">🙏</span>
          <p className="text-sm text-[#8C7E77] mt-3">
            No prayers yet. Create your first prayer collection.
          </p>
          <PrimaryBtn className="mt-4" onClick={openCreate}>+ New Prayer</PrimaryBtn>
        </div>
      )}
      {!apiLoading && prayersList.length > 0 && filtered.length === 0 && (
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-10 text-center text-sm text-[#8C7E77]">
          No prayers match “{query}”.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-[#EFE6DD] rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-[#8C5A3C]/40 hover:shadow-md hover:-translate-y-0.5 flex flex-col"
          >
            <button
              onClick={() => toggleStatus(c)}
              title="Toggle publish status"
              className={`absolute top-4 right-4 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border transition-colors ${
                c.status === 'Published'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {c.status}
            </button>
            <span className="text-3xl">🙏</span>
            <h2 className="text-lg font-bold text-[#2D1E17] mt-4">{c.title}</h2>
            <p className="text-[#8C7E77] text-xs mt-1.5 flex-1">{c.lang || 'No description'}</p>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#EFE6DD]">
              <div>
                <span className="text-[#8C7E77] text-[10px] uppercase font-bold tracking-wider">Sections / Verses</span>
                <p className="text-sm font-semibold text-[#2D1E17]">{c.nodes}</p>
              </div>
              <div>
                <span className="text-[#8C7E77] text-[10px] uppercase font-bold tracking-wider">Type</span>
                <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 inline-block text-[10px] uppercase font-bold">{c.units}</p>
              </div>
            </div>

            <Link href={`/prayers/${c.id}`} className="block mt-6">
              <GhostBtn className="w-full">Manage Verses &amp; Audio</GhostBtn>
            </Link>
            <div className="flex gap-2 mt-2">
              <GhostBtn className="flex-1" onClick={() => openEdit(c)}>Edit</GhostBtn>
              <button
                onClick={() => setDeleting(c)}
                className="text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 font-semibold text-xs px-3 py-2 rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit modal */}
      <Modal
        title={creating ? 'New Prayer' : 'Edit Prayer'}
        open={creating || !!editing}
        onClose={closeForm}
        disableOutsideClick={true}
      >
        <div className="space-y-4">
          <Field label="Prayer title *">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Hanuman Chalisa"
            />
          </Field>
          <Field label="Description">
            <input
              className={inputCls}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. A devotional hymn dedicated to Lord Hanuman."
            />
          </Field>
          <Field label="Category">
            <select
              className={inputCls}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {PRAYER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={closeForm}>Cancel</GhostBtn>
            <PrimaryBtn onClick={save} disabled={saving}>
              {saving ? 'Saving…' : creating ? 'Create as Draft' : 'Save Changes'}
            </PrimaryBtn>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal title="Delete Prayer" open={!!deleting} onClose={() => setDeleting(null)}>
        <div className="space-y-4">
          <p className="text-[#8C7E77] text-xs">
            Delete <strong className="text-[#2D1E17]">&ldquo;{deleting?.title}&rdquo;</strong> and
            all of its verses and uploaded recitations? Readers will no longer see this prayer in the app.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={() => setDeleting(null)}>Cancel</GhostBtn>
            <button
              onClick={confirmDelete}
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
