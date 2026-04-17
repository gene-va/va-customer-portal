'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { X, MapPin, ChevronUp, ChevronDown, Check, UserCheck, XCircle, Undo2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DEFAULT_PROSPECT_WEIGHTS,
  PROSPECT_CATEGORY_META,
  type AnnotationStatus,
  type InvestorAnnotation,
  type Prospect,
  type ProspectResearchData,
  type ProspectScores,
  type ProspectTier,
  type ReportPhase,
} from '@/lib/schemas/report';
import { cn } from '@/lib/utils';

// --- Tier display config ---
const TIERS: { value: ProspectTier | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'hot_prospect', label: 'Hot' },
  { value: 'warm_prospect', label: 'Warm' },
  { value: 'nurture', label: 'Nurture' },
  { value: 'low_priority', label: 'Low' },
  { value: 'not_relevant', label: 'Not Relevant' },
];

const TIER_BADGE: Record<ProspectTier, string> = {
  hot_prospect: 'bg-va-green/10 text-va-green border-va-green/30',
  warm_prospect: 'bg-va-amber/10 text-va-amber border-va-amber/30',
  nurture: 'bg-va-blue/10 text-va-blue border-va-blue/30',
  low_priority: 'bg-va-surface-2 text-va-text-muted border-va-border',
  not_relevant: 'bg-va-red/10 text-va-red border-va-red/30',
};

const TIER_LABEL: Record<ProspectTier, string> = {
  hot_prospect: 'Hot',
  warm_prospect: 'Warm',
  nurture: 'Nurture',
  low_priority: 'Low',
  not_relevant: 'Not Relevant',
};

const CATEGORY_KEYS = [
  'cost_scale_fit',
  'program_fit',
  'manufacturing_infrastructure',
  'urgency_signals',
  'development_stage',
  'meeting_accessibility',
] as const;

const CATEGORY_BAR_COLOR: Record<(typeof CATEGORY_KEYS)[number], string> = {
  cost_scale_fit: 'bg-va-green',
  program_fit: 'bg-va-cyan',
  manufacturing_infrastructure: 'bg-va-purple',
  urgency_signals: 'bg-va-amber',
  development_stage: 'bg-va-blue',
  meeting_accessibility: 'bg-va-blue',
};

const TIER_BADGE_HTML: Record<ProspectTier, string> = {
  hot_prospect: 'bg-va-green/15 text-va-green',
  warm_prospect: 'bg-va-amber/15 text-va-amber',
  nurture: 'bg-va-blue/15 text-va-blue',
  low_priority: 'bg-va-surface-2 text-va-text-muted',
  not_relevant: 'bg-va-red/10 text-va-red',
};

type SortField = 'total_score' | 'company' | 'tier' | 'segment' | 'lead_stage' | 'company_type' | 'attendee_count';

const STATUS_OPTIONS: {
  value: AnnotationStatus;
  label: string;
  icon: typeof Check;
  activeCls: string;
}[] = [
  { value: 'pursue', label: 'Pursue', icon: Check, activeCls: 'bg-va-green text-white border-va-green' },
  { value: 'already_known', label: 'Already know', icon: UserCheck, activeCls: 'bg-va-blue text-white border-va-blue' },
  { value: 'skip', label: 'Skip', icon: XCircle, activeCls: 'bg-va-red text-white border-va-red' },
];

interface Props {
  reportId: string;
  data: ProspectResearchData;
  initialAnnotations: InvestorAnnotation[];
  phase: ReportPhase;
}

