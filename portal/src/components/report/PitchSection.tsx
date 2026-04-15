'use client';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { type Investor } from '@/lib/schemas/report';
import { cn } from '@/lib/utils';

export function PitchSection({ investors }: { investors: Investor[] }) {
  return (
    <div className="space-y-6">{investors.map(inv => (
      <div key={inv.name} className={cn('rounded-card border border-va-border border-l-4 bg-va-surface p-6 shadow-sm', inv.segment_type === 'cns' ? 'border-l-va-blue' : 'border-l-va-navy')}>
        <div className="flex items-start gap-3 mb-4">
          <MessageSquare className="h-5 w-5 text-va-blue flex-shrink-0 mt-0.5" />
          <div><span className="inline-block px-2.5 py-0.5 rounded-full bg-va-navy/5 text-va-navy text-xs font-body font-bold border border-va-navy/10 mb-2">{inv.pitch.target_label}</span><p className="text-sm font-body text-va-text-secondary leading-relaxed">{inv.pitch.intro}</p></div>
        </div>
        <div className="ml-8 space-y-2">{inv.pitch.bullets.map((b, i) => <div key={i} className="flex items-start gap-2.5"><ChevronRight className="h-4 w-4 text-va-blue flex-shrink-0 mt-0.5" /><p className="text-sm font-body text-va-text-secondary">{b}</p></div>)}</div>
      </div>
    ))}</div>
  );
}
