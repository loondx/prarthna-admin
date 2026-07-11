'use client';

/**
 * Client-side admin data store, persisted to localStorage so the panel is
 * fully interactive without the backend running. Shapes mirror the
 * prarthna-backend Prisma models so swapping in React Query + the real API
 * is a drop-in change.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

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
  progress: number; // 0-100 for uploading/processing
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

const SEED: AdminData = {
  collections: [
    { id: 'c1', title: 'Bhagavad Gita', status: 'Published', nodes: '18 Chapters', units: '700 Verses', lang: 'Sanskrit & English' },
    { id: 'c2', title: 'Ramayana', status: 'Draft', nodes: '7 Kandas', units: '24,000 Verses', lang: 'Sanskrit & Hindi' },
    { id: 'c3', title: 'Hanuman Chalisa', status: 'Published', nodes: '1 Section', units: '40 Chaupais', lang: 'Awadhi & English' },
    { id: 'c4', title: 'Vishnu Sahasranamam', status: 'Published', nodes: '1 Chapter', units: '108 Names', lang: 'Sanskrit & English' },
  ],
  audio: [
    { id: 'a1', title: 'BG_C01_V01.mp3', size: '1.2 MB', duration: '0:45', status: 'ready_for_review', user: 'Devi Prasad', progress: 100 },
    { id: 'a2', title: 'BG_C01_V02.wav', size: '4.8 MB', duration: '0:38', status: 'processing', user: 'Rohan Sharma', progress: 62 },
    { id: 'a3', title: 'BG_C01_V03.mp3', size: '1.1 MB', duration: '0:52', status: 'published', user: 'Devi Prasad', progress: 100 },
  ],
  sankalps: [
    { id: 's1', title: 'Bhagavad Gita 18 Days', target: 'Complete Gita in 18 days', duration: '40 mins/day', difficulty: 'Intense' },
    { id: 's2', title: 'Bhagavad Gita 1 Year', target: 'Complete Gita in 1 year', duration: '5 mins/day', difficulty: 'Easy' },
    { id: 's3', title: 'Hanuman Chalisa Habit', target: 'Recite Chalisa for 40 days', duration: '10 mins/day', difficulty: 'Medium' },
  ],
  festivals: [
    { id: 'f1', name: 'Guru Purnima', date: '2026-07-29', category: 'Hindu', icon: '🪔', status: 'Active' },
    { id: 'f2', name: 'Raksha Bandhan', date: '2026-08-28', category: 'Hindu', icon: '🎗️', status: 'Active' },
    { id: 'f3', name: 'Janmashtami', date: '2026-09-04', category: 'Hindu', icon: '🦚', status: 'Active' },
    { id: 'f4', name: 'Ganesh Chaturthi', date: '2026-09-14', category: 'Hindu', icon: '🐘', status: 'Active' },
    { id: 'f5', name: 'Sharad Navratri', date: '2026-10-11', category: 'Hindu', icon: '🌺', status: 'Draft' },
    { id: 'f6', name: 'Diwali', date: '2026-11-08', category: 'Hindu', icon: '🪔', status: 'Active' },
  ],
  notifications: [
    { id: 'n1', title: 'Daily Motivation', category: 'Spiritual', audience: 'All users', status: 'Sent', sentAt: '2026-07-10 08:00' },
    { id: 'n2', title: 'Gita Chapter 2 Reminder', category: 'Reading', audience: 'Gita readers', status: 'Sent', sentAt: '2026-07-10 18:00' },
    { id: 'n3', title: 'Guru Purnima Reminder', category: 'Festival', audience: 'All users', status: 'Scheduled', sentAt: '2026-07-28 08:00' },
  ],
  audit: [
    { id: 'l1', actor: 'Pankaj Kumar', email: 'pankaj.kumar@prarthna.com', action: 'Approved audio track BG_C02_V10.mp3', module: 'Audio', date: '2026-07-11 17:32', ip: '192.168.1.42' },
    { id: 'l2', actor: 'Pankaj Kumar', email: 'pankaj.kumar@prarthna.com', action: 'Seeded Bhagavad Gita scripture nodes', module: 'Content', date: '2026-07-11 16:45', ip: '192.168.1.42' },
    { id: 'l3', actor: 'System Worker', email: 'system@prarthna.com', action: 'Recalculated sankalp streaks for 8,432 users', module: 'Worker', date: '2026-07-11 02:00', ip: 'localhost' },
  ],
  shloka: {
    date: '2026-07-11',
    reference: 'Bhagavad Gita — Chapter 4, Verse 7',
    sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
    translation: 'Whenever righteousness wanes and unrighteousness increases, I send myself forth.',
  },
  settings: {
    mediaPath: '/var/lib/prarthna/media',
    reminderMorning: '08:00',
    reminderEvening: '18:00',
  },
};

const STORAGE_KEY = 'prarthna-admin-data-v1';

interface StoreValue {
  data: AdminData;
  ready: boolean;
  connected: boolean;
  toasts: Toast[];
  toast: (message: string, kind?: Toast['kind']) => void;
  update: (fn: (d: AdminData) => AdminData, auditAction?: { action: string; module: string }) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

let toastSeq = 0;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminData>(SEED);
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: Toast['kind'] = 'success') => {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData({ ...SEED, ...JSON.parse(raw) });
    } catch {
      /* corrupted storage — fall back to seed */
    }
    setReady(true);

    // Dynamic backend sync
    const syncBackend = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/v1/content/collections');
        if (res.ok) {
          const collectionsList = await res.json();
          if (Array.isArray(collectionsList)) {
            // Map backend structures directly to the Admin UI
            const mapped = collectionsList.map((c: any) => ({
              id: c.id,
              title: c.title,
              status: 'Published' as const,
              nodes: `${c._count?.nodes || 0} Chapters`,
              units: 'Syncing Verses',
              lang: 'Sanskrit & English'
            }));
            
            setData((prev) => ({
              ...prev,
              collections: mapped.length > 0 ? mapped : prev.collections
            }));
            setConnected(true);
            toast('Connected to NestJS API & synced PostgreSQL Collections!', 'success');
          }
        }
      } catch (err) {
        console.log('NestJS API not running or unreachable, falling back to LocalStorage mode.');
      }
    };
    syncBackend();
  }, [toast]);

  const persist = useRef((d: AdminData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    } catch {
      /* storage full/unavailable — state still works in-memory */
    }
  });

  const update = useCallback(
    (fn: (d: AdminData) => AdminData, auditAction?: { action: string; module: string }) => {
      setData((prev) => {
        let next = fn(prev);
        if (auditAction) {
          const now = new Date();
          const stamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
          next = {
            ...next,
            audit: [
              {
                id: `l${Date.now()}`,
                actor: 'Pankaj Kumar',
                email: 'pankaj.kumar@prarthna.com',
                action: auditAction.action,
                module: auditAction.module,
                date: stamp,
                ip: '192.168.1.42',
              },
              ...next.audit,
            ].slice(0, 50),
          };

          // Sync audit log to real DB
          fetch('http://localhost:3001/api/v1/audit/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entityName: auditAction.module,
              action: auditAction.action,
            }),
          }).catch(() => {});
        }
        persist.current(next);
        return next;
      });
    },
    [],
  );

  return (
    <StoreContext.Provider value={{ data, ready, connected, toasts, toast, update }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
