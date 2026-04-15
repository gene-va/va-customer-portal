'use client';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { type Investor } from '@/lib/schemas/report';
import { getFitLabel, normalizeScore, cn } from '@/lib/utils';

function fitCls(s: number) { const n = s > 1 ? s : s * 100; if (n >= 80) return 'bg-va-green-light text-va-green border-va-green/20'; if (n >= 65) return 'bg-va-navy/5 text-va-navy border-va-navy/15'; if (n >= 50) return 'bg-va-amber/10 text-va-amber border-va-amber/20'; return 'bg-va-surface-2 text-va-text-muted border-va-border'; }

export function FitAnalysis({ investors }: { investors: Investor[] }) {
  return (
    <div className="space-y-6">{[...investors].sort((a, b) => b.fit_score - a.fit_score).map(inv => { const s = normalizeScore(inv.fit_score); return (
      <div key={inv.name} className="rounded-card border border-va-border bg-va-surface shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-va-border flex items-center justify-between">
          <div><h3 className="font-heading text-lg font-semibold text-va-navy">{inv.name}</h3><p className="text-sm font-body text-va-text-muted">{inv.segment}</p></div>
          <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-body font-bold border', fitCls(inv.fit_score))}>{s}% — {getFitLabel(inv.fit_score)}</span>
        </div>
        <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div><p className="text-sm font-body font-semibold text-va-text mb-3">{inv.fit_analysis.headline}</p>
            <ul className="space-y-2">{inv.fit_analysis.points.map((p, i) => <li key={i} className="flex items-start gap-2.5"><CheckCircle2 className="h-4 w-4 text-va-green flex-shrink-0 mt-0.5" /><span className="text-sm font-body text-va-text-secondary">{p}</span></li>)}</ul>
          </div>
          <div className="rounded-card bg-va-navy/5 border border-va-navy/10 p-5 h-fit">
            <div className="flex items-start gap-3"><TrendingUp className="h-5 w-5 text-va-navy flex-shrink-0 mt-0.5" /><div><p className="font-heading font-semibold text-va-navy mb-1">Investment Capacity</p><p className="text-sm font-body text-va-text-secondary">{inv.fit_analysis.investment_capacity}</p></div></div>
          </div>
        </div>
      </div>); })}</div>
  );
}
