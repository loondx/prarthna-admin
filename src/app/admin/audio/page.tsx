'use client';

import React, { useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { Field, GhostBtn, PrimaryBtn, StatusBadge, inputCls } from '@/components/ui/kit';

export default function AudioStudioPage() {
  const { data, update, toast } = useStore();
  const [scripture, setScripture] = useState('Bhagavad Gita');
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);

  /// Simulates the upload → ffmpeg transcode → review pipeline the worker runs.
  const upload = () => {
    if (!chapter || !verse) {
      toast('Chapter and verse are required', 'error');
      return;
    }
    const id = `a${Date.now()}`;
    const name = `${scripture === 'Bhagavad Gita' ? 'BG' : 'HC'}_C${chapter.padStart(2, '0')}_V${verse.padStart(2, '0')}.mp3`;

    update(
      (d) => ({
        ...d,
        audio: [
          { id, title: name, size: `${(Math.random() * 3 + 0.8).toFixed(1)} MB`, duration: `0:${Math.floor(Math.random() * 40 + 20)}`, status: 'uploading', user: 'Pankaj Kumar', progress: 0 },
          ...d.audio,
        ],
      }),
      { action: `Uploaded audio ${name}`, module: 'Audio' },
    );
    toast(`Uploading ${name}...`, 'info');

    const timer = setInterval(() => {
      update((d) => ({
        ...d,
        audio: d.audio.map((a) => {
          if (a.id !== id) return a;
          const p = Math.min(a.progress + 12, 100);
          if (p >= 100 && a.status === 'uploading') {
            return { ...a, progress: 40, status: 'processing' };
          }
          if (p >= 100 && a.status === 'processing') {
            clearInterval(timer);
            return { ...a, progress: 100, status: 'ready_for_review' };
          }
          return { ...a, progress: p };
        }),
      }));
    }, 450);
    timers.current.push(timer);
    setChapter('');
    setVerse('');
  };

  const approve = (id: string, title: string) => {
    update(
      (d) => ({
        ...d,
        audio: d.audio.map((a) => (a.id === id ? { ...a, status: 'published' as const } : a)),
      }),
      { action: `Approved & published ${title}`, module: 'Audio' },
    );
    toast(`${title} published to users`);
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
            <Field label="Scripture">
              <select className={inputCls} value={scripture} onChange={(e) => setScripture(e.target.value)}>
                <option>Bhagavad Gita</option>
                <option>Hanuman Chalisa</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Chapter *">
                <input
                  className={inputCls}
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1"
                />
              </Field>
              <Field label="Verse *">
                <input
                  className={inputCls}
                  value={verse}
                  onChange={(e) => setVerse(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1"
                />
              </Field>
            </div>
            <button
              onClick={upload}
              className="w-full border border-dashed border-[#D3C1AF] rounded-xl p-8 text-center bg-[#FAF6F0]/50 hover:border-[#8C5A3C]/60 hover:bg-[#FAF6F0] transition-colors cursor-pointer"
            >
              <span className="text-2xl">📤</span>
              <p className="text-[#8C7E77] text-xs mt-2 font-medium">
                Click to simulate upload
                <br />
                MP3, WAV, M4A up to 20MB
              </p>
            </button>
            <PrimaryBtn className="w-full" onClick={upload}>
              🎙️ Upload & Process
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
