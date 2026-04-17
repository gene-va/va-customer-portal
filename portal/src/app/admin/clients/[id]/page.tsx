import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import ClientActions from '@/components/admin/ClientActions';
import { ServiceBlockCard } from '@/components/admin/ServiceBlockCard';
import { AddServiceBlockButton } from '@/components/admin/AddServiceBlockButton';
import { isServiceType, type ServiceType } from '@/lib/services/registry';

async function getClient(id: string) {
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (!client) notFound();

  const { data: clientServices } = await supabase
    .from('client_services')
    .select('*')
    .eq('client_id', id)
    .order('started_at', { ascending: true });

  const { data: reports } = await supabase
    .from('reports')
    .select('id, title, status, phase, campaign_type, event_name, updated_at, client_service_id')
    .eq('client_id', id)
    .order('updated_at', { ascending: false });

  return {
    client,
    clientServices: clientServices ?? [],
    reports: reports ?? [],
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { client, clientServices, reports } = await getClient(id);

  const existingServiceTypes: ServiceType[] = clientServices
    .map((cs) => cs.service_type)
    .filter(isServiceType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-va-navy">
            {client.company_name}
          </h1>
          <p className="text-va-text-muted mt-2 font-body text-sm">Client ID: {client.id}</p>
        </div>
        <ClientActions clientId={client.id} clientName={client.company_name} />
      </div>

      {/* Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-heading text-lg font-semibold text-va-navy mb-4">
            Client Information
          </h3>
          <dl className="space-y-4 font-body text-sm">
            <div>
              <dt className="text-va-text-muted">Company</dt>
              <dd className="mt-1 text-va-text">{client.company_name}</dd>
            </div>
            <div>
              <dt className="text-va-text-muted">Contact name</dt>
              <dd className="mt-1 text-va-text">{client.contact_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-va-text-muted">Contact email</dt>
              <dd className="mt-1 text-va-text">{client.contact_email || '—'}</dd>
            </div>
            <div>
              <dt className="text-va-text-muted">Created</dt>
              <dd className="mt-1 text-va-text">{formatDate(client.created_at)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="font-heading text-lg font-semibold text-va-navy mb-4">Status</h3>
          <div className="space-y-4 font-body text-sm">
            <div>
              <dt className="text-va-text-muted mb-2">Account status</dt>
              <dd className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    client.is_active ? 'bg-va-green' : 'bg-va-text-muted'
                  }`}
                />
                <span className="text-va-text font-medium">
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
          </div>
        </Card>
      </div>

      {/* Service blocks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-xl font-semibold text-va-navy">Service blocks</h3>
            <p className="text-sm font-body text-va-text-muted mt-0.5">
              Each block bundles its requirements and campaigns.
            </p>
          </div>
          <AddServiceBlockButton
            clientId={client.id}
            existingServiceTypes={existingServiceTypes}
          />
        </div>

        {clientServices.length === 0 ? (
          <Card>
            <p className="font-body text-sm text-va-text-muted text-center py-6">
              No service blocks subscribed yet. Click &ldquo;Subscribe to service block&rdquo; above to start.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {clientServices.map((cs) => {
              if (!isServiceType(cs.service_type)) return null;
              const campaigns = reports
                .filter((r) => r.client_service_id === cs.id)
                .map((r) => ({
                  id: r.id,
                  title: r.title,
                  status: r.status as 'draft' | 'published' | 'archived',
                  phase: (r.phase ?? 'review') as 'review' | 'outreach',
                  campaign_type: (r.campaign_type ?? 'general') as 'event' | 'general',
                  event_name: r.event_name ?? null,
                  updated_at: r.updated_at,
                }));
              return (
                <ServiceBlockCard
                  key={cs.id}
                  clientServiceId={cs.id}
                  clientId={client.id}
                  serviceType={cs.service_type}
                  active={cs.active}
                  isPrimary={cs.is_primary ?? false}
                  requirementsData={cs.requirements_data ?? {}}
                  requirementsUpdatedAt={cs.requirements_updated_at}
                  campaigns={campaigns}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
