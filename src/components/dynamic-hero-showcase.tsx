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
  debt?: string;
  settledIn: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'chat',
    tabLabel: 'WhatsApp & Telegram',
    badge: 'WhatsApp · Telegram · In-App',
    inputType: 'Chat Message',
    iconType: 'chat',
    input: '"Sold 5 cartons of Indomie at ₦9,000 to Chief Okoye. He paid ₦30k transfer, ₦15k on Friday"',
    context: 'Natural text message parsed in real time',
    revenue: '₦45,000',
    profit: '+₦8,500',
    inventory: '-5 Cartons',
    debt: '₦15,000 balance recorded',
    settledIn: '36ms',
  },
  {
    id: 'shorthand',
    tabLabel: 'In-App Shorthand',
    badge: 'In-App Quick Entry',
    inputType: 'Counter Typing Shorthand',
    iconType: 'shorthand',
    input: '"Sold 3 paint red oil, spent 2k for diesel generator"',
    context: 'Fast typing shorthand for busy counters',
    revenue: '₦27,000',
    profit: '+₦6,200',
    inventory: '-3 Paint Drums',
    debt: '₦2,000 diesel logged to OpEx',
    settledIn: '28ms',
  },
  {
    id: 'voice',
    tabLabel: 'Voice Note (Option)',
    badge: 'Voice Memo Option · 0:05s',
    inputType: 'Hands-Free Voice Memo',
    iconType: 'voice',
    input: '"Chief bought 2 bags of rice ₦75k each, paid cash. Deduct from store inventory."',
    context: 'Optional audio memo when carrying goods or busy',
    revenue: '₦150,000',
    profit: '+₦24,000',
    inventory: '-2 Bags (50kg)',
    debt: 'Cash settled in drawer',
    settledIn: '42ms',
  },
];

export function DynamicHeroShowcase() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const active = SCENARIOS.find((s) => s.id === activeTab) || SCENARIOS[0];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Interactive Tabs with Generous Spacing */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-full bg-secondary/80 border border-border max-w-lg mx-auto mb-8 shadow-sm">
        {SCENARIOS.map((scenario) => {
          const isSelected = scenario.id === activeTab;
          return (
            <button
              key={scenario.id}
              onClick={() => setActiveTab(scenario.id)}
              className={cn(
                'flex-1 py-2 px-3 sm:px-4 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer text-center truncate',
                isSelected
                  ? 'bg-card text-primary font-semibold shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {scenario.tabLabel}
            </button>
          );
        })}
      </div>

      {/* Main Dynamic Showcase Card */}
      <div className="rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-10 text-left transition-all duration-300 hover:shadow-[0_20px_50px_rgba(30,42,107,0.08)]">
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
        <div className="my-8 p-5 sm:p-6 rounded-2xl bg-secondary/50 border border-border/80 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm mt-0.5">
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
          <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border/80 shadow-sm transition-transform hover:-translate-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Gross Revenue
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular text-primary mt-1.5">
              {active.revenue}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Recognized to ledger</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border/80 shadow-sm transition-transform hover:-translate-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              True Net Profit
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular text-success mt-1.5">
              {active.profit}
            </div>
            <div className="text-xs text-muted-foreground mt-1">After inventory deduction</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border/80 shadow-sm transition-transform hover:-translate-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Stock Deducted
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular text-foreground mt-1.5">
              {active.inventory}
            </div>
            <div className="text-xs text-muted-foreground mt-1">FIFO inventory updated</div>
          </div>
        </div>

        {/* Bottom Status / Debt line */}
        <div className="pt-6 border-t border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Check className="w-4 h-4 text-success" />
            <span>Double-entry balanced in {active.settledIn}</span>
          </div>
          {active.debt && (
            <div className="px-3 py-1 rounded-full bg-secondary text-foreground border border-border">
              {active.debt}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
