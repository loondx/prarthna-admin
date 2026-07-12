'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore, Collection } from '@/lib/store';
import { Field, GhostBtn, Modal, PrimaryBtn, inputCls } from '@/components/ui/kit';

const EMPTY = { title: '', type: 'SCRIPTURE', description: '' };

export default function ContentLibraryPage() {
  const { data, actions, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const importCollection = async () => {
    if (!form.title.trim()) {
      toast('Collection title is required', 'error');
      return;
    }
    const ok = await actions.createCollection({
      title: form.title.trim(),
      type: form.type,
      description: form.description || undefined,
    });
    if (ok) {
      setOpen(false);
      setForm(EMPTY);
    }
  };

  const toggleStatus = async (c: Collection) => {
    const next = c.status === 'Published' ? 'Draft' : 'Published';
    const ok = await actions.setCollectionStatus(c.id, next);
    if (ok) toast(`"${c.title}" is now ${next.toLowerCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">Content Library</h1>
          <p className="text-[#8C7E77] text-xs mt-1">
            Configure and manage scriptures, chapters, and shloka translations.
          </p>
        </div>
        <PrimaryBtn onClick={() => setOpen(true)}>+ Import Collection</PrimaryBtn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
        {data.collections.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-[#EFE6DD] rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-[#8C5A3C]/40 hover:shadow-md hover:-translate-y-0.5"
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
            <span className="text-3xl">📚</span>
            <h2 className="text-lg font-bold text-[#2D1E17] mt-4">{c.title}</h2>
            <p className="text-[#8C7E77] text-xs mt-1">{c.lang}</p>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#EFE6DD]">
              <div>
                <span className="text-[#8C7E77] text-[10px] uppercase font-bold tracking-wider">Nodes</span>
                <p className="text-sm font-semibold text-[#2D1E17]">{c.nodes}</p>
              </div>
              <div>
                <span className="text-[#8C7E77] text-[10px] uppercase font-bold tracking-wider">Units</span>
                <p className="text-sm font-semibold text-[#2D1E17]">{c.units}</p>
              </div>
            </div>

            <Link href={`/content/${c.id}`} className="block mt-6">
              <GhostBtn className="w-full">Manage Chapters & Verses</GhostBtn>
            </Link>
          </div>
        ))}
      </div>

      <Modal title="Import Collection" open={open} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <Field label="Collection title *">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Shiv Puran"
            />
          </Field>
          <Field label="Type">
            <select
              className={inputCls}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {['SCRIPTURE', 'PRAYER'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <input
              className={inputCls}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. The 700-verse Hindu scripture in 18 chapters."
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={() => setOpen(false)}>Cancel</GhostBtn>
            <PrimaryBtn onClick={importCollection}>Import as Draft</PrimaryBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
