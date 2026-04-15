'use client';

import { BookOpen } from 'lucide-react';

export function StrategyNarrative({ narrative, vaLead }: { narrative: string; vaLead: string }) {
  const paragraphs = narrative.split('\n').filter(p => p.trim());

  return (
    <div className="rounded-card border border-va-border bg-va-surface p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-va-navy" />
        <h3 className="font-heading text-lg font-semibold text-va-navy">Fundraise Strategy</h3>
      </div>

      <div className="space-y-4">
        {paragraphs.map((para, i) => (
          <p key={i} className="font-body text-sm text-va-text-secondary leading-relaxed">{para}</p>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-va-border">
        <p className="text-xs font-body text-va-text-muted">
          VA Lead: <span className="font-semibold text-va-text-secondary">{vaLead}</span>
        </p>
      </div>
    </div>
  );
}
