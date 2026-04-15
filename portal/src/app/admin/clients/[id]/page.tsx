import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Pencil, Trash2, Upload } from 'lucide-react';
import ClientActions from '@/components/admin/ClientActions';

async function getClient(id: string) {
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (!client) {
    notFound();
  }

  // Get reports for this client
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('client_id', id)
    .order('updated_at', { ascending: false });

  return {
    client,
    reports: reports || [],
  };
}

interface Report {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { client, reports } = await getClient(id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {client.company_name}
          </h1>
          <p className="text-gray-600 mt-2">Client ID: {client.id}</p>
        </div>
        <ClientActions clientId={client.id} clientName={client.company_name} />
      </div>

      {/* Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Client Information
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">
                Company Name
              </dt>
              <dd className="mt-1 text-base text-gray-900">
                {client.company_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">
                Contact Name
              </dt>
              <dd className="mt-1 text-base text-gray-900">
                {client.contact_name || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">
                Contact Email
              </dt>
              <dd className="mt-1 text-base text-gray-900">
                {client.contact_email || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">
                Created On
              </dt>
              <dd className="mt-1 text-base text-gray-900">
                {formatDate(client.created_at)}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-600 mb-2">
                Account Status
              </dt>
              <dd className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    client.is_active ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                ></span>
                <span className="text-base font-medium text-gray-900">
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Toggle client account status
              </p>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                {client.is_active ? 'Deactivate' : 'Activate'} Account
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Reports Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Reports ({reports.length})
          </h3>
          <a href={`/admin/reports/new?client_id=${client.id}`}>
            <Button variant="primary" size="sm" className="flex items-center gap-2">
              <Upload size={16} />
              Upload Report
            </Button>
          </a>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No reports yet</p>
            <a href={`/admin/reports/new?client_id=${client.id}`} className="mt-4 inline-block">
              <Button variant="primary" size="sm">
                Upload First Report
              </Button>
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report: Report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={report.status} />
                    <span className="text-sm text-gray-600">
                      Updated {formatDate(report.updated_at)}
                    </span>
                  </div>
                </div>
                <a href={`/admin/reports/${report.id}`}>
                  <Button variant="ghost" size="sm">
                    <Pencil size={16} />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
