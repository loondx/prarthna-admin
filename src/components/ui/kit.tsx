'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';

/* ------------------------------- Toasts -------------------------------- */

export function Toaster() {
  const { toasts } = useStore();
  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast-in flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold text-white shadow-lg ${
            t.kind === 'error'
              ? 'bg-red-600'
              : t.kind === 'info'
                ? 'bg-[#8C5A3C]'
                : 'bg-[#2D1E17]'
          }`}
        >
          <span>{t.kind === 'error' ? '⚠️' : '✅'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- Modal --------------------------------- */

export function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white border border-[#EFE6DD] shadow-2xl animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE6DD]">
          <h3 className="text-sm font-bold text-[#2D1E17]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#8C7E77] hover:text-[#2D1E17] transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------ Form bits ------------------------------- */

export const inputCls =
  'w-full bg-[#FAF6F0] border border-[#EFE6DD] rounded-lg p-2.5 text-xs text-[#2D1E17] focus:outline-none focus:border-[#8C5A3C] transition-colors';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#8C7E77] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function PrimaryBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={`bg-[#8C5A3C] hover:bg-[#764C32] active:scale-[0.98] text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all shadow-md disabled:opacity-50 ${className}`}
    />
  );
}

export function GhostBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={`bg-white border border-[#EFE6DD] hover:bg-[#FAF6F0] active:scale-[0.98] text-[#8C5A3C] font-semibold text-xs px-4 py-2 rounded-lg transition-all ${className}`}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s === 'published' || s === 'active' || s === 'sent'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : s === 'processing' || s === 'uploading'
        ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
        : 'bg-amber-50 text-amber-700 border-amber-200';
  return (
    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] border ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

/* -------------------------------- Charts -------------------------------- */

export function LineChart({
  points,
  height = 160,
  color = '#8C5A3C',
}: {
  points: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const w = 560;
  const h = height;
  const pad = 24;
  const max = Math.max(...points.map((p) => p.value), 1);
  const step = (w - pad * 2) / Math.max(points.length - 1, 1);
  const xy = points.map((p, i) => [pad + i * step, h - pad - (p.value / max) * (h - pad * 2)]);
  const path = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const area = `${path} L${xy[xy.length - 1][0]},${h - pad} L${pad},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Trend chart">
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={pad}
          x2={w - pad}
          y1={h - pad - f * (h - pad * 2)}
          y2={h - pad - f * (h - pad * 2)}
          stroke="#EFE6DD"
          strokeDasharray="4 4"
        />
      ))}
      <path d={area} fill="url(#lc-fill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {xy.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={color} strokeWidth="2" />
      ))}
      {points.map((p, i) => (
        <text
          key={i}
          x={pad + i * step}
          y={h - 6}
          textAnchor="middle"
          fontSize="9"
          fill="#8C7E77"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export function DonutChart({
  slices,
  size = 140,
}: {
  slices: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className="flex items-center gap-5">
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        aria-label="Category share"
      >
        {slices.map((s, i) => {
          const frac = s.value / total;
          const dash = `${frac * c} ${c}`;
          const offset = -acc * c;
          acc += frac;
          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="13"
              strokeDasharray={dash}
              strokeDashoffset={offset}
              transform="rotate(-90 50 50)"
            />
          );
        })}
        <text x="50" y="47" textAnchor="middle" fontSize="15" fontWeight="700" fill="#2D1E17">
          {total}
        </text>
        <text x="50" y="60" textAnchor="middle" fontSize="7" fill="#8C7E77">
          total
        </text>
      </svg>
      <div className="space-y-1.5">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs text-[#8C7E77]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-[#2D1E17] font-medium">{s.label}</span>
            <span>{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({
  points,
  height = 150,
  color = '#D99B26',
}: {
  points: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {points.map((p) => (
        <div key={p.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div
            className="w-full rounded-t-md transition-all hover:opacity-80"
            title={`${p.label}: ${p.value}`}
            style={{ height: `${(p.value / max) * 80}%`, background: color, minHeight: 3 }}
          />
          <span className="text-[9px] text-[#8C7E77]">{p.label}</span>
        </div>
      ))}
    </div>
  );
}
