'use client';

import { useState, useCallback } from 'react';
import { LayoutGrid, Table2 } from 'lucide-react';
import { type ReportData } from '@/lib/schemas/report';
import { cn } from '@/lib/utils';
import { SidebarNav, type NavSection } from './SidebarNav';
import { DashboardHero } from './DashboardHero';
import { CompanyBriefing } from './CompanyBriefing';
import { WarmLeadsBanner } from './WarmLeadsBanner';
import { InvestorCard } from './InvestorCard';
import { ComparisonTable } from './ComparisonTable';
import { SynergiesSection } from './SynergiesSection';
import { DecisionMakers } from './DecisionMakers';
import { FitAnalysis } from './FitAnalysis';
import { PitchSection } from './PitchSection';
import { StrategyTimeline } from './StrategyTimeline';

export function ReportRenderer({ data }: { data: ReportData }) {
  const [investorView, setInvestorView] = useState<'cards' | 'table'>('cards');
  const sections: NavSection[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'company', label: 'Company' },
    ...(data.warm_leads.length > 0 ? [{ id: 'warm-leads', label: 'Warm Leads', badge: data.warm_leads.length }] : []),
    { id: 'investors', label: 'Investors' },
    ...(data.synergies ? [{ id: 'synergies', label: 'Synergies' }] : []),
    { id: 'decision-makers', label: 'Key People' },
    { id: 'fit-analysis', label: 'Fit Analysis' },
    { id: 'pitches', label: 'Pitches' },
    { id: 'strategy', label: 'Strategy' },
  ];
  const scrollTo = useCallback((id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }, []);
  const sorted = [...data.investors].sort((a, b) => b.fit_score - a.fit_score);

  return (
    <div className="min-h-screen bg-va-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_12rem]">
          <main className="min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(3rem, 6vw, 5rem)' }}>
            <section id="overview" className="scroll-mt-20"><DashboardHero data={data} onScrollTo={scrollTo} /></section>
            <section id="company" className="scroll-mt-20"><SH title="Company Overview" /><CompanyBriefing company={data.company} /></section>
            {data.warm_leads.length > 0 && <section id="warm-leads" className="scroll-mt-20"><SH title="Warm Leads" sub="Contacts reachable through the VA network" /><WarmLeadsBanner warmLeads={data.warm_leads} decisionMakers={data.decision_makers} companyName={data.company.name} /></section>}

            <section id="investors" className="scroll-mt-20">
              <div className="flex items-center justify-between mb-6">
                <SH title={`Matched Investors (${data.investors.length})`} sub="Sorted by fit score — expand any card for details" noM />
                <div className="flex items-center gap-1 rounded-card border border-va-border bg-va-surface p-1 no-print">
                  {(['cards', 'table'] as const).map((v) => (
                    <button key={v} onClick={() => setInvestorView(v)} className={cn('flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-body font-medium transition-colors',
                      investorView === v ? 'bg-va-navy/10 text-va-navy' : 'text-va-text-muted hover:text-va-text'
                    )}>
                      {v === 'cards' ? <><LayoutGrid className="h-3.5 w-3.5" />Cards</> : <><Table2 className="h-3.5 w-3.5" />Compare</>}
                    </button>
                  ))}
                </div>
              </div>
              {investorView === 'cards' ? (
                <div className="space-y-4">{sorted.map(inv => <InvestorCard key={inv.name} investor={inv} connectedDecisionMakers={data.decision_makers.filter(dm => dm.investor_name === inv.name && dm.connected)} />)}</div>
              ) : <ComparisonTable investors={data.investors} decisionMakers={data.decision_makers} />}
            </section>

            {data.synergies && <section id="synergies" className="scroll-mt-20"><SH title="Portfolio Synergies" /><SynergiesSection synergies={data.synergies} /></section>}
            {data.decision_makers.length > 0 && <section id="decision-makers" className="scroll-mt-20"><SH title="Key Decision Makers" sub="The people you'll be meeting with" /><DecisionMakers decisionMakers={data.decision_makers} /></section>}
            <section id="fit-analysis" className="scroll-mt-20"><SH title="Investment Fit Analysis" sub="Why each investor is a match" /><FitAnalysis investors={data.investors} /></section>
            <section id="pitches" className="scroll-mt-20"><SH title="Tailored Pitches" sub="Customized talking points for each investor" /><PitchSection investors={data.investors} /></section>
            <section id="strategy" className="scroll-mt-20"><SH title="Engagement Strategy" sub="Your recommended outreach plan" /><StrategyTimeline strategy={data.strategy} /></section>

            {data.platform_capabilities && data.platform_capabilities.length > 0 && (
              <section className="scroll-mt-20 pb-12">
                <SH title="Platform Capabilities" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.platform_capabilities.map((cap, i) => (
                    <div key={i} className="rounded-card border border-va-border bg-va-surface p-5 shadow-sm">
                      <h3 className="font-heading text-base font-semibold text-va-navy mb-3">{cap.title}</h3>
                      <ul className="space-y-1.5">{cap.points.map((p, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm font-body text-va-text-secondary">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-va-blue flex-shrink-0" />{p}
                        </li>
                      ))}</ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
          <SidebarNav sections={sections} />
        </div>
      </div>
    </div>
  );
}

function SH({ title, sub, noM }: { title: string; sub?: string; noM?: boolean }) {
  return <div className={noM ? '' : 'mb-6'}><h2 className="font-heading text-2xl font-semibold text-va-navy">{title}</h2>{sub && <p className="mt-1 text-sm font-body text-va-text-muted">{sub}</p>}</div>;
}
