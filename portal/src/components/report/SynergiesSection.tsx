'use client';
import { Briefcase, Star } from 'lucide-react';
import { type ReportData } from '@/lib/schemas/report';

export function SynergiesSection({ synergies }: { synergies: ReportData['synergies'] }) {
  if (!synergies) return null;
  return (
    <div className="space-y-6">
      <div className="rounded-card border-l-4 border-va-navy bg-va-navy/5 p-5">
        <div className="flex items-start gap-3"><Star className="h-5 w-5 text-va-navy flex-shrink-0 mt-0.5" /><div><h3 className="font-heading text-lg font-semibold text-va-navy">{synergies.insight_title}</h3><p className="mt-2 text-sm font-body text-va-text-secondary leading-relaxed">{synergies.insight_body}</p></div></div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{synergies.cards.map((c, i) => (
        <div key={i} className="rounded-card border border-va-border bg-va-surface p-5 shadow-sm">
          <div className="flex items-start gap-3 mb-4"><Briefcase className="h-5 w-5 text-va-blue flex-shrink-0 mt-0.5" /><div><h4 className="font-heading font-semibold text-va-navy">{c.investor_name}</h4><p className="text-sm font-body font-semibold text-va-accent">{c.headline_stat}</p></div></div>
          <p className="text-sm font-body text-va-text-secondary mb-4">{c.summary}</p>
          <div className="rounded-card bg-va-surface-2 border border-va-border p-3 mb-4"><p className="text-xs font-body font-semibold text-va-text-muted uppercase tracking-wider mb-1">Track Record</p><p className="text-sm font-body text-va-text">{c.track_record}</p></div>
          {c.portfolio.length > 0 && <div><p className="text-xs font-body font-semibold text-va-text-muted uppercase tracking-wider mb-2">Key Investments</p>{c.portfolio.slice(0, 3).map((p, j) => <div key={j} className="text-sm font-body mb-1"><span className="font-medium text-va-text">{p.name}</span><span className="text-va-text-muted"> — {p.detail}</span></div>)}</div>}
        </div>
      ))}</div>
    </div>
  );
}
