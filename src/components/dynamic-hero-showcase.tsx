'use client';

import React, { useState } from 'react';
import { Mic, Check, MessageSquare, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
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
    <div className="w-full max-w-3xl mx-auto">
      {/* Interactive Tabs with Brand Handoff Styling */}
      <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-[0.625rem] bg-secondary/80 border border-border max-w-lg mx-auto mb-8 shadow-sm">
        {SCENARIOS.map((scenario) => {
          const isSelected = scenario.id === activeTab;
          return (
            <button
              key={scenario.id}
              onClick={() => setActiveTab(scenario.id)}
              className={cn(
                'flex-1 py-2 px-3 sm:px-4 rounded-[0.625rem] text-xs font-medium transition-all duration-200 cursor-pointer text-center truncate',
                isSelected
                  ? 'bg-card text-primary font-semibold shadow-sm border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {scenario.tabLabel}
            </button>
          );
        })}
      </div>

      {/* Main Dynamic Showcase Card with Floating Status Badge */}
      <div className="relative rounded-[0.625rem] border border-border bg-card shadow-xl p-6 sm:p-10 text-left transition-all duration-300">
        {/* Floating Live Micro-UI Status Badge */}
        {active.debtBadge && (
          <div className="absolute -top-3.5 right-6 sm:right-10 z-20">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider shadow-md border',
                active.debtBadge.type === 'paid' && 'bg-success/10 text-success border-success/30',
                active.debtBadge.type === 'partial' && 'bg-accent/20 text-accent-foreground border-accent/40',
                active.debtBadge.type === 'unpaid' && 'bg-destructive/10 text-destructive border-destructive/30'
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full animate-pulse',
                  active.debtBadge.type === 'paid' && 'bg-success',
                  active.debtBadge.type === 'partial' && 'bg-accent-foreground',
                  active.debtBadge.type === 'unpaid' && 'bg-destructive'
                )}
              />
              {active.debtBadge.label}
            </span>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-border/70">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span>{active.badge}</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {active.context}
          </span>
        </div>

        {/* Input Bubble */}
        <div className="my-8 p-5 sm:p-6 rounded-[0.625rem] bg-secondary/50 border border-border/80 flex items-start gap-4">
          <div className="w-10 h-10 rounded-[0.625rem] bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            {active.iconType === 'chat' && <MessageSquare className="w-5 h-5" />}
            {active.iconType === 'shorthand' && <Zap className="w-5 h-5" />}
            {active.iconType === 'voice' && <Mic className="w-5 h-5" />}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {active.inputType}
            </div>
            <p className="font-heading text-lg sm:text-2xl font-semibold text-foreground leading-snug tracking-tight">
              {active.input}
            </p>
          </div>
        </div>

        {/* Instant 3-Part Ledger Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          <div className="p-4 sm:p-5 rounded-[0.625rem] bg-background border border-border/80 shadow-sm transition-transform hover:-translate-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Gross Revenue
            </div>
            <div className="text-2xl sm:text-3xl font-bold tabular text-primary mt-1.5">
              {active.revenue}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Recognized to ledger</div>
          </div>

          <div className="p-4 sm:p-5 rounded-[0.625rem] bg-background border border-border/80 shadow-sm transition-transform hover:-translate-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              True Net Profit
            </div>
            <div className="text-2xl sm:text-3xl font-bold tabular text-success mt-1.5">
              {active.profit}
            </div>
            <div className="text-xs text-muted-foreground mt-1">After FIFO inventory cost</div>
          </div>

          <div className="p-4 sm:p-5 rounded-[0.625rem] bg-background border border-border/80 shadow-sm transition-transform hover:-translate-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Stock Deducted
            </div>
            <div className="text-2xl sm:text-3xl font-bold tabular text-foreground mt-1.5">
              {active.inventory}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Real-time inventory updated</div>
          </div>
        </div>

        {/* Bottom Status / Double Entry Line */}
        <div className="pt-6 border-t border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Check className="w-4 h-4 text-success" />
            <span>Double-entry ledger balanced in <span className="tabular font-bold text-foreground">{active.settledIn}</span></span>
          </div>
          <div className="px-3 py-1 rounded-[0.625rem] bg-secondary text-foreground border border-border text-[11px]">
            Strict FIFO Accounting • Zero Spreadsheets
          </div>
        </div>
      </div>
    </div>
  );
}
