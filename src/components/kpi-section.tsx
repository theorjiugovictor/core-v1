'use client';

import { useState, useTransition, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';
import { getKpisAction, type KpiPeriod } from '@/lib/actions';
import { Activity, DollarSign, Package, TrendingDown, TrendingUp, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = { DollarSign, Package, TrendingUp, TrendingDown, Activity, Boxes };

const PERIODS: { label: string; value: KpiPeriod }[] = [
  { label: 'Today',     value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time',  value: 'all' },
];

interface KpiSectionProps {
  initialKpis: any[];
  initialPeriod?: KpiPeriod;
}

export function KpiSection({ initialKpis, initialPeriod = 'month' }: KpiSectionProps) {
  const [period, setPeriod] = useState<KpiPeriod>(initialPeriod);
  const [kpis, setKpis] = useState(initialKpis);
  const [isPending, startTransition] = useTransition();

  function changePeriod(next: KpiPeriod) {
    if (next === period) return;
    setPeriod(next);
    startTransition(async () => {
      const data = await getKpisAction(next);
      setKpis(data);
    });
  }

  return (
    <section className="space-y-4">
      {/* Period toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted/60 rounded-lg p-1">
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => changePeriod(value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                period === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {/* KPI grid */}
      <div className={cn(
        'grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200',
        isPending && 'opacity-50'
      )}>
        {kpis.map((kpi: any, index: number) => {
          const IconComponent = iconMap[kpi.iconName as keyof typeof iconMap] || Activity;
          return (
            <div key={kpi.title} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up">
              <KpiCard {...kpi} icon={IconComponent} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
