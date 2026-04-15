import { createClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Plus, Eye } from 'lucide-react';

async function getClients() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  // Get report counts for each client
  const clientsWithReports = await Promise.all(
    (clients || []).map(async (client) => {
      const { count } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', client.id);

      return {
        ...client,
        reportCount: count || 0,
      };
    })
  );

  return clientsWithReports;
}

interface Client {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: string;
  reportCount: number;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage client accounts and permissions
          </p>
        </div>
        <a href="/admin/clients/new">
          <Button variant="primary" size="lg" className="flex items-center gap-2">
            <Plus size={20} />
            New Client
          </Button>
        </a>
      </div>

      {/* Clients Table */}
      <Card className="p-0 overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No clients yet</p>
            <a href="/admin/clients/new" className="mt-4 inline-block">
              <Button variant="primary">Create First Client</Button>
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Company Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Contact Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Contact Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Reports
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client: Client) => (
                  <tr
                    key={client.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {client.company_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.contact_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.contact_email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge isActive={client.is_active} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.reportCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a href={`/admin/clients/${client.id}`}>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Eye size={16} />
                          View
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
