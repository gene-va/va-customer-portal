'use client';

import { type ReportPhase } from '@/lib/schemas/report';
import { type ServiceType, serviceLabel } from '@/lib/services/registry';

interface Props {
  reportId: string;
  title: string;
  serviceType: ServiceType;
  eventName: string | null;
  campaignType: 'event' | 'general';
  phase: ReportPhase;
  data: Record<string, unknown>;
  generatedDate?: string;
}

export function GenericCampaignRenderer({
  title,
  serviceType,
  eventName,
  campaignType,
  phase,
  data,
  generatedDate,
}: Props) {
  return (
    <div className="min-h-screen bg-va-bg">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        <section className="rounded-card bg-va-hero p-8 text-white">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-body font-bold border border-white/20">
              {serviceLabel(serviceType)}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-body font-bold border border-white/20">
              {campaignType === 'event' ? `Event: ${eventName ?? '—'}` : 'General campaign'}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-body font-bold border border-white/20">
              Phase: {phase}
            </span>
          </div>
          <h1 className="font-heading text-3xl font-semibold sm:text-4xl leading-tight">{title}</h1>
          {generatedDate && (
            <p className="mt-3 font-body text-white/70">Generated {generatedDate}</p>
          )}
          <p className="mt-4 font-body text-white/90">
            A bespoke view for this service block hasn&apos;t been built yet. The raw data is shown
            below so you can still review it.
          </p>
        </section>

        <section className="rounded-card border border-va-border bg-va-surface p-6 shadow-sm">
          <h2 className="font-heading text-xl font-semibold text-va-navy mb-3">Data</h2>
          <pre className="text-xs font-mono text-va-text-secondary whitespace-pre-wrap bg-va-surface-2 p-4 rounded-card border border-va-border overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
