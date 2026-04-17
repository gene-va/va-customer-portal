import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ReportEditor from '@/components/admin/ReportEditor';
import DealRoomEditor from '@/components/admin/DealRoomEditor';
import ProspectResearchAdminView from '@/components/admin/ProspectResearchAdminView';
import GenericCampaignAdminEditor from '@/components/admin/GenericCampaignAdminEditor';
import {
  isDealRoomData,
  isProspectResearchData,
  type DealRoomData,
  type ProspectResearchData,
} from '@/lib/schemas/report';
import { isServiceType, serviceLabel } from '@/lib/services/registry';

async function getReport(id: string) {
  const supabase = await createClient();

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (!report) notFound();

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('id', report.client_id)
    .single();

  const { data: clientService } = report.client_service_id
    ? await supabase
        .from('client_services')
        .select('id, service_type')
        .eq('id', report.client_service_id)
        .single()
    : { data: null };

  const { data: annotations } = await supabase
    .from('investor_annotations')
    .select('investor_name, status, note, updated_at')
    .eq('report_id', id);

  return { report, client, clientService, annotations: annotations ?? [] };
}

function StatusBadge({ status }: { status: 'draft' | 'published' | 'archived' }) {
  const colorClasses = {
    draft: 'bg-va-amber/10 text-va-amber border border-va-amber/20',
    published: 'bg-va-green-light text-va-green border border-va-green/20',
    archived: 'bg-va-surface-2 text-va-text-muted border border-va-border',
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-body font-medium ${colorClasses[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { report, client, clientService, annotations } = await getReport(id);

  const serviceType = clientService && isServiceType(clientService.service_type)
    ? clientService.service_type
    : null;

  const isV2 = isDealRoomData(report.report_data);
  const isV3 = isProspectResearchData(report.report_data);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {client && (
        <nav className="flex items-center gap-1.5 text-xs font-body text-va-text-muted">
          <Link href="/admin/clients" className="hover:text-va-navy">
            Clients
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/admin/clients/${client.id}`} className="hover:text-va-navy">
            {client.company_name}
          </Link>
          {serviceType && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{serviceLabel(serviceType)}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-va-navy font-semibold truncate">{report.title}</span>
        </nav>
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="font-heading text-3xl font-semibold text-va-navy">{report.title}</h1>
            <StatusBadge status={report.status} />
            {serviceType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-bold bg-va-navy/10 text-va-navy border border-va-navy/15">
                {serviceLabel(serviceType)}
              </span>
            )}
            {report.campaign_type === 'event' && report.event_name && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-bold bg-va-blue/10 text-va-blue border border-va-blue/20">
                {report.event_name}
              </span>
            )}
          </div>
          <p className="font-body text-va-text-secondary">
            Client: {client?.company_name || 'Unknown'}
          </p>
        </div>
      </div>

      {isV3 ? (
        <ProspectResearchAdminView
          reportId={report.id}
          initialData={report.report_data as ProspectResearchData}
          title={report.title}
          status={report.status}
          phase={report.phase ?? 'review'}
          annotations={annotations}
        />
      ) : isV2 ? (
        <DealRoomEditor
          reportId={report.id}
          initialData={report.report_data as DealRoomData}
          title={report.title}
          status={report.status}
          phase={report.phase ?? 'review'}
          annotations={annotations}
        />
      ) : serviceType ? (
        <GenericCampaignAdminEditor
          reportId={report.id}
          initialData={(report.report_data as Record<string, unknown>) ?? {}}
          title={report.title}
          status={report.status}
          phase={report.phase ?? 'review'}
          serviceType={serviceType}
          eventName={report.event_name ?? null}
          campaignType={(report.campaign_type ?? 'general') as 'event' | 'general'}
          annotations={annotations}
        />
      ) : (
        // Legacy V1 report without a mapped service
        <ReportEditor report={report} />
      )}
    </div>
  );
}
