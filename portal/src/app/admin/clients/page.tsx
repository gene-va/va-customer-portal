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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-body font-bold border ${
        isActive
          ? 'bg-va-green/10 text-va-green border-va-green/25'
          : 'bg-va-surface-2 text-va-text-muted border-va-border'
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
          <h1 className="font-heading text-3xl font-bold text-va-text">Clients</h1>
          <p className="text-va-text-secondary font-body mt-1">
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
          <div className="p-8 text-center font-body">
            <p className="text-va-text-secondary">No clients yet</p>
            <a href="/admin/clients/new" className="mt-4 inline-block">
              <Button variant="primary">Create First Client</Button>
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="border-b border-va-border bg-va-surface-2">
                <tr className="text-left">
                  <th className="px-6 py-4 font-semibold text-va-text">Company Name</th>
                  <th className="px-6 py-4 font-semibold text-va-text">Contact Name</th>
                  <th className="px-6 py-4 font-semibold text-va-text">Contact Email</th>
                  <th className="px-6 py-4 font-semibold text-va-text">Status</th>
                  <th className="px-6 py-4 font-semibold text-va-text">Reports</th>
                  <th className="px-6 py-4 font-semibold text-va-text">Created</th>
                  <th className="px-6 py-4 font-semibold text-va-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client: Client) => (
                  <tr
                    key={client.id}
                    className="border-b border-va-border hover:bg-va-surface-2 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-va-text">{client.company_name}</td>
                    <td className="px-6 py-4 text-va-text-secondary">{client.contact_name || '—'}</td>
                    <td className="px-6 py-4 text-va-text-secondary">{client.contact_email || '—'}</td>
                    <td className="px-6 py-4"><StatusBadge isActive={client.is_active} /></td>
                    <td className="px-6 py-4 text-va-text-secondary">{client.reportCount}</td>
                    <td className="px-6 py-4 text-va-text-muted">{formatDate(client.created_at)}</td>
                    <td className="px-6 py-4">
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
