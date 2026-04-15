'use client';
import { Calendar, Circle, CheckCircle2, Clock } from 'lucide-react';
import { type ReportData } from '@/lib/schemas/report';
import { cn } from '@/lib/utils';

type S = 'not_started' | 'in_progress' | 'completed';
const C: Record<S, { l: string; cls: string; icon: React.ComponentType<{ className?: string }>; dot: string; line: string }> = {
  not_started: { l: 'Not Started', cls: 'bg-va-surface-2 text-va-text-muted border-va-border', icon: Circle, dot: 'bg-va-border', line: 'bg-va-border' },
  in_progress: { l: 'In Progress', cls: 'bg-va-amber/10 text-va-amber border-va-amber/20', icon: Clock, dot: 'bg-va-amber', line: 'bg-va-border' },
  completed: { l: 'Completed', cls: 'bg-va-green-light text-va-green border-va-green/20', icon: CheckCircle2, dot: 'bg-va-green', line: 'bg-va-green/30' },
};

export function StrategyTimeline({ strategy }: { strategy: ReportData['strategy'] }) {
  const sts: S[] = strategy.steps.map((_, i) => i === 0 ? 'in_progress' : 'not_started');
  const done = sts.filter(s => s === 'completed').length;
  return (
    <div className="space-y-6">
      <div className="rounded-card border border-va-border bg-va-surface p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-va-navy" /><h3 className="font-heading text-lg font-semibold text-va-navy">{strategy.title}</h3></div>
          <span className="text-sm font-body text-va-text-muted">{done}/{strategy.steps.length} steps</span>
        </div>
        <div className="w-full bg-va-surface-2 rounded-full h-2 overflow-hidden"><div className="h-full bg-va-navy rounded-full transition-all duration-500" style={{ width: `${strategy.steps.length > 0 ? (done / strategy.steps.length) * 100 : 0}%` }} /></div>
      </div>
      <div className="space-y-0">{strategy.steps.map((step, i) => {
        const s = sts[i]; const c = C[s]; const Ic = c.icon;
        return (
          <div key={i} className="relative flex gap-5 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={cn('h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm', c.dot)}><Ic className="h-4 w-4 text-white" /></div>
              {i < strategy.steps.length - 1 && <div className={cn('w-0.5 flex-1 mt-2', c.line)} />}
            </div>
            <div className={cn('flex-1 rounded-card border p-5 shadow-sm', s === 'in_progress' ? 'border-va-amber/20 bg-va-amber/5' : s === 'completed' ? 'border-va-green/20 bg-va-green-light' : 'border-va-border bg-va-surface')}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div><span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-body font-bold border mb-2', c.cls)}>{step.week}</span><h4 className="font-heading text-base font-semibold text-va-navy">{step.title}</h4></div>
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-body font-semibold border flex-shrink-0', c.cls)}><Ic className="h-3 w-3" />{c.l}</span>
              </div>
              <p className="text-sm font-body text-va-text-secondary leading-relaxed">{step.details}</p>
            </div>
          </div>);
      })}</div>
    </div>
  );
}
