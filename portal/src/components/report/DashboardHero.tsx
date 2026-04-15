'use client';

import { Users, Zap, TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import { type ReportData } from '@/lib/schemas/report';
import { getFitLabel, normalizeScore } from '@/lib/utils';

interface DashboardHeroProps { data: ReportData; onScrollTo: (id: string) => void; }

export function DashboardHero({ data, onScrollTo }: DashboardHeroProps) {
  const score = normalizeScore(data.summary.avg_fit_score);
  const warmLeadCount = data.warm_leads.length;
  const topInvestors = [...data.investors].sort((a, b) => b.fit_score - a.fit_score).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero — dark navy banner like VA website */}
      <div className="rounded-card bg-va-hero p-8 text-white relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl leading-tight">
            We found {data.summary.total_investors} investor{data.summary.total_investors !== 1 ? 's' : ''} matched to {data.company.name}
          </h2>
          <p className="mt-4 font-body text-white/70 text-lg">
            {warmLeadCount > 0 && <span className="font-semibold text-va-accent">{warmLeadCount} warm intro{warmLeadCount !== 1 ? 's' : ''} ready</span>}
            {warmLeadCount > 0 && ' — '}Average fit score: {score}%
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Matched Investors" value={String(data.summary.total_investors)} accent />
        <StatCard icon={Zap} label="Warm Intros" value={String(data.summary.warm_leads)} green highlight={data.summary.warm_leads > 0} />
        <StatCard icon={TrendingUp} label="Avg Fit Score" value={`${score}%`} accent />
        <StatCard icon={MapPin} label="Geographic Match" value={data.summary.geographic_match} />
      </div>

      {/* Warm leads callout */}
      {warmLeadCount > 0 && (
        <div className="rounded-card border border-va-green/30 bg-va-green-light p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading text-xl font-semibold text-va-green">{warmLeadCount} warm intro{warmLeadCount !== 1 ? 's' : ''} available</h3>
              <p className="mt-1 text-sm font-body text-va-text-secondary">Connected through the VA network and ready for outreach.</p>
            </div>
            <button onClick={() => onScrollTo('warm-leads')} className="flex-shrink-0 rounded-card bg-va-green text-white px-5 py-2.5 text-sm font-body font-semibold hover:opacity-90 transition-opacity">View Warm Leads</button>
          </div>
        </div>
      )}

      {/* Top Investors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl font-semibold text-va-navy">Top Matched Investors</h3>
          <button onClick={() => onScrollTo('investors')} className="flex items-center gap-1 text-sm font-body font-medium text-va-blue hover:underline">
            See all {data.investors.length}<ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topInvestors.map((inv) => {
            const fitScore = normalizeScore(inv.fit_score);
            const warms = data.decision_makers.filter(dm => dm.investor_name === inv.name && dm.connected);
            return (
              <div key={inv.name} className="rounded-card border border-va-border bg-va-surface p-5 hover:shadow-md hover:border-va-navy/20 transition-all duration-300 cursor-pointer" onClick={() => onScrollTo('investors')}>
                <div className="flex items-center justify-between mb-3">
                  <FitBadge score={inv.fit_score} />
                  <span className="font-heading text-2xl font-semibold text-va-navy">{fitScore}%</span>
                </div>
                <h4 className="font-heading text-lg font-semibold text-va-navy">{inv.name}</h4>
                <p className="text-sm font-body text-va-text-muted mt-0.5">{inv.segment}</p>
                <div className="mt-3 flex items-center gap-3 text-sm font-body text-va-text-secondary">
                  <span>{inv.aum}</span><span className="text-va-border">|</span><span>{inv.location}</span>
                </div>
                {warms.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-va-green" />
                    <span className="text-xs font-body font-medium text-va-green">{warms.length} warm intro{warms.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, green, highlight }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent?: boolean; green?: boolean; highlight?: boolean;
}) {
  const txt = green ? 'text-va-green' : accent ? 'text-va-navy' : 'text-va-text-secondary';
  return (
    <div className={`rounded-card border border-va-border bg-va-surface p-5 shadow-sm ${highlight ? 'ring-1 ring-va-green/30' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-body font-medium text-va-text-muted">{label}</p>
          <p className={`mt-1 font-heading text-2xl font-semibold ${txt}`}>{value}</p>
        </div>
        <Icon className={`h-5 w-5 ${txt} opacity-40`} />
      </div>
    </div>
  );
}

function FitBadge({ score }: { score: number }) {
  const label = getFitLabel(score);
  const n = score > 1 ? score : score * 100;
  let cls = 'bg-va-surface-2 text-va-text-muted border-va-border';
  if (n >= 80) cls = 'bg-va-green-light text-va-green border-va-green/20';
  else if (n >= 65) cls = 'bg-va-navy/5 text-va-navy border-va-navy/15';
  else if (n >= 50) cls = 'bg-va-amber/10 text-va-amber border-va-amber/20';
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-body font-bold border ${cls}`}>{label}</span>;
}
