import { createClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Eye, Pencil } from 'lucide-react';

async function getReports() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from('reports')
    .select('id, title, status, created_at, updated_at, client_id')
    .order('updated_at', { ascending: false });

  // Get client names
  const reportsWithClients = await Promise.all(
    (reports || []).map(async (report) => {
      const { data: client } = await supabase
        .from('clients')
        .select('company_name')
        .eq('id', report.client_id)
        .single();

      return {
        ...report,
        client_name: client?.company_name || 'Unknown',
      };
    })
  );

  return reportsWithClients;
}

interface Report {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  client_id: string;
  client_name: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">
            View and manage all reports across clients
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <Card className="p-0 overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No reports yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Updated
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: Report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {report.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <a
                        href={`/admin/clients/${report.client_id}`}
                        className="text-brand-600 hover:text-brand-700 font-medium"
                      >
                        {report.client_name}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(report.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <a href={`/admin/reports/${report.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil size={16} />
                        </Button>
                      </a>
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
