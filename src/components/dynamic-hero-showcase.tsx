'use client';

import React, { useState } from 'react';
import { Mic, MessageSquare, Zap, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Scenario {
  id: string;
  tabLabel: string;
  badge: string;
  inputType: string;
  iconType: 'chat' | 'shorthand' | 'voice';
  input: string;
  context: string;
  revenue: string;
  profit: string;
  inventory: string;
  debtBadge?: {
    label: string;
    type: 'paid' | 'partial' | 'unpaid';
  };
  settledIn: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'chat',
    tabLabel: 'WhatsApp & Telegram',
    badge: 'WhatsApp · Telegram · Web',
    inputType: 'Chat Message',
    iconType: 'chat',
    input: '"Sold 5 cartons of Indomie at ₦9,000 to Chief Okoye. He paid ₦30k transfer, ₦15k on Friday"',
    context: 'Natural text message parsed in real time',
    revenue: '₦45,000',
    profit: '+₦8,500',
    inventory: '-5 Cartons',
    debtBadge: {
      label: '₦15,000 UNPAID BAL (Fri)',
      type: 'partial',
    },
    settledIn: '36ms',
  },
  {
    id: 'shorthand',
    tabLabel: 'Web Shorthand',
    badge: 'Web Quick Entry',
    inputType: 'Counter Typing Shorthand',
    iconType: 'shorthand',
    input: '"Sold 3 paint red oil, spent 2k for diesel generator"',
    context: 'Fast typing shorthand for busy counters',
    revenue: '₦27,000',
    profit: '+₦6,200',
    inventory: '-3 Paint Drums',
    debtBadge: {
      label: '₦2,000 OpEx Deducted',
      type: 'paid',
    },
    settledIn: '28ms',
  },
  {
    id: 'voice',
    tabLabel: 'Voice Note',
    badge: 'Voice Memo · 0:05s',
    inputType: 'Hands-Free Voice Memo',
    iconType: 'voice',
    input: '"Chief bought 2 bags of rice ₦75k each, paid cash. Deduct from store inventory."',
    context: 'Hands-free audio memo when carrying goods or busy',
    revenue: '₦150,000',
    profit: '+₦24,000',
    inventory: '-2 Bags (50kg)',
    debtBadge: {
      label: '₦150,000 FULLY PAID ✓',
      type: 'paid',
    },
    settledIn: '42ms',
  },
];

export function DynamicHeroShowcase() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const active = SCENARIOS.find((s) => s.id === activeTab) || SCENARIOS[0];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-center gap-1 p-1 bg-white border border-primary/15 max-w-lg mx-auto mb-5 rounded-md">
        {SCENARIOS.map((scenario) => {
          const isSelected = scenario.id === activeTab;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setActiveTab(scenario.id)}
              aria-pressed={isSelected}
              className={cn(
                'flex-1 min-w-0 py-2 px-1 sm:px-4 rounded text-[11px] sm:text-xs font-medium transition-colors cursor-pointer text-center',
                isSelected
                  ? 'bg-primary text-white font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {scenario.tabLabel}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-[1fr_1.1fr] overflow-hidden rounded-md border border-primary/20 bg-white shadow-[0_28px_75px_-40px_rgba(16,19,34,0.55)] text-left">
        <div className="bg-[#142821] text-white p-6 sm:p-9 flex flex-col justify-between min-h-[235px] md:min-h-[320px]">
          <div className="flex items-center justify-between gap-3 border-b border-white/20 pb-4 text-[11px] font-mono uppercase tracking-wide text-white/70">
            <span>{active.badge}</span>
            <span className="text-accent">01 / Input</span>
          </div>
          <div className="py-7">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded bg-accent text-accent-foreground">
              {active.iconType === 'chat' && <MessageSquare className="h-5 w-5" />}
              {active.iconType === 'shorthand' && <Zap className="h-5 w-5" />}
              {active.iconType === 'voice' && <Mic className="h-5 w-5" />}
            </div>
            <p className="font-heading text-lg sm:text-2xl font-semibold leading-snug">{active.input}</p>
          </div>
          <span className="text-xs font-mono text-white/60">{active.inputType}</span>
        </div>

        <div className="p-6 sm:p-9 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-primary/15 pb-4 text-[11px] font-mono uppercase tracking-wide text-primary/60">
            <span>CORE / The clear picture</span>
            <span className="text-success">02 / Result</span>
          </div>
          <div className="py-5 sm:py-7">
            <div className="flex items-end justify-between gap-3 border-b border-primary/10 py-3">
              <span className="text-sm text-muted-foreground">Sale recorded</span>
              <span className="font-heading font-semibold text-xl sm:text-2xl text-primary tabular">{active.revenue}</span>
            </div>
            <div className="flex items-end justify-between gap-3 border-b border-primary/10 py-3">
              <span className="text-sm text-muted-foreground">Stock updated</span>
              <span className="inline-flex items-center gap-1 font-semibold text-foreground text-sm sm:text-lg"><ArrowDownRight className="h-4 w-4 text-success" />{active.inventory}</span>
            </div>
            <div className="flex items-end justify-between gap-3 py-3">
              <span className="text-sm text-muted-foreground">Profit after stock cost</span>
              <span className="inline-flex items-center gap-1 font-heading font-semibold text-xl sm:text-2xl text-success tabular"><ArrowUpRight className="h-5 w-5" />{active.profit}</span>
            </div>
          </div>
          <div className="border-t border-primary/15 pt-4 text-xs font-mono text-primary/70">
            {active.debtBadge?.label || 'Sale added to your records'}
          </div>
        </div>
      </div>
    </div>
  );
}
