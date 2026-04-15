'use client';

import { useCallback, useRef } from 'react';
import { Target, Zap, Calendar, Users } from 'lucide-react';
import { type DealRoomData } from '@/lib/schemas/report';
import { ThisWeekActions } from './ThisWeekActions';
import { PipelineBoard } from './PipelineBoard';
import { DealInvestorCard } from './DealInvestorCard';
import { StrategyNarrative } from './StrategyNarrative';

export function DealRoomRenderer({ data }: { data: DealRoomData }) {
  const investorRefs = useRef<Record<string, string>>({});

  const scrollToInvestor = useCallback((name: string) => {
    const el = document.getElementById(`investor-${name.replace(/\s+/g, '-').toLowerCase()}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const warmIntroCount = data.investors.reduce((sum, inv) => sum + inv.contacts.filter(c => c.is_warm).length, 0);

  return (
    <div className="min-h-screen bg-va-bg">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="space-y-10">

          {/* --- Hero: The headline --- */}
          <section>
            <div className="rounded-card bg-va-hero p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-body font-bold border border-white/20">
                    {data.company.target_raise}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-body font-bold border border-white/20">
                    {data.company.stage}
                  </span>
                </div>
                <h1 className="font-heading text-3xl font-semibold sm:text-4xl leading-tight">
                  {data.company.name}
                </h1>
                <p className="mt-3 font-body text-white/60">{data.company.tagline} — {data.company.location}</p>
                <p className="mt-4 font-body text-lg text-white/90">{data.headline}</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-4">
              <MiniStat icon={Target} label="Investors" value={String(data.pipeline_summary.total)} />
              <MiniStat icon={Zap} label="Warm Intros" value={String(warmIntroCount)} highlight />
              <MiniStat icon={Calendar} label="Meetings Set" value={String(data.pipeline_summary.meetings_scheduled)} />
              <MiniStat icon={Users} label="In Diligence" value={String(data.pipeline_summary.in_diligence)} />
            </div>
          </section>

          {/* --- This Week: What you do Monday --- */}
          <section>
            <SH title="What To Do This Week" sub="Your prioritized action items — newest first" />
            <ThisWeekActions actions={data.weekly_actions} />
          </section>

          {/* --- Pipeline Board --- */}
          <section>
            <SH title="Deal Pipeline" sub="Click any investor to jump to their detail" />
            <PipelineBoard investors={data.investors} onSelect={scrollToInvestor} />
          </section>

          {/* --- Investor Detail Cards --- */}
          <section>
            <SH title="Investor Detail" sub="Expand for the full story, pitch angle, and contacts" />
            <div className="space-y-4">
              {data.investors.map((investor, i) => (
                <DealInvestorCard
                  key={investor.name}
                  investor={investor}
                  id={`investor-${investor.name.replace(/\s+/g, '-').toLowerCase()}`}
                  defaultExpanded={i === 0}
                />
              ))}
            </div>
          </section>

          {/* --- Strategy Narrative --- */}
          <section>
            <SH title="The Strategy" sub="How we sequence the fundraise" />
            <StrategyNarrative narrative={data.strategy_narrative} vaLead={data.metadata.va_lead} />
          </section>

          {/* Footer */}
          <div className="text-center pb-8">
            <p className="text-xs font-body text-va-text-muted">
              Prepared for {data.metadata.prepared_for} — {data.metadata.generated_date}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SH({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-heading text-2xl font-semibold text-va-navy">{title}</h2>
      <p className="mt-1 text-sm font-body text-va-text-muted">{sub}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, highlight }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-card border border-va-border bg-va-surface p-4 shadow-sm ${highlight ? 'ring-1 ring-va-green/30' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-body text-va-text-muted">{label}</p>
          <p className="font-heading text-xl font-semibold text-va-navy mt-0.5">{value}</p>
        </div>
        <Icon className="h-4 w-4 text-va-text-muted" />
      </div>
    </div>
  );
}
