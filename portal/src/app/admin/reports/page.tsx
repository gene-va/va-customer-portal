import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
  SERVICES,
  SERVICE_TYPE_VALUES,
  isServiceType,
  serviceLabel,
  type ServiceType,
} from '@/lib/services/registry';

interface SearchParams {
  service_type?: string;
  campaign_type?: string;
}

async function getReports(filters: {
  serviceType?: ServiceType;
  campaignType?: 'event' | 'general';
}) {
  const supabase = await createClient();

  let query = supabase
    .from('reports')
    .select(
      'id, title, status, phase, campaign_type, event_name, created_at, updated_at, client_id, client_service_id'
    )
    .order('updated_at', { ascending: false });

  if (filters.campaignType) {
    query = query.eq('campaign_type', filters.campaignType);
  }

  const { data: reports } = await query;
  const list = reports ?? [];

  // Join in client_service.service_type and client.company_name
  const serviceIds = Array.from(new Set(list.map((r) => r.client_service_id).filter(Boolean)));
  const clientIds = Array.from(new Set(list.map((r) => r.client_id)));

  const [{ data: services }, { data: clients }] = await Promise.all([
    serviceIds.length
      ? supabase
          .from('client_services')
          .select('id, service_type')
          .in('id', serviceIds as string[])
      : Promise.resolve({ data: [] }),
    clientIds.length
      ? supabase.from('clients').select('id, company_name').in('id', clientIds)
      : Promise.resolve({ data: [] }),
  ]);

  const serviceById = new Map((services ?? []).map((s: { id: string; service_type: string }) => [s.id, s.service_type]));
  const clientById = new Map((clients ?? []).map((c: { id: string; company_name: string }) => [c.id, c.company_name]));

  const enriched = list
    .map((r) => ({
      ...r,
      service_type: (r.client_service_id ? serviceById.get(r.client_service_id) : null) ?? null,
      client_name: clientById.get(r.client_id) ?? 'Unknown',
    }))
    .filter((r) => !filters.serviceType || r.service_type === filters.serviceType);

  return enriched;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: { status: 'draft' | 'published' | 'archived' }) {
  const cls = {
    draft: 'bg-va-amber/10 text-va-amber border-va-amber/20',
    published: 'bg-va-green/10 text-va-green border-va-green/20',
    archived: 'bg-va-surface-2 text-va-text-muted border-va-border',
  }[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-body font-bold border ${cls}`}
    >
      {status}
    </span>
  );
}

function FilterChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full border text-xs font-body font-semibold transition-colors ${
        active
          ? 'bg-va-navy text-white border-va-navy'
          : 'bg-va-surface border-va-border text-va-text-secondary hover:border-va-navy/40'
      }`}
    >
      {label}
    </Link>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const serviceType = isServiceType(sp.service_type) ? sp.service_type : undefined;
  const campaignType =
    sp.campaign_type === 'event' || sp.campaign_type === 'general' ? sp.campaign_type : undefined;

  const reports = await getReports({ serviceType, campaignType });

  const buildHref = (overrides: Partial<SearchParams>) => {
    const next: SearchParams = {
      service_type: sp.service_type,
      campaign_type: sp.campaign_type,
      ...overrides,
    };
    const qs = Object.entries(next)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
      .join('&');
    return qs ? `/admin/reports?${qs}` : '/admin/reports';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-va-navy">Campaigns</h1>
        <p className="text-va-text-muted mt-1 font-body text-sm">
          All campaigns across clients and service blocks.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-card border border-va-border bg-va-surface p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-body text-va-text-muted mr-1">Service block:</span>
          <FilterChip
            label="All"
            active={!serviceType}
            href={buildHref({ service_type: undefined })}
          />
          {SERVICE_TYPE_VALUES.map((t) => (
            <FilterChip
              key={t}
              label={SERVICES[t].label}
              active={serviceType === t}
              href={buildHref({ service_type: t })}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-body text-va-text-muted mr-1">Campaign type:</span>
          <FilterChip
            label="All"
            active={!campaignType}
            href={buildHref({ campaign_type: undefined })}
          />
          <FilterChip
            label="Event"
            active={campaignType === 'event'}
            href={buildHref({ campaign_type: 'event' })}
          />
          <FilterChip
            label="General"
            active={campaignType === 'general'}
            href={buildHref({ campaign_type: 'general' })}
          />
        </div>
      </div>

      {/* Reports table */}
      <Card className="p-0 overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-va-text-muted font-body text-sm">No campaigns match the filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="border-b border-va-border bg-va-surface-2">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-va-navy">Title</th>
                  <th className="px-4 py-3 font-semibold text-va-navy">Client</th>
                  <th className="px-4 py-3 font-semibold text-va-navy">Service</th>
                  <th className="px-4 py-3 font-semibold text-va-navy">Type</th>
                  <th className="px-4 py-3 font-semibold text-va-navy">Status</th>
                  <th className="px-4 py-3 font-semibold text-va-navy">Phase</th>
                  <th className="px-4 py-3 font-semibold text-va-navy">Updated</th>
                  <th className="px-4 py-3 font-semibold text-va-navy" />
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-va-border hover:bg-va-surface-2 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-va-navy">{r.title}</td>
                    <td className="px-4 py-3 text-va-text-secondary">
                      <Link
                        href={`/admin/clients/${r.client_id}`}
                        className="text-va-blue hover:underline"
                      >
                        {r.client_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-va-text-secondary">
                      {r.service_type && isServiceType(r.service_type)
                        ? serviceLabel(r.service_type)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-va-text-secondary">
                      {r.campaign_type === 'event'
                        ? `Event${r.event_name ? ': ' + r.event_name : ''}`
                        : 'General'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-va-text-secondary">{r.phase ?? '—'}</td>
                    <td className="px-4 py-3 text-va-text-muted">{formatDate(r.updated_at)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/reports/${r.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil size={16} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
