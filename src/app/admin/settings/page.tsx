'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Field, PrimaryBtn, inputCls } from '@/components/ui/kit';

export default function SettingsPage() {
  const { data, ready, actions } = useStore();
  const [mediaPath, setMediaPath] = useState(data.settings.mediaPath);
  const [morning, setMorning] = useState(data.settings.reminderMorning);
  const [evening, setEvening] = useState(data.settings.reminderEvening);
  const [saving, setSaving] = useState(false);

  // Sync local form once settings load from the backend.
  useEffect(() => {
    if (!ready) return;
    setMediaPath(data.settings.mediaPath);
    setMorning(data.settings.reminderMorning);
    setEvening(data.settings.reminderEvening);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const save = async () => {
    setSaving(true);
    await actions.saveSettings({
      mediaPath,
      reminderMorning: morning,
      reminderEvening: evening,
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-[#2D1E17]">General Settings</h1>
        <p className="text-[#8C7E77] text-xs mt-1">
          Global application keys, reminder defaults, and storage locations.
        </p>
      </div>

      <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 space-y-6 shadow-sm animate-rise-in">
        <h2 className="text-sm font-bold text-[#2D1E17] border-b border-[#EFE6DD] pb-3 flex items-center gap-2">
          <span>🔐</span> Firebase Credentials
        </h2>
        <div className="space-y-4">
          <Field label="Firebase Project ID">
            <input
              type="text"
              defaultValue="prarthna-f831d"
              disabled
              className={`${inputCls} cursor-not-allowed opacity-70`}
            />
          </Field>
          <Field label="Service Account Private Key (Encrypted)">
            <input
              type="password"
              value="••••••••••••••••••••••••••••••••"
              disabled
              readOnly
              className={`${inputCls} cursor-not-allowed opacity-70`}
            />
          </Field>
          <p className="text-[10px] text-[#8C7E77] bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            ⚠️ Credentials are managed via environment variables. Edit <code>.env</code> to change them.
          </p>
        </div>

        <h2 className="text-sm font-bold text-[#2D1E17] border-b border-[#EFE6DD] pb-3 flex items-center gap-2">
          <span>⏰</span> Default Reminder Times
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Morning reminder">
            <input
              type="time"
              className={inputCls}
              value={morning}
              onChange={(e) => setMorning(e.target.value)}
            />
          </Field>
          <Field label="Evening reminder">
            <input
              type="time"
              className={inputCls}
              value={evening}
              onChange={(e) => setEvening(e.target.value)}
            />
          </Field>
        </div>
        {connected && (
          <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            ✅ Reminder defaults will also be synced to the PostgreSQL backend on save.
          </p>
        )}

        <h2 className="text-sm font-bold text-[#2D1E17] border-b border-[#EFE6DD] pb-3 flex items-center gap-2">
          <span>📦</span> Media Storage
        </h2>
        <div className="space-y-4">
          <Field label="Provider">
            <select className={inputCls}>
              <option>Local VPS filesystem (Staging/MVP)</option>
              <option disabled>Amazon S3 / Cloudflare R2 (Disabled)</option>
            </select>
          </Field>
          <Field label="Local mount path">
            <input
              type="text"
              className={inputCls}
              value={mediaPath}
              onChange={(e) => setMediaPath(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex gap-4 pt-2">
          <PrimaryBtn onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
