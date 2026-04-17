import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ReportRenderer } from '@/components/report/ReportRenderer';
import { DealRoomRenderer } from '@/components/dealroom/DealRoomRenderer';
import { ProspectReview } from '@/components/report/ProspectReview';
import { ProspectResearchRenderer } from '@/components/prospects/ProspectResearchRenderer';
import { GenericCampaignRenderer } from '@/components/prospects/GenericCampaignRenderer';
import ReportHeader from '@/components/report/ReportHeader';
import {
  type ReportData,
  type DealRoomData,
  type InvestorAnnotation,
  type ProspectResearchData,
  isDealRoomData,
  isProspectResearchData,
} from '@/lib/schemas/report';
import { isServiceType, serviceLabel, type ServiceType } from '@/lib/services/registry';

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

function Breadcrumb({
  clientServiceId,
  serviceType,
  title,
}: {
  clientServiceId: string | null;
  serviceType: ServiceType | null;
  title: string;
}) {
  return (
    <nav className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 flex items-center gap-1.5 text-xs font-body text-va-text-muted">
      {serviceType && clientServiceId ? (
        <>
          <Link href={`/services/${clientServiceId}`} className="hover:text-va-navy">
            {serviceLabel(serviceType)}
          </Link>
          <ChevronRight className="h-3 w-3" />
        </>
      ) : null}
      <span className="text-va-navy font-semibold truncate">{title}</span>
    </nav>
  );
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select(
      'id, title, status, phase, campaign_type, event_name, report_data, updated_at, client_id, client_service_id'
    )
    .eq('id', id)
    .single();

  if (reportError || !report) notFound();
  if (report.status !== 'published') notFound();

  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!clientData || clientData.id !== report.client_id) redirect('/dashboard');

  const { data: clientService } = report.client_service_id
    ? await supabase
        .from('client_services')
        .select('id, service_type')
        .eq('id', report.client_service_id)
        .single()
    : { data: null };

  const serviceType =
    clientService && isServiceType(clientService.service_type) ? clientService.service_type : null;
  const clientServiceId = clientService?.id ?? null;

  const backHref = clientServiceId ? `/services/${clientServiceId}` : '/dashboard';
  const backLabel = serviceType ? serviceLabel(serviceType) : 'Back';

  const rawData = report.report_data;
  const phase = (report.phase ?? 'review') as 'review' | 'outreach';

  // V3 Prospect Research
  if (isProspectResearchData(rawData)) {
    const prospectData = rawData as ProspectResearchData;

    const { data: annotationsRaw } = await supabase
      .from('investor_annotations')
      .select('investor_name, status, note, updated_at')
      .eq('report_id', report.id);

    const annotations: InvestorAnnotation[] = (annotationsRaw ?? []).map((a) => ({
      investor_name: a.investor_name,
      status: a.status,
      note: a.note,
      updated_at: a.updated_at,
    }));

    return (
      <div className="min-h-screen bg-va-bg">
        <Breadcrumb clientServiceId={clientServiceId} serviceType={serviceType} title={report.title} />
        <ReportHeader
          title={report.title}
          updatedAt={report.updated_at}
          generatedDate={prospectData.metadata.generated_date}
          backHref={backHref}
          backLabel={backLabel}
        />
        <ProspectResearchRenderer
          reportId={report.id}
          data={prospectData}
          initialAnnotations={annotations}
          phase={phase}
        />
      </div>
    );
  }

  // V2 Deal Room
  if (isDealRoomData(rawData)) {
    const dealData = rawData as DealRoomData;

    if (phase === 'review') {
      const { data: annotationsRaw } = await supabase
        .from('investor_annotations')
        .select('investor_name, status, note, updated_at')
        .eq('report_id', report.id);

      const annotations: InvestorAnnotation[] = (annotationsRaw ?? []).map((a) => ({
        investor_name: a.investor_name,
        status: a.status,
        note: a.note,
        updated_at: a.updated_at,
      }));

      return (
        <div className="min-h-screen bg-va-bg">
          <Breadcrumb
            clientServiceId={clientServiceId}
            serviceType={serviceType}
            title={report.title}
          />
          <ReportHeader
            title={report.title}
            updatedAt={report.updated_at}
            generatedDate={dealData.metadata.generated_date}
            backHref={backHref}
            backLabel={backLabel}
          />
          <ProspectReview
            reportId={report.id}
            data={dealData}
            initialAnnotations={annotations}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-va-bg">
        <Breadcrumb clientServiceId={clientServiceId} serviceType={serviceType} title={report.title} />
        <ReportHeader
          title={report.title}
          updatedAt={report.updated_at}
          generatedDate={dealData.metadata.generated_date}
          backHref={backHref}
          backLabel={backLabel}
        />
        <DealRoomRenderer data={dealData} />
      </div>
    );
  }

  // Generic fallback for service blocks without a bespoke renderer
  if (serviceType && !isDealRoomData(rawData) && !isProspectResearchData(rawData)) {
    // Skip generic fallback if the data looks like a legacy V1 structured report
    const looksLikeV1 =
      typeof rawData === 'object' &&
      rawData !== null &&
      'investors' in (rawData as Record<string, unknown>);

    if (!looksLikeV1) {
      return (
        <div className="min-h-screen bg-va-bg">
          <Breadcrumb
            clientServiceId={clientServiceId}
            serviceType={serviceType}
            title={report.title}
          />
          <GenericCampaignRenderer
            reportId={report.id}
            title={report.title}
            serviceType={serviceType}
            eventName={report.event_name ?? null}
            campaignType={(report.campaign_type ?? 'general') as 'event' | 'general'}
            phase={phase}
            data={(rawData as Record<string, unknown>) ?? {}}
          />
        </div>
      );
    }
  }

  // V1 legacy report
  const reportData = rawData as ReportData;
  return (
    <div className="min-h-screen bg-va-bg">
      <Breadcrumb clientServiceId={clientServiceId} serviceType={serviceType} title={report.title} />
      <ReportHeader
        title={report.title}
        updatedAt={report.updated_at}
        generatedDate={reportData.metadata?.generated_date}
        backHref={backHref}
        backLabel={backLabel}
      />
      <div className="print:p-0">
        <ReportRenderer data={reportData} />
      </div>
    </div>
  );
}
