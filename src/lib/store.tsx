'use client';

/**
 * Admin data store — fully backend-driven.
 *
 * All reads come from the NestJS API on mount (and via refresh()); all
 * mutations call the API and update local state from the server response.
 * Audit entries are recorded server-side by the backend on each mutation —
 * the panel never fabricates audit rows.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  apiUpload,
  getAdminToken,
} from './api';

// ── View models (shaped for the existing page markup) ─────────────

export interface Collection {
  id: string;
  title: string;
  status: 'Published' | 'Draft';
  nodes: string;
  units: string;
  lang: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  size: string;
  duration: string;
  status: 'uploading' | 'processing' | 'ready_for_review' | 'published';
  user: string;
  progress: number;
  audioUrl?: string;
}

export interface SankalpTemplate {
  id: string;
  title: string;
  target: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Intense';
}

export interface FestivalItem {
  id: string;
  name: string;
  date: string; // yyyy-mm-dd
  category: string;
  icon: string;
  status: 'Active' | 'Draft';
}

export interface NotificationItem {
  id: string;
  title: string;
  category: string;
  audience: string;
  status: 'Sent' | 'Scheduled';
  sentAt: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  email: string;
  action: string;
  module: string;
  date: string;
  ip: string;
}

export interface ShlokaSchedule {
  date: string;
  reference: string;
  sanskrit: string;
  translation: string;
}

export interface ContentUnitOption {
  id: string;
  verseNumber: string;
}

export interface ContentNodeOption {
  id: string;
  title: string;
}

export interface Toast {
  id: number;
  message: string;
  kind: 'success' | 'error' | 'info';
}

interface AdminData {
  collections: Collection[];
  audio: AudioTrack[];
  sankalps: SankalpTemplate[];
  festivals: FestivalItem[];
  notifications: NotificationItem[];
  audit: AuditEntry[];
  shloka: ShlokaSchedule;
  settings: { mediaPath: string; reminderMorning: string; reminderEvening: string };
}

const EMPTY_DATA: AdminData = {
  collections: [],
  audio: [],
  sankalps: [],
  festivals: [],
  notifications: [],
  audit: [],
  shloka: { date: '', reference: '', sanskrit: '', translation: '' },
  settings: { mediaPath: '/var/lib/prarthna/media', reminderMorning: '08:00', reminderEvening: '18:00' },
};

// ── Backend → view-model mappers ──────────────────────────────────

function mapCollection(c: any): Collection {
  return {
    id: c.id,
    title: c.title,
    status: (c.status as Collection['status']) ?? 'Published',
    nodes: `${c._count?.nodes ?? 0} Chapters`,
    units: c.type ?? 'SCRIPTURE',
    lang: c.description ?? '',
  };
}

function mapMedia(m: any): AudioTrack {
  return {
    id: m.id,
    title: m.title ?? m.audioUrl?.split('/').pop() ?? m.id,
    size: `${((m.size ?? 0) / (1024 * 1024)).toFixed(1)} MB`,
    duration: m.duration ? `${Math.floor(m.duration / 60)}:${String(m.duration % 60).padStart(2, '0')}` : '—',
    status: (m.status as AudioTrack['status']) ?? 'published',
    user: m.uploadedBy ?? 'Admin',
    progress: 100,
    audioUrl: m.audioUrl,
  };
}

function mapAudit(l: any): AuditEntry {
  return {
    id: l.id,
    actor: l.actorEmail ? l.actorEmail.split('@')[0] : (l.user?.email ?? 'System'),
    email: l.actorEmail ?? l.user?.email ?? 'system@prarthna.app',
    action: l.action,
    module: l.entityName,
    date: new Date(l.createdAt).toLocaleString(),
    ip: l.ip ?? '—',
  };
}

function mapNotification(n: any): NotificationItem {
  return {
    id: n.id,
    title: n.title,
    category: n.category,
    audience: n.audience,
    status: (n.status as NotificationItem['status']) ?? 'Scheduled',
    sentAt: n.sentAt ? new Date(n.sentAt).toLocaleString() : '—',
  };
}

// ── Store contract ────────────────────────────────────────────────

interface StoreValue {
  data: AdminData;
  ready: boolean;
  connected: boolean;
  apiLoading: boolean;
  toasts: Toast[];
  toast: (message: string, kind?: Toast['kind']) => void;
  refresh: () => Promise<void>;
  actions: {
    createCollection: (input: { title: string; type: string; description?: string }) => Promise<boolean>;
    setCollectionStatus: (id: string, status: 'Published' | 'Draft') => Promise<boolean>;
    createFestival: (input: Omit<FestivalItem, 'id'>) => Promise<boolean>;
    updateFestival: (id: string, input: Omit<FestivalItem, 'id'>) => Promise<boolean>;
    deleteFestival: (id: string) => Promise<boolean>;
    createTemplate: (input: Omit<SankalpTemplate, 'id'>) => Promise<boolean>;
    updateTemplate: (id: string, input: Omit<SankalpTemplate, 'id'>) => Promise<boolean>;
    deleteTemplate: (id: string) => Promise<boolean>;
    createNotification: (input: { title: string; category: string; audience: string; status: 'Sent' | 'Scheduled'; sentAt?: string }) => Promise<boolean>;
    deleteNotification: (id: string) => Promise<boolean>;
    saveShloka: (input: ShlokaSchedule) => Promise<boolean>;
    saveSettings: (value: AdminData['settings']) => Promise<boolean>;
    uploadAudio: (file: File, contentUnitId: string, title?: string) => Promise<boolean>;
    setAudioStatus: (id: string, status: string) => Promise<boolean>;
    listNodes: (collectionId: string) => Promise<ContentNodeOption[]>;
    listUnits: (nodeId: string) => Promise<ContentUnitOption[]>;
  };
}

const StoreContext = createContext<StoreValue | null>(null);

let toastSeq = 0;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: Toast['kind'] = 'success') => {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const refresh = useCallback(async () => {
    setApiLoading(true);
    const authed = Boolean(getAdminToken());
    try {
      // Public reads always work; admin-only reads need the session token.
      const [collections, festivals, templates, shloka] = await Promise.all([
        apiGet<any[]>('/content/collections'),
        apiGet<any[]>('/festivals'),
        apiGet<any[]>('/templates'),
        apiGet<any | null>('/shloka/today'),
      ]);
      const [audit, notifications, media, settings] = authed
        ? await Promise.all([
            apiGet<{ items: any[] }>('/audit').catch(() => ({ items: [] })),
            apiGet<any[]>('/notifications').catch(() => []),
            apiGet<any[]>('/content/media').catch(() => []),
            apiGet<Record<string, any>>('/settings').catch(() => ({} as Record<string, any>)),
          ])
        : [{ items: [] } as { items: any[] }, [] as any[], [] as any[], {} as Record<string, any>];

      setData((prev) => ({
        collections: collections.map(mapCollection),
        festivals: festivals.map((f: any) => ({
          id: f.id,
          name: f.name,
          date: f.date,
          category: f.category,
          icon: f.icon,
          status: (f.status as FestivalItem['status']) ?? 'Active',
        })),
        sankalps: templates.map((t: any) => ({
          id: t.id,
          title: t.title,
          target: t.target,
          duration: t.duration,
          difficulty: t.difficulty as SankalpTemplate['difficulty'],
        })),
        shloka: shloka
          ? {
              date: shloka.date,
              reference: shloka.reference,
              sanskrit: shloka.sanskrit,
              translation: shloka.translation,
            }
          : prev.shloka,
        audit: audit.items.map(mapAudit),
        notifications: notifications.map(mapNotification),
        audio: media.map(mapMedia),
        settings: {
          mediaPath: settings.mediaPath ?? prev.settings.mediaPath,
          reminderMorning: settings.reminderMorning ?? prev.settings.reminderMorning,
          reminderEvening: settings.reminderEvening ?? prev.settings.reminderEvening,
        },
      }));
      setConnected(true);
    } catch (e) {
      setConnected(false);
      if (e instanceof ApiError && e.status !== 401) {
        toast(e.message, 'error');
      }
    } finally {
      setApiLoading(false);
      setReady(true);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Wrap a mutation: run, toast errors, refresh state from the backend. */
  const run = useCallback(
    async (fn: () => Promise<unknown>, successMessage?: string): Promise<boolean> => {
      try {
        await fn();
        if (successMessage) toast(successMessage);
        await refresh();
        return true;
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Request failed', 'error');
        return false;
      }
    },
    [refresh, toast],
  );

  const actions: StoreValue['actions'] = {
    createCollection: (input) =>
      run(() => apiPost('/content/collections', input), `Collection "${input.title}" created`),
    setCollectionStatus: (id, status) =>
      run(() => apiPatch(`/content/collections/${id}/status`, { status })),
    createFestival: (input) =>
      run(() => apiPost('/festivals', input), `Festival "${input.name}" created`),
    updateFestival: (id, input) =>
      run(() => apiPatch(`/festivals/${id}`, input), `Festival "${input.name}" updated`),
    deleteFestival: (id) => run(() => apiDelete(`/festivals/${id}`), 'Festival deleted'),
    createTemplate: (input) =>
      run(() => apiPost('/templates', input), `Template "${input.title}" created`),
    updateTemplate: (id, input) =>
      run(() => apiPatch(`/templates/${id}`, input), `Template "${input.title}" updated`),
    deleteTemplate: (id) => run(() => apiDelete(`/templates/${id}`), 'Template deleted'),
    createNotification: (input) =>
      run(
        () => apiPost('/notifications', input),
        input.status === 'Sent' ? 'Notification sent to users' : 'Notification scheduled',
      ),
    deleteNotification: (id) =>
      run(() => apiDelete(`/notifications/${id}`), 'Notification removed'),
    saveShloka: (input) =>
      run(() => apiPut('/shloka', input), `Daily shloka scheduled for ${input.date}`),
    saveSettings: (value) =>
      run(() => apiPut('/settings', { value }), 'Settings saved'),
    uploadAudio: (file, contentUnitId, title) => {
      const form = new FormData();
      form.append('file', file);
      form.append('contentUnitId', contentUnitId);
      if (title) form.append('title', title);
      return run(() => apiUpload('/content/media/upload', form), `Uploaded ${title ?? file.name}`);
    },
    setAudioStatus: (id, status) =>
      run(() => apiPatch(`/content/media/${id}/status`, { status })),
    listNodes: async (collectionId) => {
      const detail = await apiGet<any>(`/content/collections/${collectionId}`);
      return (detail.nodes ?? []).map((n: any) => ({ id: n.id, title: n.title }));
    },
    listUnits: async (nodeId) => {
      const detail = await apiGet<any>(`/content/nodes/${nodeId}`);
      return (detail.units ?? []).map((u: any) => ({ id: u.id, verseNumber: u.verseNumber }));
    },
  };

  return (
    <StoreContext.Provider
      value={{ data, ready, connected, apiLoading, toasts, toast, refresh, actions }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
