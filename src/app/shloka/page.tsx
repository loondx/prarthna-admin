'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useStore, ShlokaSchedule } from '@/lib/store';
import { Field, GhostBtn, Modal, PrimaryBtn, inputCls } from '@/components/ui/kit';

const todayStr = () => new Date().toISOString().slice(0, 10);

const EMPTY: ShlokaSchedule = {
  date: todayStr(),
  reference: '',
  sanskrit: '',
  translation: '',
};

export default function DailyShlokaPage() {
  const { data, actions, toast } = useStore();
  const [form, setForm] = useState<ShlokaSchedule>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<ShlokaSchedule[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [deleting, setDeleting] = useState<ShlokaSchedule | null>(null);

  const loadSchedule = useCallback(async () => {
    setListLoading(true);
    try {
      setSchedule(await actions.getShlokas());
    } catch {
      toast('Could not load the shloka schedule', 'error');
    } finally {
      setListLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const saveShloka = async () => {
    if (!form.date) {
      toast('A scheduled date is required', 'error');
      return;
    }
    if (!form.reference.trim() || !form.sanskrit.trim() || !form.translation.trim()) {
      toast('Reference, Sanskrit, and translation are required', 'error');
      return;
    }
    setSaving(true);
    const ok = await actions.saveShloka({
      date: form.date,
      reference: form.reference.trim(),
      sanskrit: form.sanskrit,
      translation: form.translation,
    });
    setSaving(false);
    if (ok) {
      setForm({ ...EMPTY, date: todayStr() });
      loadSchedule();
    }
  };

  const editRow = (s: ShlokaSchedule) => {
    setForm({ ...s });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const ok = await actions.deleteShloka(deleting.date);
    setDeleting(null);
    if (ok) loadSchedule();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2D1E17]">Daily Shloka</h1>
        <p className="text-[#8C7E77] text-xs mt-1">
          The featured Shloka of the Day shown on the user app home screen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger">
        {/* Current active shloka */}
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#2D1E17]">Current Active Shloka</h2>
            {data.shloka.date ? (
              <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Live · {data.shloka.date}
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                None scheduled
              </span>
            )}
          </div>
          {data.shloka.reference ? (
            <div className="p-6 rounded-xl bg-[#FAF6F0] border border-[#EFE6DD] space-y-4 text-center">
              <span className="text-2xl text-[#8C5A3C] font-bold">🕉️</span>
              <p className="text-lg font-bold text-[#2D1E17] italic whitespace-pre-line">
                {data.shloka.sanskrit}
              </p>
              <p className="text-xs text-[#8C7E77] font-medium">{data.shloka.reference}</p>
              <div className="text-left pt-4 border-t border-[#EFE6DD] text-xs text-[#8C7E77]">
                <p>
                  <strong className="text-[#2D1E17]">Translation:</strong> {data.shloka.translation}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#FAF6F0] border border-[#EFE6DD] text-center text-xs text-[#8C7E77]">
              No shloka is scheduled yet. Add one to feature it on the app home screen.
            </div>
          )}
        </div>

        {/* Compose / edit shloka */}
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#2D1E17] mb-4">Schedule a Shloka</h2>
          <div className="space-y-4">
            <Field label="Scheduled date *">
              <input
                type="date"
                className={inputCls}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Reference *">
              <input
                className={inputCls}
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="e.g. Bhagavad Gita — Chapter 2, Verse 47"
              />
            </Field>
            <Field label="Sanskrit *">
              <textarea
                className={`${inputCls} min-h-24 font-serif`}
                value={form.sanskrit}
                onChange={(e) => setForm({ ...form, sanskrit: e.target.value })}
                placeholder="देवनागरी…"
              />
            </Field>
            <Field label="Translation *">
              <textarea
                className={`${inputCls} min-h-20`}
                value={form.translation}
                onChange={(e) => setForm({ ...form, translation: e.target.value })}
                placeholder="English translation"
              />
            </Field>
            <PrimaryBtn className="w-full" onClick={saveShloka} disabled={saving}>
              {saving ? 'Saving…' : 'Schedule Shloka'}
            </PrimaryBtn>
            <p className="text-[10px] text-[#8C7E77] text-center">
              Scheduling for a date that already has a shloka replaces it.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule list */}
      <div className="bg-white border border-[#EFE6DD] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EFE6DD]">
          <h2 className="text-sm font-bold text-[#2D1E17]">Scheduled Shlokas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#8C7E77]">
            <thead className="border-b border-[#EFE6DD]">
              <tr>
                {['Date', 'Reference', 'Translation', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listLoading &&
                [0, 1, 2].map((i) => (
                  <tr key={i} className="border-b border-[#EFE6DD]">
                    {[0, 1, 2, 3].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-3 bg-[#EFE6DD] rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!listLoading &&
                schedule.map((s) => (
                  <tr key={s.date} className="border-b border-[#EFE6DD] hover:bg-[#FAF6F0]/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#2D1E17] whitespace-nowrap">{s.date}</td>
                    <td className="px-6 py-4 text-[#2D1E17] max-w-[16rem]">
                      <span className="line-clamp-1">{s.reference}</span>
                    </td>
                    <td className="px-6 py-4 max-w-[20rem]">
                      <span className="line-clamp-1">{s.translation}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <GhostBtn onClick={() => editRow(s)}>Edit</GhostBtn>
                        <button
                          onClick={() => setDeleting(s)}
                          className="text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 font-semibold text-xs px-3 py-2 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!listLoading && schedule.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#8C7E77]">
                    No shlokas scheduled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title="Delete Shloka" open={!!deleting} onClose={() => setDeleting(null)}>
        <div className="space-y-4">
          <p className="text-[#8C7E77] text-xs">
            Remove the shloka scheduled for{' '}
            <strong className="text-[#2D1E17]">{deleting?.date}</strong>?
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
