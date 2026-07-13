'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useStore,
  ChapterNode,
  VerseUnit,
  VerseInput,
} from '@/lib/store';
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

export default function ChapterManagerPage() {
  const params = useParams<{ id: string }>();
  const collectionId = params.id;
  const { data, actions, toast } = useStore();

  const collection = data.collections.find((c) => c.id === collectionId);

  const [chapters, setChapters] = useState<ChapterNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Chapter modals
  const [chapterModal, setChapterModal] = useState<'create' | ChapterNode | null>(null);
  const [chapterForm, setChapterForm] = useState<{
    title: string;
    order: number;
    overview: string;
    summary: string;
    bannerUrl: string;
    keyTeachings: string;
    characters: { name: string; role: string; description: string }[];
    events: { title: string; description: string }[];
  }>({
    title: '',
    order: 1,
    overview: '',
    summary: '',
    bannerUrl: '',
    keyTeachings: '',
    characters: [],
    events: [],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [collectionId],
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
      characters: [],
      events: [],
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
      characters: Array.isArray(c.characters) ? c.characters : [],
      events: Array.isArray(c.events) ? c.events : [],
    });
    setChapterModal(c);
  };

  const saveChapter = async () => {
    if (!chapterForm.title.trim()) {
      toast('Chapter title is required', 'error');
      return;
    }

    const payload = {
      title: chapterForm.title.trim(),
      order: chapterForm.order,
      overview: chapterForm.overview.trim() || undefined,
      summary: chapterForm.summary.trim() || undefined,
      bannerUrl: chapterForm.bannerUrl.trim() || undefined,
      keyTeachings: chapterForm.keyTeachings.split('\n').map(t => t.trim()).filter(Boolean),
      characters: chapterForm.characters,
      events: chapterForm.events,
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
      toast('Verse number, Sanskrit, and English text are required', 'error');
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
            <Link href="/content" className="hover:text-[#8C5A3C] font-semibold">
              ← Content Library
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">
            {collection?.title ?? 'Chapter Manager'}
          </h1>
          <p className="text-[#8C7E77] text-xs mt-1">
            Add, edit, or remove chapters and their verses. Published changes appear
            in the mobile app immediately.
          </p>
        </div>
        <PrimaryBtn onClick={openCreateChapter}>+ Add Chapter</PrimaryBtn>
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
          <p className="text-sm text-[#8C7E77]">Could not load chapters from the API.</p>
          <GhostBtn className="mt-4" onClick={loadChapters}>Retry</GhostBtn>
        </div>
      )}

      {!loading && !loadError && chapters.length === 0 && (
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-10 text-center">
          <span className="text-3xl">📖</span>
          <p className="text-sm text-[#8C7E77] mt-3">
            No chapters yet. Add the first chapter to start publishing verses.
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
                    Verses
                  </h3>
                  <GhostBtn onClick={openCreateVerse}>+ Add Verse</GhostBtn>
                </div>

                {versesLoading && (
                  <div className="h-10 rounded-xl bg-white border border-[#EFE6DD] animate-pulse" />
                )}

                {!versesLoading && verses.length === 0 && (
                  <p className="text-xs text-[#8C7E77] py-4 text-center">
                    No verses in this chapter yet.
                  </p>
                )}

                {!versesLoading && verses.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs text-[#8C7E77]">
                      <thead>
                        <tr className="border-b border-[#EFE6DD]">
                          {['Ref', 'Sanskrit', 'English', 'Actions'].map((h) => (
                            <th key={h} className="pb-2 font-bold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {verses.map((v) => (
                          <tr key={v.id} className="border-b border-[#EFE6DD]/60">
                            <td className="py-3 font-semibold text-[#2D1E17] whitespace-nowrap pr-4">
                              {v.verseNumber}
                            </td>
                            <td className="py-3 text-[#2D1E17] pr-4 max-w-[16rem]">
                              <span className="line-clamp-2">{v.contentSanskrit}</span>
                            </td>
                            <td className="py-3 pr-4 max-w-[18rem]">
                              <span className="line-clamp-2">{v.contentEnglish}</span>
                            </td>
                            <td className="py-3 whitespace-nowrap">
                              <div className="flex gap-2">
                                <GhostBtn onClick={() => openEditVerse(v)}>Edit</GhostBtn>
                                <button
                                  onClick={() => setDeletingVerse(v)}
                                  className="text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 font-semibold text-xs px-3 py-2 rounded-lg transition-all"
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
        title={chapterModal === 'create' ? 'Add Chapter' : 'Edit Chapter'}
        open={chapterModal !== null}
        onClose={() => setChapterModal(null)}
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
          <Field label="Chapter title *">
            <input
              className={inputCls}
              value={chapterForm.title}
              onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
              placeholder="e.g. Chapter 3 — Karma Yoga"
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
          <Field label="Overview">
            <textarea
              className={`${inputCls} min-h-20`}
              value={chapterForm.overview}
              onChange={(e) => setChapterForm({ ...chapterForm, overview: e.target.value })}
              placeholder="A longer introductory paragraph about the chapter..."
            />
          </Field>
          <Field label="Short Summary">
            <textarea
              className={`${inputCls} min-h-16`}
              value={chapterForm.summary}
              onChange={(e) => setChapterForm({ ...chapterForm, summary: e.target.value })}
              placeholder="Brief high-level summary..."
            />
          </Field>
          <Field label="Banner Image URL">
            <input
              className={inputCls}
              value={chapterForm.bannerUrl}
              onChange={(e) => setChapterForm({ ...chapterForm, bannerUrl: e.target.value })}
              placeholder="https://example.com/banner.jpg"
            />
          </Field>
          <Field label="Key Teachings (one per line)">
            <textarea
              className={`${inputCls} min-h-20`}
              value={chapterForm.keyTeachings}
              onChange={(e) => setChapterForm({ ...chapterForm, keyTeachings: e.target.value })}
              placeholder="e.g. Selfless service is key to liberation.&#10;Control over desires yields peace."
            />
          </Field>
          {/* Main Characters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#8C7E77]">Main Characters</label>
              <button
                type="button"
                onClick={() => setChapterForm(prev => ({
                  ...prev,
                  characters: [...prev.characters, { name: '', role: '', description: '' }]
                }))}
                className="text-xs font-semibold text-[#8C5A3C] hover:underline"
              >
                + Add Character
              </button>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto border border-[#EFE6DD] rounded-xl p-3 bg-[#FAF6F0]/30">
              {chapterForm.characters.length === 0 ? (
                <p className="text-[10px] text-[#8C7E77] text-center py-2">No characters added yet.</p>
              ) : (
                chapterForm.characters.map((char, index) => (
                  <div key={index} className="space-y-2 pb-2 border-b border-[#EFE6DD] last:border-0 last:pb-0">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className={inputCls}
                        value={char.name}
                        onChange={(e) => {
                          const updated = [...chapterForm.characters];
                          updated[index] = { ...updated[index], name: e.target.value };
                          setChapterForm({ ...chapterForm, characters: updated });
                        }}
                        placeholder="Character Name"
                      />
                      <input
                        className={inputCls}
                        value={char.role}
                        onChange={(e) => {
                          const updated = [...chapterForm.characters];
                          updated[index] = { ...updated[index], role: e.target.value };
                          setChapterForm({ ...chapterForm, characters: updated });
                        }}
                        placeholder="Role (e.g. Divine Teacher)"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        className="flex-1 bg-white border border-[#EFE6DD] rounded-lg p-2 text-xs text-[#2D1E17]"
                        value={char.description}
                        onChange={(e) => {
                          const updated = [...chapterForm.characters];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setChapterForm({ ...chapterForm, characters: updated });
                        }}
                        placeholder="Brief description..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = chapterForm.characters.filter((_, i) => i !== index);
                          setChapterForm({ ...chapterForm, characters: updated });
                        }}
                        className="text-red-500 hover:text-red-700 text-xs px-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chapter Events */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#8C7E77]">Chapter Events</label>
              <button
                type="button"
                onClick={() => setChapterForm(prev => ({
                  ...prev,
                  events: [...prev.events, { title: '', description: '' }]
                }))}
                className="text-xs font-semibold text-[#8C5A3C] hover:underline"
              >
                + Add Event
              </button>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto border border-[#EFE6DD] rounded-xl p-3 bg-[#FAF6F0]/30">
              {chapterForm.events.length === 0 ? (
                <p className="text-[10px] text-[#8C7E77] text-center py-2">No events added yet.</p>
              ) : (
                chapterForm.events.map((evt, index) => (
                  <div key={index} className="space-y-2 pb-2 border-b border-[#EFE6DD] last:border-0 last:pb-0">
                    <input
                      className={inputCls}
                      value={evt.title}
                      onChange={(e) => {
                        const updated = [...chapterForm.events];
                        updated[index] = { ...updated[index], title: e.target.value };
                        setChapterForm({ ...chapterForm, events: updated });
                      }}
                      placeholder="Event Title"
                    />
                    <div className="flex gap-2 items-center">
                      <input
                        className="flex-1 bg-white border border-[#EFE6DD] rounded-lg p-2 text-xs text-[#2D1E17]"
                        value={evt.description}
                        onChange={(e) => {
                          const updated = [...chapterForm.events];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setChapterForm({ ...chapterForm, events: updated });
                        }}
                        placeholder="Event Description..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = chapterForm.events.filter((_, i) => i !== index);
                          setChapterForm({ ...chapterForm, events: updated });
                        }}
                        className="text-red-500 hover:text-red-700 text-xs px-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={() => setChapterModal(null)}>Cancel</GhostBtn>
            <PrimaryBtn onClick={saveChapter}>
              {chapterModal === 'create' ? 'Add Chapter' : 'Save Changes'}
            </PrimaryBtn>
          </div>
        </div>
      </Modal>

      {/* Verse create/edit modal */}
      <Modal
        title={verseModal === 'create' ? 'Add Verse' : 'Edit Verse'}
        open={verseModal !== null}
        onClose={() => setVerseModal(null)}
      >
        <div className="space-y-4">
          <Field label="Verse reference *">
            <input
              className={inputCls}
              value={verseForm.verseNumber}
              onChange={(e) => setVerseForm({ ...verseForm, verseNumber: e.target.value })}
              placeholder="e.g. Verse 12"
            />
          </Field>
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
          <Field label="English translation *">
            <textarea
              className={`${inputCls} min-h-20`}
              value={verseForm.contentEnglish}
              onChange={(e) => setVerseForm({ ...verseForm, contentEnglish: e.target.value })}
            />
          </Field>
          <Field label="Hindi translation">
            <textarea
              className={`${inputCls} min-h-20`}
              value={verseForm.translationHindi ?? ''}
              onChange={(e) => setVerseForm({ ...verseForm, translationHindi: e.target.value })}
              placeholder="Optional Hindi translation"
            />
          </Field>
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
          <Field label="Image URL">
            <input
              className={inputCls}
              value={verseForm.imageUrl ?? ''}
              onChange={(e) => setVerseForm({ ...verseForm, imageUrl: e.target.value })}
              placeholder="Optional image URL representing this verse"
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={() => setVerseModal(null)}>Cancel</GhostBtn>
            <PrimaryBtn onClick={saveVerse}>
              {verseModal === 'create' ? 'Add Verse' : 'Save Changes'}
            </PrimaryBtn>
          </div>
        </div>
      </Modal>

      {/* Chapter delete confirmation */}
      <Modal title="Delete Chapter" open={!!deletingChapter} onClose={() => setDeletingChapter(null)}>
        <div className="space-y-4">
          <p className="text-[#8C7E77] text-xs">
            Delete <strong className="text-[#2D1E17]">"{deletingChapter?.title}"</strong> and
            all of its verses? Readers will no longer see this chapter in the app.
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
