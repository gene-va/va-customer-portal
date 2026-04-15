import { createClient } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import { Users, FileText, CheckCircle, Activity } from 'lucide-react';

async function getAdminStats() {
  const supabase = await createClient();

  // Get total clients
  const { count: clientCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true });

  // Get total reports
  const { count: reportCount } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true });

  // Get published reports count
  const { count: publishedCount } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');

  // Get recent audit log activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: recentActivityCount } = await supabase
    .from('audit_log')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());

  return {
    clientCount: clientCount || 0,
    reportCount: reportCount || 0,
    publishedCount: publishedCount || 0,
    recentActivityCount: recentActivityCount || 0,
  };
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card className={`${colorClasses[color]} border-0`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </Card>
  );
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to Admin Portal
        </h1>
        <p className="text-gray-600">
          Manage clients and reports for the VA platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users size={32} />}
          label="Total Clients"
          value={stats.clientCount}
          color="blue"
        />
        <StatCard
          icon={<FileText size={32} />}
          label="Total Reports"
          value={stats.reportCount}
          color="purple"
        />
        <StatCard
          icon={<CheckCircle size={32} />}
          label="Published Reports"
          value={stats.publishedCount}
          color="green"
        />
        <StatCard
          icon={<Activity size={32} />}
          label="Recent Activity (7d)"
          value={stats.recentActivityCount}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <a
              href="/admin/clients/new"
              className="block px-4 py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium rounded-lg transition-colors"
            >
              + Create New Client
            </a>
            <a
              href="/admin/clients"
              className="block px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              View All Clients
            </a>
            <a
              href="/admin/audit-log"
              className="block px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-colors transition-colors"
            >
              View Audit Log
            </a>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Connection</span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium text-green-700">
                  Connected
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Authentication</span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium text-green-700">
                  Active
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium text-green-700">
                  Operational
                </span>
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
