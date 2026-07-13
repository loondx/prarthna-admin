'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore, ChapterNode, VerseUnit, VerseInput } from '@/lib/store';
import { MEDIA_BASE } from '@/lib/api';
import { Field, GhostBtn, Modal, PrimaryBtn, inputCls } from '@/components/ui/kit';

const EMPTY_VERSE: VerseInput = {
  verseNumber: '',
  contentSanskrit: '',
  transliteration: '',
  contentEnglish: '',
  translationHindi: '',
  explanation: '',
  lifeLesson: '',
  keyMessage: '',
  benefits: '',
  imageUrl: '',
};

export default function PrayerDetailsPage() {
  const params = useParams<{ id: string }>();
  const collectionId = params.id;
  const { data, actions, toast } = useStore();

  const collection = data.collections.find((c) => c.id === collectionId);

  const [chapters, setChapters] = useState<ChapterNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Chapter modals
  const [chapterModal, setChapterModal] = useState<'create' | ChapterNode | null>(null);
  const [chapterForm, setChapterForm] = useState({
    title: '',
    order: 1,
    overview: '',
    summary: '',
    bannerUrl: '',
    keyTeachings: '',
    characters: '[]',
    events: '[]',
  });
  const [deletingChapter, setDeletingChapter] = useState<ChapterNode | null>(null);

  // Expanded chapter + its verses
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [verses, setVerses] = useState<VerseUnit[]>([]);
  const [versesLoading, setVersesLoading] = useState(false);

  // Verse modals
  const [verseModal, setVerseModal] = useState<'create' | VerseUnit | null>(null);
  const [verseForm, setVerseForm] = useState<VerseInput>(EMPTY_VERSE);
  const [deletingVerse, setDeletingVerse] = useState<VerseUnit | null>(null);

  // Audio Uploading state (maps verseId to uploading status)
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const loadChapters = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setChapters(await actions.getChapters(collectionId));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [collectionId, actions]);

  const loadVerses = useCallback(
    async (nodeId: string) => {
      setVersesLoading(true);
      try {
        setVerses(await actions.getVerses(nodeId));
      } catch {
        toast('Could not load verses', 'error');
      } finally {
        setVersesLoading(false);
      }
    },
    [actions, toast],
  );

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  const toggleExpand = (nodeId: string) => {
    if (expandedId === nodeId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(nodeId);
    setVerses([]);
    loadVerses(nodeId);
  };

  // ── Audio Upload Handler ─────────────────────────────────────────
  const handleAudioUpload = async (verseId: string, verseNumber: string, file: File) => {
    if (!file) return;
    
    setUploadingMap(prev => ({ ...prev, [verseId]: true }));
    const title = `${collection?.title ?? 'Prayer'} - ${verseNumber}`;
    
    const ok = await actions.uploadAudio(file, verseId, title);
    
    setUploadingMap(prev => ({ ...prev, [verseId]: false }));
    
    if (ok) {
      // Reload verses to display the audio player
      if (expandedId) {
        loadVerses(expandedId);
      }
    }
  };

  // ── Chapter handlers ────────────────────────────────────────────
  const openCreateChapter = () => {
    const nextOrder = chapters.reduce((m, c) => Math.max(m, c.order), 0) + 1;
    setChapterForm({
      title: '',
      order: nextOrder,
      overview: '',
      summary: '',
      bannerUrl: '',
      keyTeachings: '',
      characters: '[]',
      events: '[]',
    });
    setChapterModal('create');
  };

  const openEditChapter = (c: ChapterNode) => {
    setChapterForm({
      title: c.title,
      order: c.order,
      overview: c.overview ?? '',
      summary: c.summary ?? '',
      bannerUrl: c.bannerUrl ?? '',
      keyTeachings: (c.keyTeachings ?? []).join('\n'),
      characters: JSON.stringify(c.characters ?? [], null, 2),
      events: JSON.stringify(c.events ?? [], null, 2),
    });
    setChapterModal(c);
  };

  const saveChapter = async () => {
    if (!chapterForm.title.trim()) {
      toast('Prayer section name is required', 'error');
      return;
    }
    
    const payload = {
      title: chapterForm.title.trim(),
      order: chapterForm.order,
      overview: chapterForm.overview.trim() || undefined,
      summary: chapterForm.summary.trim() || undefined,
      bannerUrl: chapterForm.bannerUrl.trim() || undefined,
    };

    const ok =
      chapterModal === 'create'
        ? await actions.createChapter(collectionId, payload.title, payload.order, payload)
        : chapterModal
          ? await actions.updateChapter(chapterModal.id, payload)
          : false;
    if (ok) {
      setChapterModal(null);
      loadChapters();
    }
  };

  const confirmDeleteChapter = async () => {
    if (!deletingChapter) return;
    const ok = await actions.deleteChapter(deletingChapter.id);
    setDeletingChapter(null);
    if (ok) {
      if (expandedId === deletingChapter.id) setExpandedId(null);
      loadChapters();
    }
  };

  // ── Verse handlers ──────────────────────────────────────────────
  const openCreateVerse = () => {
    setVerseForm({ ...EMPTY_VERSE, verseNumber: `Verse ${verses.length + 1}` });
    setVerseModal('create');
  };

  const openEditVerse = (v: VerseUnit) => {
    setVerseForm({
      verseNumber: v.verseNumber,
      contentSanskrit: v.contentSanskrit,
      transliteration: v.transliteration || '',
      contentEnglish: v.contentEnglish,
      translationHindi: v.translationHindi || '',
      explanation: v.explanation || '',
      lifeLesson: v.lifeLesson || '',
      keyMessage: v.keyMessage || '',
      benefits: v.benefits || '',
      imageUrl: v.imageUrl || '',
    });
    setVerseModal(v);
  };

  const saveVerse = async () => {
    if (!verseForm.verseNumber.trim() || !verseForm.contentSanskrit.trim() || !verseForm.contentEnglish.trim()) {
      toast('Verse number, Sanskrit text, and English translation are required', 'error');
      return;
    }
    if (!expandedId) return;
    const payload: VerseInput = {
      verseNumber: verseForm.verseNumber.trim(),
      contentSanskrit: verseForm.contentSanskrit,
      transliteration: verseForm.transliteration || undefined,
      contentEnglish: verseForm.contentEnglish,
      translationHindi: verseForm.translationHindi || undefined,
      explanation: verseForm.explanation || undefined,
      lifeLesson: verseForm.lifeLesson || undefined,
      keyMessage: verseForm.keyMessage || undefined,
      benefits: verseForm.benefits || undefined,
      imageUrl: verseForm.imageUrl || undefined,
    };
    const ok =
      verseModal === 'create'
        ? await actions.createVerse(expandedId, payload)
        : verseModal
          ? await actions.updateVerse(verseModal.id, payload)
          : false;
    if (ok) {
      setVerseModal(null);
      loadVerses(expandedId);
      loadChapters();
    }
  };

  const confirmDeleteVerse = async () => {
    if (!deletingVerse || !expandedId) return;
    const ok = await actions.deleteVerse(deletingVerse.id);
    setDeletingVerse(null);
    if (ok) {
      loadVerses(expandedId);
      loadChapters();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8C7E77] mb-1">
            <Link href="/prayers" className="hover:text-[#8C5A3C] font-semibold">
              ← Manage Prayers
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">
            {collection?.title ?? 'Prayer Manager'}
          </h1>
          <p className="text-[#8C7E77] text-xs mt-1">
            Add/edit chapters and verses, and upload and test recitation audio tracks directly.
          </p>
        </div>
        <PrimaryBtn onClick={openCreateChapter}>+ Add Section/Chapter</PrimaryBtn>
      </div>

      {loading && (
        <div className="space-y-4 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-[#EFE6DD] rounded-2xl p-6 flex items-center gap-4 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#EFE6DD]/60" />
              <div className="h-4 bg-[#EFE6DD]/60 rounded-md w-1/3" />
              <div className="ml-auto w-16 h-8 rounded-lg bg-[#EFE6DD]/40" />
              <div className="w-16 h-8 rounded-lg bg-[#EFE6DD]/40" />
            </div>
          ))}
        </div>
      )}

      {!loading && loadError && (
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-10 text-center">
          <p className="text-sm text-[#8C7E77]">Could not load prayer chapters from the API.</p>
          <GhostBtn className="mt-4" onClick={loadChapters}>Retry</GhostBtn>
        </div>
      )}

      {!loading && !loadError && chapters.length === 0 && (
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-10 text-center">
          <span className="text-3xl">🙏</span>
          <p className="text-sm text-[#8C7E77] mt-3">
            No sections yet. Add the first section/chapter to start publishing verses and audio.
          </p>
        </div>
      )}

      {!loading && !loadError &&
        chapters.map((c) => (
          <div key={c.id} className="bg-white border border-[#EFE6DD] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 px-6 py-4">
              <button
                onClick={() => toggleExpand(c.id)}
                className="flex items-center gap-3 flex-1 text-left group"
              >
                <span
                  className={`text-[#8C7E77] text-xs transition-transform ${expandedId === c.id ? 'rotate-90' : ''}`}
                >
                  ▶
                </span>
                <span className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#EFE6DD] flex items-center justify-center text-[11px] font-bold text-[#8C5A3C]">
                  {c.order}
                </span>
                <span className="font-semibold text-sm text-[#2D1E17] group-hover:text-[#8C5A3C] transition-colors">
                  {c.title}
                </span>
              </button>
              <div className="flex gap-2 shrink-0">
                <GhostBtn onClick={() => openEditChapter(c)}>Edit</GhostBtn>
                <button
                  onClick={() => setDeletingChapter(c)}
                  className="text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 font-semibold text-xs px-3 py-2 rounded-lg transition-all"
                >
                  Delete
                </button>
              </div>
            </div>

            {expandedId === c.id && (
              <div className="border-t border-[#EFE6DD] bg-[#FAF6F0]/40 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C7E77]">
                    Prayer Verses
                  </h3>
                  <GhostBtn onClick={openCreateVerse}>+ Add Verse</GhostBtn>
                </div>

                {versesLoading && (
                  <div className="h-10 rounded-xl bg-white border border-[#EFE6DD] animate-pulse" />
                )}

                {!versesLoading && verses.length === 0 && (
                  <p className="text-xs text-[#8C7E77] py-4 text-center">
                    No verses in this section yet.
                  </p>
                )}

                {!versesLoading && verses.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs text-[#8C7E77]">
                      <thead>
                        <tr className="border-b border-[#EFE6DD]">
                          <th className="pb-2 font-bold uppercase tracking-wider">Ref</th>
                          <th className="pb-2 font-bold uppercase tracking-wider">Sanskrit</th>
                          <th className="pb-2 font-bold uppercase tracking-wider">English</th>
                          <th className="pb-2 font-bold uppercase tracking-wider">Recitation Audio</th>
                          <th className="pb-2 font-bold uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verses.map((v) => (
                          <tr key={v.id} className="border-b border-[#EFE6DD]/60">
                            <td className="py-3 font-semibold text-[#2D1E17] whitespace-nowrap pr-4">
                              {v.verseNumber}
                            </td>
                            <td className="py-3 text-[#2D1E17] pr-4 max-w-[14rem]">
                              <span className="line-clamp-2">{v.contentSanskrit}</span>
                            </td>
                            <td className="py-3 pr-4 max-w-[14rem]">
                              <span className="line-clamp-2">{v.contentEnglish}</span>
                            </td>
                            <td className="py-3 pr-4">
                              {v.audioUrl ? (
                                <audio
                                  controls
                                  preload="none"
                                  src={`${MEDIA_BASE}${v.audioUrl}`}
                                  className="h-8 w-44 max-w-full"
                                />
                              ) : (
                                <span className="text-amber-600 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                                  No Audio
                                </span>
                              )}
                            </td>
                            <td className="py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {/* Upload button */}
                                <input
                                  type="file"
                                  accept="audio/*"
                                  ref={el => { fileInputsRef.current[v.id] = el; }}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleAudioUpload(v.id, v.verseNumber, file);
                                  }}
                                />
                                <button
                                  onClick={() => fileInputsRef.current[v.id]?.click()}
                                  disabled={uploadingMap[v.id]}
                                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all"
                                >
                                  {uploadingMap[v.id] ? 'Uploading…' : '🎙️ Upload Audio'}
                                </button>
                                
                                <GhostBtn onClick={() => openEditVerse(v)}>Edit</GhostBtn>
                                <button
                                  onClick={() => setDeletingVerse(v)}
                                  className="text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

      {/* Chapter create/edit modal */}
      <Modal
        title={chapterModal === 'create' ? 'Add Section/Chapter' : 'Edit Section/Chapter'}
        open={chapterModal !== null}
        onClose={() => setChapterModal(null)}
        disableOutsideClick={true}
      >
        <div className="space-y-4 pt-2">
          <Field label="Section title *">
            <input
              className={inputCls}
              value={chapterForm.title}
              onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
              placeholder="e.g. Purvanga (Introductory prayers)"
            />
          </Field>
          <Field label="Order">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={chapterForm.order}
              onChange={(e) =>
                setChapterForm({ ...chapterForm, order: Math.max(1, Number(e.target.value) || 1) })
              }
            />
          </Field>
          <Field label="Overview (Optional)">
            <textarea
              className={`${inputCls} min-h-20`}
              value={chapterForm.overview}
              onChange={(e) => setChapterForm({ ...chapterForm, overview: e.target.value })}
              placeholder="Brief introductory summary for this prayer section..."
            />
          </Field>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE6DD] mt-6">
            <GhostBtn onClick={() => setChapterModal(null)}>Cancel</GhostBtn>
            <PrimaryBtn onClick={saveChapter}>
              {chapterModal === 'create' ? 'Add Section' : 'Save Changes'}
            </PrimaryBtn>
          </div>
        </div>
      </Modal>

      {/* Verse create/edit modal */}
      <Modal
        title={verseModal === 'create' ? 'Add Verse' : 'Edit Verse'}
        open={verseModal !== null}
        onClose={() => setVerseModal(null)}
        disableOutsideClick={true}
        size="xl"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Verse reference *">
              <input
                className={inputCls}
                value={verseForm.verseNumber}
                onChange={(e) => setVerseForm({ ...verseForm, verseNumber: e.target.value })}
                placeholder="e.g. Verse 1"
              />
            </Field>
            <Field label="Image URL">
              <input
                className={inputCls}
                value={verseForm.imageUrl ?? ''}
                onChange={(e) => setVerseForm({ ...verseForm, imageUrl: e.target.value })}
                placeholder="Optional image URL"
              />
            </Field>
          </div>
          <Field label="Sanskrit text *">
            <textarea
              className={`${inputCls} min-h-20 font-serif`}
              value={verseForm.contentSanskrit}
              onChange={(e) => setVerseForm({ ...verseForm, contentSanskrit: e.target.value })}
              placeholder="देवनागरी…"
            />
          </Field>
          <Field label="Transliteration (IAST)">
            <textarea
              className={`${inputCls} min-h-16`}
              value={verseForm.transliteration ?? ''}
              onChange={(e) => setVerseForm({ ...verseForm, transliteration: e.target.value })}
              placeholder="Optional roman transliteration"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="English translation *">
              <textarea
                className={`${inputCls} min-h-20`}
                value={verseForm.contentEnglish}
                onChange={(e) => setVerseForm({ ...verseForm, contentEnglish: e.target.value })}
                placeholder="English translation..."
              />
            </Field>
            <Field label="Hindi translation">
              <textarea
                className={`${inputCls} min-h-20`}
                value={verseForm.translationHindi ?? ''}
                onChange={(e) => setVerseForm({ ...verseForm, translationHindi: e.target.value })}
                placeholder="Hindi translation..."
              />
            </Field>
          </div>
          <Field label="Simple Explanation">
            <textarea
              className={`${inputCls} min-h-20`}
              value={verseForm.explanation ?? ''}
              onChange={(e) => setVerseForm({ ...verseForm, explanation: e.target.value })}
              placeholder="Optional simple explanation"
            />
          </Field>
          <Field label="Life Lesson">
            <textarea
              className={`${inputCls} min-h-20`}
              value={verseForm.lifeLesson ?? ''}
              onChange={(e) => setVerseForm({ ...verseForm, lifeLesson: e.target.value })}
              placeholder="Optional life lesson"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Key Message">
              <textarea
                className={`${inputCls} min-h-16`}
                value={verseForm.keyMessage ?? ''}
                onChange={(e) => setVerseForm({ ...verseForm, keyMessage: e.target.value })}
                placeholder="Optional key message"
              />
            </Field>
            <Field label="Benefits">
              <textarea
                className={`${inputCls} min-h-16`}
                value={verseForm.benefits ?? ''}
                onChange={(e) => setVerseForm({ ...verseForm, benefits: e.target.value })}
                placeholder="Optional benefits of chanting"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE6DD] mt-6">
            <GhostBtn onClick={() => setVerseModal(null)}>Cancel</GhostBtn>
            <PrimaryBtn onClick={saveVerse}>
              {verseModal === 'create' ? 'Add Verse' : 'Save Changes'}
            </PrimaryBtn>
          </div>
        </div>
      </Modal>

      {/* Chapter delete confirmation */}
      <Modal title="Delete Section" open={!!deletingChapter} onClose={() => setDeletingChapter(null)}>
        <div className="space-y-4">
          <p className="text-[#8C7E77] text-xs">
            Delete <strong className="text-[#2D1E17]">"{deletingChapter?.title}"</strong> and
            all of its verses/audio? Readers will no longer see this section.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={() => setDeletingChapter(null)}>Cancel</GhostBtn>
            <button
              onClick={confirmDeleteChapter}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Verse delete confirmation */}
      <Modal title="Delete Verse" open={!!deletingVerse} onClose={() => setDeletingVerse(null)}>
        <div className="space-y-4">
          <p className="text-[#8C7E77] text-xs">
            Delete <strong className="text-[#2D1E17]">{deletingVerse?.verseNumber}</strong>?
            This action cannot be undone from the panel.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={() => setDeletingVerse(null)}>Cancel</GhostBtn>
            <button
              onClick={confirmDeleteVerse}
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
