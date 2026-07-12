'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Field, PrimaryBtn, inputCls } from '@/components/ui/kit';

const SHLOKA_OPTIONS = [
  {
    reference: 'Bhagavad Gita — Chapter 2, Verse 47',
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    translation: 'You have a right to your actions alone, never to their fruits.',
  },
  {
    reference: 'Bhagavad Gita — Chapter 4, Verse 7',
    sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
    translation: 'Whenever righteousness wanes and unrighteousness increases, I send myself forth.',
  },
  {
    reference: 'Bhagavad Gita — Chapter 2, Verse 48',
    sanskrit: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥',
    translation: 'Perform your duty with equanimity, abandoning attachment to success or failure.',
  },
];

export default function DailyShlokaPage() {
  const { data, actions, toast } = useStore();
  const [date, setDate] = useState('2026-07-12');
  const [selected, setSelected] = useState(0);

  const schedule = async () => {
    const s = SHLOKA_OPTIONS[selected];
    await actions.saveShloka({
      date,
      reference: s.reference,
      sanskrit: s.sanskrit,
      translation: s.translation,
    });
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
        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#2D1E17]">Current Active Shloka</h2>
            <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live · {data.shloka.date}
            </span>
          </div>
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
        </div>

        <div className="bg-white border border-[#EFE6DD] rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-[#2D1E17] mb-4">Schedule Next Shloka</h2>
          <div className="space-y-4">
            <Field label="Scheduled date">
              <input
                type="date"
                className={inputCls}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Scripture unit">
              <select
                className={inputCls}
                value={selected}
                onChange={(e) => setSelected(Number(e.target.value))}
              >
                {SHLOKA_OPTIONS.map((s, i) => (
                  <option key={s.reference} value={i}>
                    {s.reference}
                  </option>
                ))}
              </select>
            </Field>
            <div className="p-4 rounded-xl bg-[#FAF6F0]/60 border border-[#EFE6DD] text-xs text-[#8C7E77]">
              <p className="whitespace-pre-line font-medium text-[#2D1E17] mb-2">
                {SHLOKA_OPTIONS[selected].sanskrit}
              </p>
              {SHLOKA_OPTIONS[selected].translation}
            </div>
            <PrimaryBtn className="w-full" onClick={schedule}>
              Schedule Daily Shloka
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
