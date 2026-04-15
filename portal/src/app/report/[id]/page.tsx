import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReportRenderer } from '@/components/report/ReportRenderer';
import { DealRoomRenderer } from '@/components/dealroom/DealRoomRenderer';
import ReportHeader from '@/components/report/ReportHeader';
import { type ReportData, type DealRoomData, isDealRoomData } from '@/lib/schemas/report';

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('id, title, status, report_data, updated_at, client_id')
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

  const rawData = report.report_data;

  // V2 Deal Room
  if (isDealRoomData(rawData)) {
    const dealData = rawData as DealRoomData;
    return (
      <div className="min-h-screen bg-va-bg">
        <ReportHeader
          title={report.title}
          updatedAt={report.updated_at}
          generatedDate={dealData.metadata.generated_date}
        />
        <DealRoomRenderer data={dealData} />
      </div>
    );
  }

  // V1 original report
  const reportData = rawData as ReportData;
  return (
    <div className="min-h-screen bg-va-bg">
      <ReportHeader
        title={report.title}
        updatedAt={report.updated_at}
        generatedDate={reportData.metadata?.generated_date}
      />
      <div className="print:p-0">
        <ReportRenderer data={reportData} />
      </div>
    </div>
  );
}
