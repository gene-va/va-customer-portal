'use client';
import { Building2 } from 'lucide-react';
import { type ReportData } from '@/lib/schemas/report';

export function CompanyBriefing({ company }: { company: ReportData['company'] }) {
  const details = [
    { label: 'Location', value: company.location }, { label: 'Lead Asset', value: company.lead_asset },
    { label: 'Indication', value: company.indication }, { label: 'FDA Status', value: company.fda_status },
    { label: 'Prior Clinical', value: company.prior_clinical }, { label: 'Target Raise', value: company.target_raise },
  ];
  return (
    <div className="rounded-card border border-va-border bg-va-surface p-6 shadow-sm">
      <div className="flex items-start gap-4 mb-5 pb-5 border-b border-va-border">
        <div className="flex h-12 w-12 items-center justify-center rounded-card bg-va-navy/5 flex-shrink-0"><Building2 className="h-6 w-6 text-va-navy" /></div>
        <div><h2 className="font-heading text-2xl font-semibold text-va-navy">{company.name}</h2><p className="mt-1 font-body text-base text-va-text-muted">{company.tagline}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">{details.map(d => <div key={d.label}><p className="text-xs font-body font-semibold text-va-text-muted uppercase tracking-wider">{d.label}</p><p className="text-sm font-body font-medium text-va-text mt-1">{d.value}</p></div>)}</div>
    </div>
  );
}
