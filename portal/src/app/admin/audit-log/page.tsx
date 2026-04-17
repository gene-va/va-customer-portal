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
    client_created: 'bg-va-green/10 text-va-green border-va-green/25',
    client_deleted: 'bg-va-red/10 text-va-red border-va-red/25',
    client_updated: 'bg-va-blue/10 text-va-blue border-va-blue/25',
    report_created: 'bg-va-green/10 text-va-green border-va-green/25',
    report_updated: 'bg-va-blue/10 text-va-blue border-va-blue/25',
    report_deleted: 'bg-va-red/10 text-va-red border-va-red/25',
  };

  const color = colors[action] || 'bg-va-surface-2 text-va-text-muted border-va-border';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-body font-bold border ${color}`}
    >
      {action.replace(/_/g, ' ')}
    </span>
  );
}

export default async function AuditLogPage() {
  const auditLog = await getAuditLog();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-va-text">Audit Log</h1>
        <p className="text-va-text-secondary font-body mt-2">
          Track all admin actions and changes (last 50 entries)
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        {auditLog.length === 0 ? (
          <div className="p-8 text-center font-body">
            <p className="text-va-text-muted">No audit log entries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="border-b border-va-border bg-va-surface-2">
                <tr className="text-left">
                  <th className="px-6 py-4 font-semibold text-va-text">Timestamp</th>
                  <th className="px-6 py-4 font-semibold text-va-text">Admin User</th>
                  <th className="px-6 py-4 font-semibold text-va-text">Action</th>
                  <th className="px-6 py-4 font-semibold text-va-text">Target</th>
                  <th className="px-6 py-4 font-semibold text-va-text">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry: AuditLogEntryWithEmail) => (
                  <tr
                    key={entry.id}
                    className="border-b border-va-border hover:bg-va-surface-2 transition-colors"
                  >
                    <td className="px-6 py-4 text-va-text-muted whitespace-nowrap">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="px-6 py-4 text-va-text-secondary">{entry.admin_email}</td>
                    <td className="px-6 py-4">
                      <ActionBadge action={entry.action_type} />
                    </td>
                    <td className="px-6 py-4 text-va-text-secondary">
                      {entry.target_table && entry.target_id ? (
                        <span className="font-mono text-xs bg-va-surface-2 border border-va-border px-2 py-1 rounded text-va-text-muted">
                          {entry.target_table}: {entry.target_id.substring(0, 8)}…
                        </span>
                      ) : (
                        <span className="text-va-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {entry.details && Object.keys(entry.details).length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-va-text-secondary hover:text-va-text font-medium">
                            Show details
                          </summary>
                          <pre className="mt-3 p-3 bg-va-surface-2 border border-va-border rounded-card text-xs overflow-auto max-h-32 text-va-text-secondary">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-va-text-muted">—</span>
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
