'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import {
  type InvestorAnnotation,
  type ReportPhase,
} from '@/lib/schemas/report';

interface PhaseBannerProps {
  reportId: string;
  phase: ReportPhase;
  annotations: InvestorAnnotation[];
  totalCandidates: number;
  candidateNames: string[];
  candidateLabel?: string;
  onPhaseChange?: (next: ReportPhase) => void;
}

export function PhaseBanner({
  reportId,
  phase: initialPhase,
  annotations,
  totalCandidates,
  candidateNames,
  candidateLabel = 'investor',
  onPhaseChange,
}: PhaseBannerProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<ReportPhase>(initialPhase);
  const [finalizing, setFinalizing] = useState(false);

  const annotationByName = new Map(annotations.map((a) => [a.investor_name, a]));
  const pursueCount = annotations.filter((a) => a.status === 'pursue').length;
  const skipCount = annotations.filter((a) => a.status === 'skip').length;
  const knownCount = annotations.filter((a) => a.status === 'already_known').length;
  const unreviewedCount = candidateNames.filter((n) => !annotationByName.has(n)).length;

  const handleFinalize = async () => {
    const dropCount = skipCount + knownCount;
    const keepCount = totalCandidates - dropCount;
    const ok = window.confirm(
      `Finalize review?\n\nThis will:\n• Keep ${keepCount} ${candidateLabel}(s)\n• Drop ${dropCount} marked skip or already-known\n• Lock client annotations and switch the client view to outreach\n\nContinue?`
    );
    if (!ok) return;

    setFinalizing(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/finalize`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Finalize failed');
        return;
      }
      toast.success(`Finalized. ${body.kept_count} ${candidateLabel}(s) kept.`);
      setPhase('outreach');
      onPhaseChange?.('outreach');
      router.refresh();
    } catch {
      toast.error('Finalize failed');
    } finally {
      setFinalizing(false);
    }
  };

  if (phase === 'outreach') {
    return (
      <div className="rounded-card border border-va-green/30 bg-va-green-light p-4 shadow-sm flex items-center gap-3">
        <Lock className="h-4 w-4 text-va-green" />
        <p className="text-sm font-body text-va-navy">
          <span className="font-semibold">Outreach phase.</span> Annotations locked. Pipeline is live.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-va-amber/30 bg-va-amber/5 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-va-amber/20 px-3 py-1 text-xs font-body font-bold text-va-amber border border-va-amber/30">
              Review phase
            </span>
            <span className="text-xs font-body text-va-text-muted">
              Client is annotating {candidateLabel}s. Outreach starts once you finalize.
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <StatChip label="Pursue" value={pursueCount} tone="green" />
            <StatChip label="Already known" value={knownCount} tone="blue" />
            <StatChip label="Skip" value={skipCount} tone="red" />
            <StatChip label="Unreviewed" value={unreviewedCount} tone="muted" />
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleFinalize}
          loading={finalizing}
          disabled={finalizing}
          className="flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" /> Finalize → Outreach
        </Button>
      </div>

      {annotations.length > 0 && (
        <div className="mt-5 border-t border-va-amber/20 pt-4">
          <p className="text-xs font-body font-semibold uppercase tracking-wide text-va-text-muted mb-2">
            Client annotations
          </p>
          <div className="space-y-1.5">
            {candidateNames.map((name) => {
              const ann = annotationByName.get(name);
              return (
                <div
                  key={name}
                  className="flex items-start gap-3 text-sm font-body py-1.5 border-b border-va-border/30 last:border-b-0"
                >
                  <span className="font-semibold text-va-navy min-w-[10rem]">{name}</span>
                  {ann ? (
                    <>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                          ann.status === 'pursue'
                            ? 'bg-va-green/10 text-va-green'
                            : ann.status === 'already_known'
                              ? 'bg-va-blue/10 text-va-blue'
                              : 'bg-va-red/10 text-va-red'
                        }`}
                      >
                        {ann.status.replace('_', ' ')}
                      </span>
                      {ann.note && (
                        <span className="text-va-text-secondary italic flex-1 min-w-0 truncate">
                          {ann.note}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-va-text-muted italic">unreviewed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'green' | 'blue' | 'red' | 'muted';
}) {
  const cls =
    tone === 'green'
      ? 'bg-va-green/10 text-va-green border-va-green/20'
      : tone === 'blue'
        ? 'bg-va-blue/10 text-va-blue border-va-blue/20'
        : tone === 'red'
          ? 'bg-va-red/10 text-va-red border-va-red/20'
          : 'bg-va-surface-2 text-va-text-muted border-va-border';
  return (
    <div className={`rounded-card border px-3 py-2 ${cls}`}>
      <p className="text-xs font-body font-semibold">{label}</p>
      <p className="font-heading text-lg font-semibold mt-0.5">{value}</p>
    </div>
  );
}
