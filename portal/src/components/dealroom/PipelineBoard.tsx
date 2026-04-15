'use client';

import { type DealInvestor, type PipelineStage } from '@/lib/schemas/report';
import { cn } from '@/lib/utils';

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'identified', label: 'Identified', color: 'bg-va-surface-3' },
  { key: 'intro_requested', label: 'Intro Requested', color: 'bg-va-amber/20' },
  { key: 'intro_made', label: 'Intro Made', color: 'bg-va-blue/10' },
  { key: 'meeting_scheduled', label: 'Meeting Set', color: 'bg-va-green-light' },
  { key: 'in_diligence', label: 'In Diligence', color: 'bg-va-navy/10' },
  { key: 'term_sheet', label: 'Term Sheet', color: 'bg-va-green/20' },
];

export function PipelineBoard({ investors, onSelect }: { investors: DealInvestor[]; onSelect: (name: string) => void }) {
  return (
    <div className="rounded-card border border-va-border bg-va-surface p-5 shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-va-navy mb-5">Deal Pipeline</h3>

      {/* Pipeline track */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-va-surface-3 rounded-full" />

        <div className="relative flex justify-between">
          {STAGES.map((stage) => {
            const inv = investors.filter(i => i.pipeline_stage === stage.key);
            const hasInvestors = inv.length > 0;

            return (
              <div key={stage.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                {/* Dot */}
                <div className={cn(
                  'relative z-10 h-10 w-10 rounded-full flex items-center justify-center border-2 border-va-surface font-body text-xs font-bold transition-all',
                  hasInvestors ? `${stage.color} text-va-navy shadow-sm` : 'bg-va-surface-2 text-va-text-muted'
                )}>
                  {inv.length > 0 ? inv.length : ''}
                </div>

                {/* Label */}
                <span className={cn(
                  'mt-2 text-xs font-body text-center',
                  hasInvestors ? 'font-semibold text-va-navy' : 'text-va-text-muted'
                )}>
                  {stage.label}
                </span>

                {/* Investor chips */}
                <div className="mt-2 space-y-1 min-h-[2rem]">
                  {inv.map(investor => (
                    <button
                      key={investor.name}
                      onClick={() => onSelect(investor.name)}
                      className="block w-full rounded-card bg-va-surface border border-va-border px-2.5 py-1.5 text-xs font-body font-medium text-va-navy hover:border-va-navy/30 hover:shadow-sm transition-all text-center whitespace-nowrap"
                    >
                      {investor.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
