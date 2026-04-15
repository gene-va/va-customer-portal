import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';

interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

interface AuditLogEntryWithEmail extends AuditLogEntry {
  admin_email: string;
}

async function getAuditLog() {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const { data: auditLog } = await supabase
    .from('audit_log')
    .select('id, admin_user_id, action_type, target_table, target_id, details, created_at')
    .order('created_at', { ascending: false })
    .limit(50) as { data: AuditLogEntry[] | null };

  // Get admin user emails
  const auditLogWithEmails = await Promise.all(
    (auditLog || []).map(async (entry: AuditLogEntry) => {
      try {
        const { data } = await serviceClient.auth.admin.getUserById(
          entry.admin_user_id
        );

        return {
          ...entry,
          admin_email: data.user?.email || 'Unknown',
        };
      } catch (error) {
        return {
          ...entry,
          admin_email: 'Unknown',
        };
      }
    })
  );

  return auditLogWithEmails;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    client_created: 'bg-green-100 text-green-800',
    client_deleted: 'bg-red-100 text-red-800',
    client_updated: 'bg-blue-100 text-blue-800',
    report_created: 'bg-green-100 text-green-800',
    report_updated: 'bg-blue-100 text-blue-800',
    report_deleted: 'bg-red-100 text-red-800',
  };

  const color = colors[action] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {action.replace(/_/g, ' ')}
    </span>
  );
}

export default async function AuditLogPage() {
  const auditLog = await getAuditLog();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600 mt-2">
          Track all admin actions and changes (last 50 entries)
        </p>
      </div>

      {/* Audit Log Table */}
      <Card className="p-0 overflow-hidden">
        {auditLog.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No audit log entries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Admin User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Target
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry: AuditLogEntryWithEmail) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {entry.admin_email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <ActionBadge action={entry.action_type} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {entry.target_table && entry.target_id ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {entry.target_table}:{' '}
                          {entry.target_id.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {entry.details && Object.keys(entry.details).length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-gray-600 hover:text-gray-900 font-medium">
                            Show details
                          </summary>
                          <pre className="mt-3 p-3 bg-gray-50 rounded-lg text-xs overflow-auto max-h-32 text-gray-700">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
