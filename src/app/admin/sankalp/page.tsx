'use client';

import React, { useState } from 'react';
import { useStore, SankalpTemplate } from '@/lib/store';
import { Field, GhostBtn, Modal, PrimaryBtn, inputCls } from '@/components/ui/kit';

const EMPTY: Omit<SankalpTemplate, 'id'> = {
  title: '',
  target: '',
  duration: '10 mins/day',
  difficulty: 'Medium',
};

const DIFFICULTY_COLORS: Record<SankalpTemplate['difficulty'], string> = {
  Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
  Intense: 'text-red-700 bg-red-50 border-red-200',
};

export default function SankalpTemplatesPage() {
  const { data, actions, toast } = useStore();
  const [editing, setEditing] = useState<SankalpTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<SankalpTemplate | null>(null);
  const [form, setForm] = useState(EMPTY);

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast('Template title is required', 'error');
      return;
    }
    const ok = creating
      ? await actions.createTemplate(form)
      : editing
        ? await actions.updateTemplate(editing.id, form)
        : false;
    if (ok) close();
  };

  const confirmRemove = async (s: SankalpTemplate) => {
    await actions.deleteTemplate(s.id);
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">Sankalp Templates</h1>
          <p className="text-[#8C7E77] text-xs mt-1">
            Preset spiritual commitments users can pick during onboarding.
          </p>
        </div>
        <PrimaryBtn
          onClick={() => {
            setForm(EMPTY);
            setCreating(true);
          }}
        >
          + New Template
        </PrimaryBtn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
        {data.sankalps.map((t) => (
          <div
            key={t.id}
            className="bg-white border border-[#EFE6DD] rounded-2xl p-6 transition-all duration-300 hover:border-[#8C5A3C]/40 hover:shadow-md hover:-translate-y-0.5 flex flex-col"
          >
            <span className="text-2xl">🔥</span>
            <h2 className="text-lg font-bold text-[#2D1E17] mt-4">{t.title}</h2>
            <p className="text-[#8C7E77] text-xs mt-1.5 flex-1">{t.target}</p>

            <div className="mt-6 space-y-2 border-t border-[#EFE6DD] pt-4 text-xs text-[#8C7E77]">
              <div className="flex justify-between">
                <span>Daily commitment:</span>
                <span className="font-semibold text-[#2D1E17]">{t.duration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Level:</span>
                <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[t.difficulty]}`}>
                  {t.difficulty}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <GhostBtn
                className="flex-1"
                onClick={() => {
                  setForm({ title: t.title, target: t.target, duration: t.duration, difficulty: t.difficulty });
                  setEditing(t);
                }}
              >
                Edit
              </GhostBtn>
              <button
                onClick={() => setDeleting(t)}
                className="text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 font-semibold text-xs px-3 py-2 rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {data.sankalps.length === 0 && (
          <div className="col-span-3 py-16 text-center text-[#8C7E77] text-sm">
            No sankalp templates yet. Create your first one above.
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal title={creating ? 'New Template' : 'Edit Template'} open={creating || !!editing} onClose={close}>
        <div className="space-y-4">
          <Field label="Title *">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Meditate 21 Days"
            />
          </Field>
          <Field label="Goal description">
            <input
              className={inputCls}
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              placeholder="e.g. Meditate daily for 21 days"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Daily commitment">
              <select
                className={inputCls}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              >
                {['5 mins/day', '10 mins/day', '20 mins/day', '40 mins/day'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Difficulty">
              <select
                className={inputCls}
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value as SankalpTemplate['difficulty'] })
                }
              >
                {['Easy', 'Medium', 'Intense'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={close}>Cancel</GhostBtn>
            <PrimaryBtn onClick={save}>{creating ? 'Create' : 'Save Changes'}</PrimaryBtn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal title="Delete Template" open={!!deleting} onClose={() => setDeleting(null)}>
        <div className="space-y-4">
          <p className="text-[#8C7E77] text-xs">
            Are you sure you want to delete{' '}
            <strong className="text-[#2D1E17]">"{deleting?.title}"</strong>?
            Users who have active sankalps based on this template will not be affected, but it will no longer appear during onboarding.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={() => setDeleting(null)}>Cancel</GhostBtn>
            <button
              onClick={() => deleting && confirmRemove(deleting)}
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
