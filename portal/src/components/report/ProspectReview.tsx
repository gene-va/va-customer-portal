'use client';

import { useMemo, useRef, useState } from 'react';
import { MapPin, Check, UserCheck, XCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  type DealRoomData,
  type AnnotationStatus,
  type InvestorAnnotation,
} from '@/lib/schemas/report';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: {
  value: AnnotationStatus;
  label: string;
  helper: string;
  icon: typeof Check;
  activeCls: string;
}[] = [
  {
    value: 'pursue',
    label: 'Pursue',
    helper: 'Go ahead and reach out',
    icon: Check,
    activeCls: 'bg-va-green text-white border-va-green',
  },
  {
    value: 'already_known',
    label: 'Already know',
    helper: 'We have a relationship — share context in the note',
    icon: UserCheck,
    activeCls: 'bg-va-blue text-white border-va-blue',
  },
  {
    value: 'skip',
    label: 'Skip',
    helper: 'Not a fit — remove from outreach',
    icon: XCircle,
    activeCls: 'bg-va-red text-white border-va-red',
  },
];

interface Props {
  reportId: string;
  data: DealRoomData;
  initialAnnotations: InvestorAnnotation[];
}

export function ProspectReview({ reportId, data, initialAnnotations }: Props) {
  const initialMap = useMemo(() => {
    const m = new Map<string, InvestorAnnotation>();
    for (const a of initialAnnotations) m.set(a.investor_name, a);
    return m;
  }, [initialAnnotations]);

  const [annotations, setAnnotations] = useState<Map<string, InvestorAnnotation>>(initialMap);
  const noteDebounce = useRef<Record<string, NodeJS.Timeout>>({});

  const save = async (investor_name: string, status: AnnotationStatus, note: string | null) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/annotations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investor_name, status, note }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const setStatus = (investorName: string, status: AnnotationStatus) => {
    const existing = annotations.get(investorName);
    const next: InvestorAnnotation = {
      investor_name: investorName,
      status,
      note: existing?.note ?? null,
      updated_at: new Date().toISOString(),
    };
    const nextMap = new Map(annotations);
    nextMap.set(investorName, next);
    setAnnotations(nextMap);
    save(investorName, status, next.note);
  };

  const setNote = (investorName: string, note: string) => {
    const existing = annotations.get(investorName);
    if (!existing) return; // must pick a status first
    const next: InvestorAnnotation = { ...existing, note, updated_at: new Date().toISOString() };
    const nextMap = new Map(annotations);
    nextMap.set(investorName, next);
    setAnnotations(nextMap);

    if (noteDebounce.current[investorName]) clearTimeout(noteDebounce.current[investorName]);
    noteDebounce.current[investorName] = setTimeout(() => {
      save(investorName, next.status, note || null);
    }, 700);
  };

  const reviewedCount = annotations.size;
  const totalCount = data.investors.length;
  const pursueCount = Array.from(annotations.values()).filter((a) => a.status === 'pursue').length;
  const skipCount = Array.from(annotations.values()).filter((a) => a.status === 'skip').length;
  const knownCount = Array.from(annotations.values()).filter((a) => a.status === 'already_known').length;

  return (
    <div className="min-h-screen bg-va-bg">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="space-y-8">
          <section>
            <div className="rounded-card bg-va-hero p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-body font-bold border border-white/20">
                  Review phase
                </span>
                <h1 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl leading-tight">
                  {data.company.name} — prospect review
                </h1>
                <p className="mt-3 font-body text-white/80">
                  Go through each investor below and tell us what to do. Mark the ones you want us
                  to pursue, the ones you already know, and the ones to skip. Your notes help us
                  shape the outreach.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-4">
              <MiniStat label="Reviewed" value={`${reviewedCount} / ${totalCount}`} />
              <MiniStat label="Pursue" value={String(pursueCount)} accent="green" />
              <MiniStat label="Already known" value={String(knownCount)} accent="blue" />
              <MiniStat label="Skip" value={String(skipCount)} accent="red" />
            </div>
          </section>

          <section>
            <div className="mb-5">
              <h2 className="font-heading text-2xl font-semibold text-va-navy">Prospects</h2>
              <p className="mt-1 text-sm font-body text-va-text-muted">
                Once you&apos;re done, we&apos;ll finalize the list and move into outreach.
              </p>
            </div>

            <div className="space-y-4">
              {data.investors.map((investor) => {
                const ann = annotations.get(investor.name);
                const warm = investor.contacts.filter((c) => c.is_warm).length;
                return (
                  <div
                    key={investor.name}
                    className={cn(
                      'rounded-card border bg-va-surface shadow-sm p-6 transition-all',
                      ann ? 'border-va-border' : 'border-va-amber/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-xl font-semibold text-va-navy">{investor.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-body text-va-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-va-text-muted" />
                            {investor.location}
                          </span>
                          <span>{investor.aum}</span>
                          <span className="text-va-text-muted">{investor.segment}</span>
                        </div>
                        {warm > 0 && (
                          <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-body font-semibold text-va-green">
                            <Zap className="h-3.5 w-3.5" />
                            {warm} warm intro{warm !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-body text-va-text">{investor.why_they_fit}</p>
                      {investor.portfolio_proof && (
                        <p className="text-sm font-body text-va-text-secondary italic">
                          {investor.portfolio_proof}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 border-t border-va-border pt-4">
                      <p className="text-xs font-body font-semibold uppercase tracking-wide text-va-text-muted mb-2">
                        Your call
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {STATUS_OPTIONS.map((opt) => {
                          const active = ann?.status === opt.value;
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => setStatus(investor.name, opt.value)}
                              className={cn(
                                'rounded-card border px-3 py-2.5 text-sm font-body font-semibold transition-all flex items-center justify-center gap-2',
                                active
                                  ? opt.activeCls
                                  : 'bg-va-surface border-va-border text-va-text-secondary hover:border-va-navy/40'
                              )}
                              title={opt.helper}
                            >
                              <Icon className="h-4 w-4" />
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {ann && (
                        <div className="mt-3">
                          <label className="block text-xs font-body font-semibold uppercase tracking-wide text-va-text-muted mb-1.5">
                            Note (optional)
                          </label>
                          <textarea
                            value={ann.note ?? ''}
                            onChange={(e) => setNote(investor.name, e.target.value)}
                            placeholder={
                              ann.status === 'already_known'
                                ? 'Who do you know there? Any recent conversation?'
                                : ann.status === 'skip'
                                  ? "What's the reason? (helps us calibrate future lists)"
                                  : 'Anything we should know before reaching out?'
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-va-border rounded-card bg-va-surface text-va-text text-sm font-body focus:ring-2 focus:ring-va-navy/20 focus:border-va-navy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="rounded-card border border-va-border bg-va-surface-2 p-5 text-center">
            <p className="text-sm font-body text-va-text-secondary">
              {reviewedCount < totalCount
                ? `${totalCount - reviewedCount} prospect${totalCount - reviewedCount !== 1 ? 's' : ''} still to review.`
                : "You've reviewed every prospect. We'll take it from here — expect the outreach plan shortly."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'green' | 'blue' | 'red';
}) {
  const ring =
    accent === 'green'
      ? 'ring-1 ring-va-green/30'
      : accent === 'blue'
        ? 'ring-1 ring-va-blue/30'
        : accent === 'red'
          ? 'ring-1 ring-va-red/30'
          : '';
  return (
    <div className={cn('rounded-card border border-va-border bg-va-surface p-4 shadow-sm', ring)}>
      <p className="text-xs font-body text-va-text-muted">{label}</p>
      <p className="font-heading text-xl font-semibold text-va-navy mt-0.5">{value}</p>
    </div>
  );
}
