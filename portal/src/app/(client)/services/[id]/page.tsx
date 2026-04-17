import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { RequirementsView } from '@/components/client/RequirementsView';
import { isServiceType, SERVICES, type ServiceType } from '@/lib/services/registry';

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function ClientServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: clientData } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('user_id', user.id)
    .single();

  if (!clientData) redirect('/dashboard');

  const { data: cs } = await supabase
    .from('client_services')
    .select('*')
    .eq('id', id)
    .single();

  if (!cs || cs.client_id !== clientData.id || !cs.active) notFound();
  if (!isServiceType(cs.service_type)) notFound();

  const def = SERVICES[cs.service_type as ServiceType];

  const { data: campaigns } = await supabase
    .from('reports')
    .select('id, title, status, phase, campaign_type, event_name, updated_at, published_at')
    .eq('client_service_id', id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const list = campaigns ?? [];
  const eventCampaigns = list.filter((c) => c.campaign_type === 'event');
  const generalCampaigns = list.filter((c) => c.campaign_type !== 'event');

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-va-navy">{def.label}</h1>
        <p className="text-sm font-body text-va-text-secondary mt-1">{def.shortDescription}</p>
      </div>

      <RequirementsView
        data={(cs.requirements_data ?? {}) as Record<string, unknown>}
        updatedAt={cs.requirements_updated_at}
      />

      <div>
        <h2 className="font-heading text-xl font-semibold text-va-navy mb-4">Campaigns</h2>

        {list.length === 0 ? (
          <div className="rounded-card border border-va-border bg-va-surface p-6 shadow-sm">
            <p className="text-sm font-body text-va-text-muted italic">
              No published campaigns yet. Your VA team will share them here as they land.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {eventCampaigns.length > 0 && (
              <CampaignGroup label="Event campaigns" campaigns={eventCampaigns} />
            )}
            {generalCampaigns.length > 0 && (
              <CampaignGroup label="General campaigns" campaigns={generalCampaigns} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function CampaignGroup({
  label,
  campaigns,
}: {
  label: string;
  campaigns: {
    id: string;
    title: string;
    phase: 'review' | 'outreach';
    event_name: string | null;
    updated_at: string;
  }[];
}) {
  return (
    <div>
      <p className="text-xs font-body font-semibold uppercase tracking-wide text-va-text-muted mb-2">
        {label}
      </p>
      <div className="space-y-2">
        {campaigns.map((c) => (
          <Link
            key={c.id}
            href={`/report/${c.id}`}
            className="flex items-center justify-between gap-3 rounded-card border border-va-border bg-va-surface p-4 shadow-sm hover:shadow-md hover:border-va-navy/30 transition-all"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-base font-semibold text-va-navy">{c.title}</h3>
              <p className="text-xs font-body text-va-text-muted mt-0.5">
                {c.event_name ? `${c.event_name} · ` : ''}phase {c.phase} · updated{' '}
                {formatDate(c.updated_at)}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-va-text-muted shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
