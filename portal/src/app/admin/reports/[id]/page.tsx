import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import ReportEditor from '@/components/admin/ReportEditor';

async function getReport(id: string) {
  const supabase = await createClient();

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (!report) {
    notFound();
  }

  // Get client info
  const { data: client } = await supabase
    .from('clients')
    .select('company_name')
    .eq('id', report.client_id)
    .single();

  // Get previous versions
  const { data: versions } = await supabase
    .from('report_versions')
    .select('*')
    .eq('report_id', id)
    .order('created_at', { ascending: false });

  return {
    report,
    client,
    versions: versions || [],
  };
}

function StatusBadge({
  status,
}: {
  status: 'draft' | 'published' | 'archived';
}) {
  const colorClasses = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses[status]}`}
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
  const { report, client, versions } = await getReport(id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
            <StatusBadge status={report.status} />
          </div>
          <p className="text-gray-600">
            Client: {client?.company_name || 'Unknown'}
          </p>
        </div>
      </div>

      {/* Editor */}
      <ReportEditor report={report} />

      {/* Version History */}
      {versions.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Version History
          </h3>
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Version {versions.length - index}
                    </p>
                    <p className="text-sm text-gray-600">
                      Created{' '}
                      {new Date(version.created_at).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                  <button className="text-sm font-medium text-brand-600 hover:text-brand-700">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
