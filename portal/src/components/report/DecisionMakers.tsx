'use client';
import { Users, User } from 'lucide-react';
import { type ReportData } from '@/lib/schemas/report';

export function DecisionMakers({ decisionMakers }: { decisionMakers: ReportData['decision_makers'] }) {
  const grouped = decisionMakers.reduce((a, dm) => { (a[dm.investor_name] ||= []).push(dm); return a; }, {} as Record<string, typeof decisionMakers>);
  return (
    <div className="space-y-6">{Object.entries(grouped).map(([name, ms]) => (
      <div key={name}>
        <h3 className="font-heading text-lg font-semibold text-va-navy mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-va-blue" />{name}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{ms.map((m, i) => (
          <div key={i} className="rounded-card border border-va-border bg-va-surface p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-va-navy/5 flex-shrink-0"><User className="h-5 w-5 text-va-navy" /></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-semibold text-va-navy">{m.name}</h4><p className="text-sm font-body text-va-text-muted">{m.title}</p>
                {m.connected && <div className="mt-2 flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-va-green" /><span className="text-xs font-body font-semibold text-va-green">Connected via {m.connected_via}</span></div>}
                <p className="mt-2 text-sm font-body text-va-text-secondary line-clamp-2">{m.bio}</p>
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    ))}</div>
  );
}
