'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStore, ContentNodeOption, ContentUnitOption } from '@/lib/store';
import { Field, GhostBtn, PrimaryBtn, StatusBadge, inputCls } from '@/components/ui/kit';

export default function AudioStudioPage() {
  const { data, actions, toast } = useStore();
  const [collectionId, setCollectionId] = useState('');
  const [nodes, setNodes] = useState<ContentNodeOption[]>([]);
  const [nodeId, setNodeId] = useState('');
  const [units, setUnits] = useState<ContentUnitOption[]>([]);
  const [unitId, setUnitId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Cascade: collection → chapters (nodes)
  useEffect(() => {
    setNodes([]);
    setNodeId('');
    if (!collectionId) return;
    actions
      .listNodes(collectionId)
      .then(setNodes)
      .catch(() => toast('Could not load chapters', 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  // Cascade: chapter → verses (units)
  useEffect(() => {
    setUnits([]);
    setUnitId('');
    if (!nodeId) return;
    actions
      .listUnits(nodeId)
      .then(setUnits)
      .catch(() => toast('Could not load verses', 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  const upload = async () => {
    if (!file) {
      toast('Choose an audio file first', 'error');
      return;
    }
    if (!unitId) {
      toast('Select the collection, chapter, and verse this audio belongs to', 'error');
      return;
    }
    setUploading(true);
    const ok = await actions.uploadAudio(file, unitId, file.name);
    setUploading(false);
    if (ok) {
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const approve = async (id: string, title: string) => {
    const ok = await actions.setAudioStatus(id, 'published');
    if (ok) toast(`${title} published to users`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2D1E17]">Audio Studio</h1>
        <p className="text-[#8C7E77] text-xs mt-1">
          Upload, process, and publish audio tracks through the FFmpeg pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger">
        {/* Upload form */}
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#2D1E17] mb-4">New Audio Track</h2>
          <div className="space-y-4">
            <Field label="Scripture *">
              <select
                className={inputCls}
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
              >
                <option value="">Select collection…</option>
                {data.collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Chapter *">
              <select
                className={inputCls}
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                disabled={!nodes.length}
              >
                <option value="">{collectionId ? 'Select chapter…' : '—'}</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Verse *">
              <select
                className={inputCls}
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                disabled={!units.length}
              >
                <option value="">{nodeId ? 'Select verse…' : '—'}</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.verseNumber}</option>
                ))}
              </select>
            </Field>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border border-dashed border-[#D3C1AF] rounded-xl p-8 text-center bg-[#FAF6F0]/50 hover:border-[#8C5A3C]/60 hover:bg-[#FAF6F0] transition-colors cursor-pointer"
            >
              <span className="text-2xl">📤</span>
              <p className="text-[#8C7E77] text-xs mt-2 font-medium">
                {file ? file.name : 'Click to choose an audio file'}
                <br />
                MP3, WAV, M4A up to 50MB
              </p>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <PrimaryBtn className="w-full" onClick={upload} disabled={uploading}>
              {uploading ? 'Uploading…' : '🎙️ Upload & Process'}
            </PrimaryBtn>
          </div>
        </div>

        {/* Pipeline table */}
        <div className="lg:col-span-2 bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#2D1E17] mb-6">Processing Pipeline</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-[#8C7E77]">
              <thead>
                <tr className="border-b border-[#EFE6DD]">
                  {['Filename', 'Size', 'Duration', 'Uploader', 'Status', 'Action'].map((h) => (
                    <th key={h} className="pb-3 font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.audio.map((t) => (
                  <tr key={t.id} className="border-b border-[#EFE6DD] hover:bg-[#FAF6F0]/30 transition-colors">
                    <td className="py-4 font-semibold text-[#2D1E17]">
                      {t.title}
                      {(t.status === 'uploading' || t.status === 'processing') && (
                        <div className="mt-1.5 h-1 w-32 rounded-full bg-[#EFE6DD] overflow-hidden">
                          <div
                            className="h-full bg-[#8C5A3C] transition-all duration-300"
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-[#2D1E17]">{t.size}</td>
                    <td className="py-4 text-[#2D1E17]">{t.duration}</td>
                    <td className="py-4 text-[#2D1E17]">{t.user}</td>
                    <td className="py-4"><StatusBadge status={t.status} /></td>
                    <td className="py-4">
                      {t.status === 'ready_for_review' ? (
                        <GhostBtn onClick={() => approve(t.id, t.title)}>✓ Approve</GhostBtn>
                      ) : (
                        <span className="text-[#8C7E77]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