export function ProspectResearchRenderer({ reportId, data, initialAnnotations, phase }: Props) {
  const locked = phase === 'outreach';
  const weights: Required<ProspectScores> = {
    ...DEFAULT_PROSPECT_WEIGHTS,
    ...(data.weights ?? {}),
  };

  const [tierFilter, setTierFilter] = useState<ProspectTier | 'all'>('all');
  const [segmentFilter, setSegmentFilter] = useState<string | 'all'>('all');
  const [query, setQuery] = useState('');
  type StatusFilter = 'all' | 'unreviewed' | AnnotationStatus;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('total_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const annotationMap = useMemo(() => {
    const m = new Map<string, InvestorAnnotation>();
    for (const a of initialAnnotations) m.set(a.investor_name, a);
    return m;
  }, [initialAnnotations]);

  const [annotations, setAnnotations] = useState<Map<string, InvestorAnnotation>>(annotationMap);
  type BulkItem = { investor_name: string; status: AnnotationStatus | null; note: string | null };
  const [undoSnapshot, setUndoSnapshot] = useState<{ items: BulkItem[]; label: string } | null>(null);

  const segments = useMemo(() => {
    const set = new Set<string>();
    for (const p of data.prospects) if (p.segment) set.add(p.segment);
    return Array.from(set).sort();
  }, [data.prospects]);

  // Prospects that pass every filter EXCEPT tier — used for tier-count chips
  // so users see how many would show up if they switched tiers.
  const nonTierFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.prospects.filter((p) => {
      if (segmentFilter !== 'all' && p.segment !== segmentFilter) return false;
      if (q) {
        const hay = [p.company, ...(p.duplicate_names ?? [])].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== 'all') {
        const ann = annotations.get(p.company);
        if (statusFilter === 'unreviewed') {
          if (ann) return false;
        } else {
          if (ann?.status !== statusFilter) return false;
        }
      }
      return true;
    });
  }, [data.prospects, segmentFilter, query, statusFilter, annotations]);

  const filtered = useMemo(() => {
    const rows = nonTierFiltered.filter((p) => tierFilter === 'all' || p.tier === tierFilter);
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortField];
      const bv = (b as unknown as Record<string, unknown>)[sortField];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
    });
  }, [nonTierFiltered, tierFilter, sortField, sortDir]);

  const tierCountsTotal = useMemo(() => {
    const c: Record<ProspectTier, number> = {
      hot_prospect: 0,
      warm_prospect: 0,
      nurture: 0,
      low_priority: 0,
      not_relevant: 0,
    };
    for (const p of data.prospects) c[p.tier] = (c[p.tier] ?? 0) + 1;
    return c;
  }, [data.prospects]);

  const tierCountsFiltered = useMemo(() => {
    const c: Record<ProspectTier, number> = {
      hot_prospect: 0,
      warm_prospect: 0,
      nurture: 0,
      low_priority: 0,
      not_relevant: 0,
    };
    for (const p of nonTierFiltered) c[p.tier] = (c[p.tier] ?? 0) + 1;
    return c;
  }, [nonTierFiltered]);

  const selected = useMemo(
    () => data.prospects.find((p) => p.id === selectedId) ?? null,
    [selectedId, data.prospects]
  );

  // ESC closes drawer
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(f);
      setSortDir(f === 'company' || f === 'segment' ? 'asc' : 'desc');
    }
  };

  const saveAnnotation = async (
    company: string,
    status: AnnotationStatus,
    note: string | null
  ) => {
    if (locked) return;
    try {
      const res = await fetch(`/api/reports/${reportId}/annotations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investor_name: company, status, note }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const setStatus = (company: string, status: AnnotationStatus) => {
    const existing = annotations.get(company);
    if (existing?.status === status) {
      clearStatus(company);
      return;
    }
    const next: InvestorAnnotation = {
      investor_name: company,
      status,
      note: existing?.note ?? null,
      updated_at: new Date().toISOString(),
    };
    const nextMap = new Map(annotations);
    nextMap.set(company, next);
    setAnnotations(nextMap);
    saveAnnotation(company, status, next.note);
  };

  const noteTimers = useMemo(() => new Map<string, NodeJS.Timeout>(), []);
  const setNote = (company: string, note: string) => {
    const existing = annotations.get(company);
    if (!existing) return;
    const next: InvestorAnnotation = { ...existing, note, updated_at: new Date().toISOString() };
    const nextMap = new Map(annotations);
    nextMap.set(company, next);
    setAnnotations(nextMap);

    const prev = noteTimers.get(company);
    if (prev) clearTimeout(prev);
    noteTimers.set(
      company,
      setTimeout(() => saveAnnotation(company, next.status, note || null), 700)
    );
  };

  const reviewedCount = annotations.size;
  const totalCount = data.prospects.length;
  const unreviewedCount = totalCount - reviewedCount;

  const statusCounts = useMemo(() => {
    const c: Record<AnnotationStatus, number> = { pursue: 0, already_known: 0, skip: 0 };
    for (const a of annotations.values()) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [annotations]);

  const bulkApi = async (items: BulkItem[]) => {
    const res = await fetch(`/api/reports/${reportId}/annotations/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Bulk save failed');
    }
  };

  const applyBulk = async (targets: string[], nextStatus: AnnotationStatus | null, label: string) => {
    if (locked || targets.length === 0) return;
    const snapshot: BulkItem[] = targets.map((name) => {
      const prev = annotations.get(name);
      return { investor_name: name, status: prev?.status ?? null, note: prev?.note ?? null };
    });
    const items: BulkItem[] = targets.map((name) => ({
      investor_name: name,
      status: nextStatus,
      note: annotations.get(name)?.note ?? null,
    }));

    const optimistic = new Map(annotations);
    for (const it of items) {
      if (it.status === null) optimistic.delete(it.investor_name);
      else {
        optimistic.set(it.investor_name, {
          investor_name: it.investor_name,
          status: it.status,
          note: it.note,
          updated_at: new Date().toISOString(),
        });
      }
    }
    setAnnotations(optimistic);

    try {
      await bulkApi(items);
      setUndoSnapshot({ items: snapshot, label });
    } catch (err) {
      setAnnotations(annotations);
      toast.error(err instanceof Error ? err.message : 'Bulk save failed');
    }
  };

  const undoLast = async () => {
    if (!undoSnapshot) return;
    const snap = undoSnapshot;
    setUndoSnapshot(null);
    const optimistic = new Map(annotations);
    for (const it of snap.items) {
      if (it.status === null) optimistic.delete(it.investor_name);
      else {
        optimistic.set(it.investor_name, {
          investor_name: it.investor_name,
          status: it.status,
          note: it.note,
          updated_at: new Date().toISOString(),
        });
      }
    }
    setAnnotations(optimistic);
    try {
      await bulkApi(snap.items);
    } catch (err) {
      setAnnotations(annotations);
      toast.error(err instanceof Error ? err.message : 'Undo failed');
    }
  };

  // Auto-clear undo snapshot after 10s
  useEffect(() => {
    if (!undoSnapshot) return;
    const t = setTimeout(() => setUndoSnapshot(null), 10000);
    return () => clearTimeout(t);
  }, [undoSnapshot]);

  const pursueRemaining = () => {
    const unreviewed = data.prospects
      .filter((p) => !annotations.has(p.company))
      .map((p) => p.company);
    if (unreviewed.length === 0) return;
    if (unreviewed.length >= 20) {
      const ok = window.confirm(
        `Mark ${unreviewed.length} unreviewed prospects as Pursue? We'll reach out to all of them.`
      );
      if (!ok) return;
    }
    void applyBulk(unreviewed, 'pursue', `${unreviewed.length} prospects marked Pursue`);
  };

  const clearStatus = (company: string) => {
    void applyBulk([company], null, 'Annotation cleared');
  };

  return (
    <div className="min-h-screen bg-va-bg text-va-text">
      <div className="mx-auto max-w-[1600px] px-4 py-4">
        {/* Title + event tags */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center rounded-[10px] border border-va-accent/30 bg-va-accent/10 px-2 py-0.5 text-[10px] font-bold text-va-accent">
              {data.event.name}
            </span>
            {data.event.date && (
              <span className="inline-flex items-center rounded-[10px] border border-va-accent/30 bg-va-accent/10 px-2 py-0.5 text-[10px] font-bold text-va-accent">
                {data.event.date}
              </span>
            )}
            {locked && (
              <span className="inline-flex items-center rounded-[10px] border border-va-amber/40 bg-va-amber/10 px-2 py-0.5 text-[10px] font-bold text-va-amber">
                Outreach — locked
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-va-accent to-va-blue">
            {data.company.name} — prospect research
          </h1>
          {data.company.tagline && (
            <div className="text-xs text-va-text-secondary mt-1">{data.company.tagline}</div>
          )}
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap gap-3 my-4">
          <MiniStat label="Total" value={String(totalCount)} />
          <MiniStat label="Hot" value={String(tierCountsTotal.hot_prospect)} accent="green" />
          <MiniStat label="Warm" value={String(tierCountsTotal.warm_prospect)} accent="amber" />
          <MiniStat label="Nurture" value={String(tierCountsTotal.nurture)} accent="blue" />
          <MiniStat label="Reviewed" value={`${reviewedCount} / ${totalCount}`} />
          <MiniStat label="Pursue" value={String(statusCounts.pursue)} accent="green" />
          <MiniStat label="Already know" value={String(statusCounts.already_known)} accent="blue" />
          <MiniStat label="Skip" value={String(statusCounts.skip)} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center my-3">
          {TIERS.map((t) => {
            const active = tierFilter === t.value;
            const count =
              t.value === 'all' ? nonTierFiltered.length : tierCountsFiltered[t.value];
            return (
              <button
                key={t.value}
                onClick={() => setTierFilter(t.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-md border text-xs transition-colors',
                  active
                    ? 'bg-va-accent text-white border-va-accent'
                    : 'bg-va-surface border-va-border text-va-text-secondary hover:border-va-accent hover:text-va-text',
                  !active && count === 0 && 'opacity-50'
                )}
              >
                {t.label}
                <span
                  className={cn(
                    'ml-1.5 text-[10px] font-bold',
                    active ? 'text-white/80' : 'text-va-text-muted'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {segments.length > 0 && (
            <>
              <span className="text-va-text-muted px-1">|</span>
              {segments.map((s) => {
                const active = segmentFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSegmentFilter(active ? 'all' : s)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-md border text-xs transition-colors',
                      active
                        ? 'bg-va-accent text-white border-va-accent'
                        : 'bg-va-surface border-va-border text-va-text-secondary hover:border-va-accent hover:text-va-text'
                    )}
                  >
                    {fmtLabel(s)}
                  </button>
                );
              })}
            </>
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company..."
            className="ml-auto w-full sm:w-[260px] px-3.5 py-1.5 rounded-md border border-va-border bg-va-surface text-sm text-va-text placeholder:text-va-text-muted focus:border-va-accent focus:outline-none"
          />

          <span className="text-va-text-muted text-xs ml-1">{filtered.length} shown</span>
        </div>

        {!locked && (
          <div className="flex flex-wrap items-center gap-2 my-3">
            <span className="text-xs text-va-text-muted">Show:</span>
            {([
              { value: 'all', label: 'All' },
              { value: 'unreviewed', label: 'Unreviewed' },
              { value: 'pursue', label: 'Pursue' },
              { value: 'already_known', label: 'Already Know' },
              { value: 'skip', label: 'Skip' },
            ] as { value: StatusFilter; label: string }[]).map((s) => {
              const active = statusFilter === s.value;
              const count =
                s.value === 'all'
                  ? data.prospects.length
                  : s.value === 'unreviewed'
                    ? unreviewedCount
                    : statusCounts[s.value];
              return (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-md border text-xs transition-colors',
                    active
                      ? 'bg-va-accent/15 border-va-accent/40 text-va-accent font-semibold'
                      : 'bg-va-surface border-va-border text-va-text-secondary hover:border-va-accent',
                    !active && count === 0 && 'opacity-50'
                  )}
                >
                  {s.label}
                  <span
                    className={cn(
                      'ml-1.5 text-[10px] font-bold',
                      active ? 'text-va-accent/70' : 'text-va-text-muted'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {unreviewedCount > 0 && (
              <button
                onClick={pursueRemaining}
                className="ml-auto px-3 py-1 rounded-md border text-xs transition-colors inline-flex items-center gap-1.5 bg-va-green/10 text-va-green border-va-green/40 hover:bg-va-green/20"
              >
                <Check className="h-3.5 w-3.5" />
                Pursue remaining ({unreviewedCount})
              </button>
            )}
          </div>
        )}

        {/* Desktop table */}
        <div className="overflow-x-auto my-3 hidden md:block">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <Th label="#" />
                <Th label="Score" field="total_score" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Tier" field="tier" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Company" field="company" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Category Scores" />
                <Th label="Segment" field="segment" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Stage" field="lead_stage" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Att." field="attendee_count" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Location" />
                <Th label="Decision" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const ann = annotations.get(p.company);
                return (
                  <tr
                    key={String(p.id)}
                    onClick={() => setSelectedId(p.id)}
                    className="border-b border-va-border hover:bg-va-accent/5 cursor-pointer transition-colors"
                  >
                    <td className="px-2.5 py-2 text-va-text-muted align-top">{idx + 1}</td>
                    <td className="px-2.5 py-2 font-bold font-mono text-va-text align-top whitespace-nowrap">
                      {p.total_score.toFixed(3)}
                      {p.is_curated && (
                        <span className="ml-1 text-[9px] font-bold text-va-accent" title="Curated">
                          C
                        </span>
                      )}
                    </td>
                    <td className="px-2.5 py-2 align-top">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-[10px] text-[10px] font-bold uppercase whitespace-nowrap',
                          TIER_BADGE_HTML[p.tier]
                        )}
                      >
                        {p.tier.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td
                      className="px-2.5 py-2 font-semibold text-va-text align-top max-w-[250px] truncate"
                      title={p.company}
                    >
                      {p.company}
                      {(p.duplicate_count ?? 0) > 1 && (
                        <span
                          className="ml-1.5 inline-block text-[9px] bg-va-surface-2 text-va-text-muted px-1 py-0.5 rounded"
                          title={(p.duplicate_names ?? []).join(', ')}
                        >
                          {p.duplicate_count} merged
                        </span>
                      )}
                    </td>
                    <td className="px-2.5 py-2 align-top">
                      <MiniScoreBars scores={p.scores ?? {}} />
                    </td>
                    <td className="px-2.5 py-2 align-top">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[10px] text-[10px] bg-va-purple/15 text-va-purple whitespace-nowrap">
                        {fmtLabel(p.segment)}
                      </span>
                    </td>
                    <td
                      className="px-2.5 py-2 text-va-text-secondary align-top max-w-[150px] truncate"
                      title={p.lead_stage ?? ''}
                    >
                      {p.lead_stage ?? '-'}
                    </td>
                    <td className="px-2.5 py-2 text-va-cyan font-semibold align-top">
                      {p.attendee_count ?? 0}
                    </td>
                    <td
                      className="px-2.5 py-2 text-va-text-secondary align-top max-w-[200px] truncate"
                      title={p.location ?? ''}
                    >
                      {p.location ?? '-'}
                    </td>
                    <td className="px-2.5 py-2 align-top">
                      <InlineAnnotate
                        status={ann?.status ?? null}
                        locked={locked}
                        onSelect={(s) => setStatus(p.company, s)}
                      />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-va-text-muted italic">
                    No prospects match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <section className="md:hidden space-y-3">
          {filtered.map((p, idx) => {
            const ann = annotations.get(p.company);
            return (
              <ProspectCard
                key={String(p.id)}
                index={idx + 1}
                prospect={p}
                status={ann?.status ?? null}
                locked={locked}
                onOpen={() => setSelectedId(p.id)}
                onSelect={(s) => setStatus(p.company, s)}
              />
            );
          })}
          {filtered.length === 0 && (
            <div className="rounded-lg border border-va-border bg-va-surface p-6 text-center text-va-text-muted italic text-sm">
              No prospects match the current filters.
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="border-t border-va-border mt-8 pt-5 pb-4 text-center">
          <div className="text-[10px] text-va-accent font-medium">Njord MatchMaking Platform</div>
          <div className="text-[11px] text-va-text-muted mt-1">
            Prepared for {data.metadata.prepared_for} — {data.metadata.generated_date}
            {data.metadata.va_lead ? ` — ${data.metadata.va_lead}` : ''}
          </div>
        </div>
      </div>

      {/* Undo banner */}
      {undoSnapshot && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-card border border-va-border bg-va-navy text-white shadow-lg px-4 py-3">
          <span className="text-sm font-body font-semibold">{undoSnapshot.label}</span>
          <button
            onClick={() => void undoLast()}
            className="inline-flex items-center gap-1.5 rounded-card bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-body font-semibold transition-colors"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Undo
          </button>
          <button
            onClick={() => setUndoSnapshot(null)}
            className="text-white/70 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-va-navy/40 z-40"
            onClick={() => setSelectedId(null)}
          />
          <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-[640px] bg-va-surface z-50 shadow-2xl overflow-y-auto">
            <ProspectDetail
              prospect={selected}
              weights={weights}
              annotation={annotations.get(selected.company) ?? null}
              locked={locked}
              onClose={() => setSelectedId(null)}
              onStatus={(s) => setStatus(selected.company, s)}
              onNote={(n) => setNote(selected.company, n)}
            />
          </aside>
        </>
      )}
    </div>
  );
}

// --- Detail drawer ---

function ProspectDetail({
  prospect,
  weights,
  annotation,
  locked,
  onClose,
  onStatus,
  onNote,
}: {
  prospect: Prospect;
  weights: Required<ProspectScores>;
  annotation: InvestorAnnotation | null;
  locked: boolean;
  onClose: () => void;
  onStatus: (s: AnnotationStatus) => void;
  onNote: (n: string) => void;
}) {
  const p = prospect;
  const fundingStr =
    typeof p.funding === 'object' && p.funding !== null
      ? [p.funding.funding_type, p.funding.round, p.funding.amount, p.funding.total_raised]
          .filter(Boolean)
          .join(' | ')
      : typeof p.funding === 'string'
        ? p.funding
        : '-';

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-10 bg-va-surface border-b border-va-border px-6 py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold',
                TIER_BADGE[p.tier]
              )}
            >
              {TIER_LABEL[p.tier]}
            </span>
            <span className="font-heading text-lg font-bold text-va-navy">
              {p.total_score.toFixed(3)}
            </span>
            {p.is_curated && (
              <span className="inline-flex items-center rounded-full bg-va-blue/10 text-va-blue border border-va-blue/20 px-2 py-0.5 text-[10px] font-bold">
                Curated
              </span>
            )}
          </div>
          <h2 className="font-heading text-2xl font-semibold text-va-navy truncate">{p.company}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-body text-va-text-secondary">
            {p.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                {p.location}
              </span>
            )}
            {p.employee_count && <span>{p.employee_count} employees</span>}
            {p.public_private && <span>{fmtLabel(p.public_private)}</span>}
            {typeof p.attendee_count === 'number' && (
              <span>{p.attendee_count} attendees</span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-card border border-va-border hover:bg-va-surface-2"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-va-text-muted" />
        </button>
      </header>

      <ProspectDetailBody prospect={p} weights={weights} fundingStr={fundingStr} />

      {/* Annotation footer */}
      <footer className="sticky bottom-0 bg-va-surface border-t border-va-border px-6 py-4">
        {locked ? (
          <div className="text-xs font-body text-va-text-muted text-center">
            Annotations locked — this report is in outreach phase.
          </div>
        ) : (
          <>
            <p className="text-xs font-body font-semibold uppercase tracking-wide text-va-text-muted mb-2">
              Your call
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const active = annotation?.status === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onStatus(opt.value)}
                    className={cn(
                      'rounded-card border px-3 py-2 text-xs font-body font-semibold transition-all flex items-center justify-center gap-1.5',
                      active
                        ? opt.activeCls
                        : 'bg-va-surface border-va-border text-va-text-secondary hover:border-va-navy/40'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {annotation && (
              <textarea
                value={annotation.note ?? ''}
                onChange={(e) => onNote(e.target.value)}
                placeholder={
                  annotation.status === 'already_known'
                    ? 'Who do you know there?'
                    : annotation.status === 'skip'
                      ? "What's the reason?"
                      : 'Anything we should know?'
                }
                rows={2}
                className="mt-3 w-full px-3 py-2 border border-va-border rounded-card bg-va-surface text-va-text text-sm font-body focus:ring-2 focus:ring-va-navy/20 focus:border-va-navy"
              />
            )}
          </>
        )}
      </footer>
    </div>
  );
}

// --- Drawer body (tabs) ---

type DetailTab = 'overview' | 'evidence' | 'data';

function ProspectDetailBody({
  prospect,
  weights,
  fundingStr,
}: {
  prospect: Prospect;
  weights: Required<ProspectScores>;
  fundingStr: string;
}) {
  const p = prospect;
  const [tab, setTab] = useState<DetailTab>('overview');

  const evidenceCount =
    (p.rec_rationale ? 1 : 0) +
    (p.pf_rationale ? 1 : 0) +
    (p.mi_rationale ? 1 : 0) +
    (p.us_rationale ? 1 : 0) +
    (p.concerns?.length ? 1 : 0);
  const dataCount =
    (p.programs?.length ?? 0) +
    (p.attendees?.length ?? 0) +
    (p.known_cdmos?.length ?? 0) +
    (p.recommended_services?.length ?? 0);

  const tabs: { key: DetailTab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'evidence', label: 'Evidence', count: evidenceCount },
    { key: 'data', label: 'Data', count: dataCount },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <nav className="sticky top-[73px] z-[5] bg-va-surface border-b border-va-border px-6 flex gap-1">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'relative -mb-px px-3 py-2.5 text-xs font-body font-semibold transition-colors border-b-2',
                active
                  ? 'border-va-navy text-va-navy'
                  : 'border-transparent text-va-text-muted hover:text-va-navy'
              )}
            >
              {t.label}
              {typeof t.count === 'number' && t.count > 0 && (
                <span className="ml-1.5 text-[10px] text-va-text-muted">({t.count})</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 px-6 py-5 space-y-5">
        {tab === 'overview' && <OverviewTab prospect={p} weights={weights} fundingStr={fundingStr} />}
        {tab === 'evidence' && <EvidenceTab prospect={p} />}
        {tab === 'data' && <DataTab prospect={p} />}
      </div>
    </div>
  );
}

function OverviewTab({
  prospect,
  weights,
  fundingStr,
}: {
  prospect: Prospect;
  weights: Required<ProspectScores>;
  fundingStr: string;
}) {
  const p = prospect;
  const snapshot: { k: string; v: string }[] = [
    { k: 'Modality', v: p.modality ?? '' },
    { k: 'Lead stage', v: p.lead_stage ?? '' },
    { k: 'Company type', v: fmtLabel(p.company_type) },
    { k: 'Mfg model', v: fmtLabel(p.mfg_model) },
    { k: 'Funding', v: fundingStr || '' },
    { k: 'Seniority', v: fmtLabel(p.highest_seniority) },
  ].filter((row) => row.v && row.v !== '-');

  return (
    <>
      {(p.duplicate_count ?? 0) > 1 && (
        <div className="text-xs font-body text-va-text-muted bg-va-surface-2 px-3 py-2 rounded-card border border-va-border">
          Merged {p.duplicate_count} registrations
          {p.duplicate_names && p.duplicate_names.length > 0
            ? `: ${p.duplicate_names.join(', ')}`
            : ''}
        </div>
      )}

      <Section label="Score breakdown">
        <div className="space-y-2">
          {CATEGORY_KEYS.map((k) => {
            const raw = p.scores?.[k] ?? 0;
            const w = weights[k];
            const contrib = raw * w;
            const pct = Math.round((contrib / Math.max(p.total_score, 0.001)) * 100);
            const formula = `${raw.toFixed(2)} × ${w.toFixed(2)} = ${contrib.toFixed(3)}`;
            return (
              <div
                key={k}
                title={formula}
                className="cursor-help"
              >
                <div className="flex items-center justify-between text-xs font-body">
                  <span className="text-va-text-secondary">
                    {PROSPECT_CATEGORY_META[k].label}
                  </span>
                  <span className="font-semibold text-va-navy">{contrib.toFixed(3)}</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-va-surface-2 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full', CATEGORY_BAR_COLOR[k])}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-[10px] font-body text-va-text-muted pt-1">
            Hover any row to see <code className="font-mono">raw × weight = contribution</code>.
          </p>
        </div>
      </Section>

      {snapshot.length > 0 && (
        <Section label="Company snapshot">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-body">
            {snapshot.map((row) => (
              <Kv key={row.k} k={row.k} v={row.v} />
            ))}
          </div>
        </Section>
      )}

      {p.outreach_angle && (
        <Section label="Outreach angle">
          <RationaleBox text={p.outreach_angle} />
        </Section>
      )}

      {p.is_curated && p.curated_rationale && (
        <Section label="Why curated">
          <CuratedRationale
            text={p.curated_rationale}
            programmaticScore={p.programmatic_score}
          />
        </Section>
      )}
    </>
  );
}

function EvidenceTab({ prospect }: { prospect: Prospect }) {
  const p = prospect;
  const hasAny = p.rec_rationale || p.pf_rationale || p.mi_rationale || p.us_rationale || (p.concerns?.length ?? 0) > 0;
  if (!hasAny) {
    return (
      <p className="text-sm font-body text-va-text-muted italic">
        No evidence / rationales captured for this prospect.
      </p>
    );
  }
  return (
    <>
      {p.rec_rationale && (
        <Section label="Engagement rationale">
          <RationaleBox text={p.rec_rationale} />
        </Section>
      )}
      {p.pf_rationale && (
        <Section label="Program fit analysis">
          <RationaleBox text={p.pf_rationale} />
        </Section>
      )}
      {p.mi_rationale && (
        <Section label="Manufacturing infrastructure">
          <RationaleBox text={p.mi_rationale} />
        </Section>
      )}
      {p.us_rationale && (
        <Section label="Urgency analysis">
          <RationaleBox text={p.us_rationale} />
        </Section>
      )}
      {(p.concerns ?? []).length > 0 && (
        <Section label="Concerns">
          <div className="space-y-1">
            {p.concerns!.map((c, i) => (
              <div key={i} className="text-sm font-body text-va-text-secondary">
                • {c}
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

function DataTab({ prospect }: { prospect: Prospect }) {
  const p = prospect;
  const hasAny =
    (p.programs?.length ?? 0) > 0 ||
    (p.attendees?.length ?? 0) > 0 ||
    (p.known_cdmos?.length ?? 0) > 0 ||
    (p.recommended_services?.length ?? 0) > 0;
  if (!hasAny) {
    return (
      <p className="text-sm font-body text-va-text-muted italic">
        No structured data captured for this prospect.
      </p>
    );
  }
  return (
    <>
      {(p.programs ?? []).length > 0 && (
        <Section label={`Pipeline programs (${p.programs!.length})`}>
          <div className="space-y-1.5">
            {p.programs!.map((prog, i) => (
              <div key={i} className="text-sm font-body">
                <span className="font-semibold text-va-navy">{prog.name}</span>
                {prog.indication && (
                  <span className="text-va-text-secondary"> — {prog.indication}</span>
                )}
                {prog.stage && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-va-surface-2 text-va-text-muted px-2 py-0.5 text-[10px]">
                    {prog.stage}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {(p.attendees ?? []).length > 0 && (
        <Section label={`Attendees (${p.attendees!.length})`}>
          <div className="space-y-1">
            {p.attendees!.map((a, i) => (
              <div key={i} className="text-sm font-body">
                <span className="font-semibold text-va-navy">{a.name}</span>
                {a.title && <span className="text-va-text-secondary"> — {a.title}</span>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {(p.known_cdmos ?? []).length > 0 && (
        <Section label="Known CDMOs">
          <div className="text-sm font-body text-va-text-secondary">
            {p.known_cdmos!
              .map((c) => (typeof c === 'string' ? c : c.name ?? ''))
              .filter(Boolean)
              .join(', ')}
          </div>
        </Section>
      )}

      {(p.recommended_services ?? []).length > 0 && (
        <Section label="Recommended services">
          <ul className="list-disc pl-5 text-sm font-body text-va-text-secondary space-y-0.5">
            {p.recommended_services!.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

// --- Curated rationale parser ---

interface ParsedRationale {
  programmatic?: string;
  adjustments: string[];
  signals: string[];
  raw?: string;
}

function parseCuratedRationale(text: string): ParsedRationale {
  const progMatch = text.match(/Programmatic:\s*([^.]+?)\./i);
  const adjMatch = text.match(/Adjustments:\s*([^.]+?)\./i);
  const sigMatch = text.match(/Signals:\s*(.+?)\s*$/i);

  if (!progMatch && !adjMatch && !sigMatch) {
    return { adjustments: [], signals: [], raw: text };
  }

  return {
    programmatic: progMatch?.[1]?.trim(),
    adjustments: adjMatch
      ? adjMatch[1].split(/,\s*/).map((s) => s.trim()).filter(Boolean)
      : [],
    signals: sigMatch
      ? sigMatch[1].split(/;\s*/).map((s) => s.trim()).filter(Boolean)
      : [],
  };
}

function CuratedRationale({
  text,
  programmaticScore,
}: {
  text: string;
  programmaticScore?: number;
}) {
  const parsed = parseCuratedRationale(text);

  if (parsed.raw) {
    return (
      <>
        <p className="text-sm font-body text-va-text">{parsed.raw}</p>
        {typeof programmaticScore === 'number' && (
          <p className="text-[11px] font-body text-va-text-muted mt-1">
            Programmatic baseline: {programmaticScore.toFixed(3)}
          </p>
        )}
      </>
    );
  }

  return (
    <div className="space-y-3 text-sm font-body">
      {parsed.programmatic && (
        <div>
          <p className="text-[11px] font-body font-semibold uppercase tracking-wide text-va-text-muted mb-0.5">
            Programmatic
          </p>
          <p className="text-va-text">{parsed.programmatic}</p>
        </div>
      )}

      {parsed.adjustments.length > 0 && (
        <div>
          <p className="text-[11px] font-body font-semibold uppercase tracking-wide text-va-text-muted mb-1">
            Adjustments
          </p>
          <div className="flex flex-wrap gap-1.5">
            {parsed.adjustments.map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-va-blue/10 border border-va-blue/20 text-va-blue px-2 py-0.5 text-[11px] font-mono"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {parsed.signals.length > 0 && (
        <div>
          <p className="text-[11px] font-body font-semibold uppercase tracking-wide text-va-text-muted mb-1">
            Signals
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-va-text-secondary">
            {parsed.signals.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Small bits ---

function Th({
  label,
  field,
  sortField,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  field?: SortField;
  sortField?: SortField;
  sortDir?: 'asc' | 'desc';
  onSort?: (f: SortField) => void;
  className?: string;
}) {
  const active = field && sortField === field;
  return (
    <th
      onClick={() => field && onSort?.(field)}
      className={cn(
        'px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.5px] text-va-text-muted border-b border-va-border whitespace-nowrap',
        field && 'cursor-pointer hover:text-va-text select-none',
        active && 'text-va-accent',
        className
      )}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </span>
    </th>
  );
}

function MiniScoreBars({ scores }: { scores: ProspectScores }) {
  const maxW = 28;
  return (
    <div className="flex gap-0.5 items-center" title="Cost / Prog / Mfg / Urg / Stage / Meet">
      {CATEGORY_KEYS.map((k) => {
        const raw = scores[k] ?? 0;
        const width = Math.max(2, Math.round(raw * maxW));
        return (
          <span
            key={k}
            className={cn('h-3.5 rounded-[2px]', CATEGORY_BAR_COLOR[k])}
            style={{ width: `${width}px` }}
            title={`${PROSPECT_CATEGORY_META[k].short}: ${raw.toFixed(2)}`}
          />
        );
      })}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-body font-semibold uppercase tracking-wide text-va-text-muted mb-2">
        {label}
      </h3>
      {children}
    </section>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] text-va-text-muted">{k}</div>
      <div className="text-sm text-va-navy font-medium">{v}</div>
    </div>
  );
}

function RationaleBox({ text }: { text: string }) {
  return (
    <div className="text-sm font-body text-va-text bg-va-surface-2 border border-va-border rounded-card px-3 py-2 whitespace-pre-wrap">
      {text}
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
  accent?: 'green' | 'amber' | 'blue';
}) {
  const numColor =
    accent === 'green'
      ? 'text-va-green'
      : accent === 'amber'
        ? 'text-va-amber'
        : accent === 'blue'
          ? 'text-va-blue'
          : 'text-va-text';
  return (
    <div className="bg-va-surface border border-va-border rounded-lg px-3.5 py-2 text-xs">
      <div className={cn('text-xl font-bold leading-tight', numColor)}>{value}</div>
      <div className="text-va-text-muted">{label}</div>
    </div>
  );
}

function InlineAnnotate({
  status,
  locked,
  onSelect,
  size = 'sm',
}: {
  status: AnnotationStatus | null;
  locked: boolean;
  onSelect: (s: AnnotationStatus) => void;
  size?: 'sm' | 'md';
}) {
  if (locked) {
    if (!status) return <span className="text-[10px] text-va-text-muted italic">—</span>;
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold',
          status === 'pursue'
            ? 'bg-va-green/10 text-va-green'
            : status === 'already_known'
              ? 'bg-va-blue/10 text-va-blue'
              : 'bg-va-red/10 text-va-red'
        )}
      >
        {status.replace('_', ' ')}
      </span>
    );
  }

  const btnSize = size === 'md' ? 'px-3 py-2 text-sm' : 'p-1.5';
  const wrapCls = size === 'md' ? 'grid grid-cols-3 gap-1.5 w-full' : 'inline-flex items-center gap-1';
  return (
    <div className={wrapCls} onClick={(e) => e.stopPropagation()}>
      {STATUS_OPTIONS.map((opt) => {
        const active = status === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(opt.value);
            }}
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={active}
            className={cn(
              'rounded-card border transition-all flex items-center justify-center',
              btnSize,
              active
                ? opt.activeCls
                : 'bg-va-surface border-va-border text-va-text-muted hover:border-va-navy/40 hover:text-va-navy'
            )}
          >
            <Icon className={size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
            {size === 'md' && <span className="ml-1.5 text-xs font-semibold">{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ProspectCard({
  index,
  prospect,
  status,
  locked,
  onOpen,
  onSelect,
}: {
  index: number;
  prospect: Prospect;
  status: AnnotationStatus | null;
  locked: boolean;
  onOpen: () => void;
  onSelect: (s: AnnotationStatus) => void;
}) {
  const p = prospect;
  return (
    <div
      onClick={onOpen}
      className="rounded-lg border border-va-border bg-va-surface p-4 cursor-pointer active:bg-va-accent/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] text-va-text-muted">#{index}</span>
            <span
              className={cn(
                'inline-flex items-center rounded-[10px] px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap',
                TIER_BADGE_HTML[p.tier]
              )}
            >
              {p.tier.replace(/_/g, ' ')}
            </span>
            <span className="font-mono text-base font-bold text-va-text">
              {p.total_score.toFixed(3)}
            </span>
            {p.is_curated && (
              <span className="text-[9px] font-bold text-va-accent" title="Curated">C</span>
            )}
          </div>
          <h3 className="text-base font-semibold text-va-text truncate">
            {p.company}
            {(p.duplicate_count ?? 0) > 1 && (
              <span className="ml-1.5 text-[9px] text-va-text-muted bg-va-surface-2 px-1 py-0.5 rounded">
                {p.duplicate_count} merged
              </span>
            )}
          </h3>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-va-text-secondary">
            {p.segment && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-[10px] text-[10px] bg-va-purple/15 text-va-purple">
                {fmtLabel(p.segment)}
              </span>
            )}
            {p.lead_stage && <span>{p.lead_stage}</span>}
            {typeof p.attendee_count === 'number' && (
              <span className="text-va-cyan font-semibold">{p.attendee_count} att.</span>
            )}
            {p.location && <span className="truncate">{p.location}</span>}
          </div>
        </div>
        <div className="shrink-0">
          <MiniScoreBars scores={p.scores ?? {}} />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-va-border">
        <InlineAnnotate status={status} locked={locked} onSelect={onSelect} size="md" />
      </div>
    </div>
  );
}

function fmtLabel(v?: string | null) {
  if (!v) return '-';
  return v
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}
