import { createClient } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import { Users, FileText, CheckCircle, Activity } from 'lucide-react';

async function getAdminStats() {
  const supabase = await createClient();

  const { count: clientCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true });

  const { count: reportCount } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true });

  const { count: publishedCount } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');

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
  tone: 'cyan' | 'blue' | 'green' | 'amber';
}

function StatCard({ icon, label, value, tone }: StatCardProps) {
  const toneClasses = {
    cyan: 'border-va-accent/25 shadow-va-glow',
    blue: 'border-va-blue/25',
    green: 'border-va-green/25',
    amber: 'border-va-amber/25',
  }[tone];
  const iconTone = {
    cyan: 'text-va-accent',
    blue: 'text-va-blue',
    green: 'text-va-green',
    amber: 'text-va-amber',
  }[tone];

  return (
    <Card className={`${toneClasses}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-body font-semibold uppercase tracking-wider text-va-text-muted mb-1">
            {label}
          </p>
          <p className="font-heading text-3xl font-bold text-va-text">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`${iconTone} opacity-70`}>{icon}</div>
      </div>
    </Card>
  );
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-va-text mb-2">
          Welcome to the Admin Portal
        </h1>
        <p className="text-va-text-secondary font-body">
          Manage clients, service blocks, and campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={32} />} label="Total Clients" value={stats.clientCount} tone="cyan" />
        <StatCard icon={<FileText size={32} />} label="Total Reports" value={stats.reportCount} tone="blue" />
        <StatCard
          icon={<CheckCircle size={32} />}
          label="Published Reports"
          value={stats.publishedCount}
          tone="green"
        />
        <StatCard
          icon={<Activity size={32} />}
          label="Recent Activity (7d)"
          value={stats.recentActivityCount}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-heading text-lg font-semibold text-va-text mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a
              href="/admin/clients/new"
              className="block px-4 py-3 rounded-card border border-va-accent/30 bg-va-accent/10 text-va-accent font-body font-semibold hover:bg-va-accent/15 transition-colors"
            >
              + Create New Client
            </a>
            <a
              href="/admin/clients"
              className="block px-4 py-3 rounded-card border border-va-border bg-va-surface-2 text-va-text-secondary font-body font-medium hover:border-va-accent/30 hover:text-va-text transition-colors"
            >
              View All Clients
            </a>
            <a
              href="/admin/audit-log"
              className="block px-4 py-3 rounded-card border border-va-border bg-va-surface-2 text-va-text-secondary font-body font-medium hover:border-va-accent/30 hover:text-va-text transition-colors"
            >
              View Audit Log
            </a>
          </div>
        </Card>

        <Card>
          <h3 className="font-heading text-lg font-semibold text-va-text mb-4">System Status</h3>
          <div className="space-y-3 font-body text-sm">
            <StatusRow label="Database Connection" status="Connected" />
            <StatusRow label="Authentication" status="Active" />
            <StatusRow label="API Status" status="Operational" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-va-text-secondary">{label}</span>
      <span className="flex items-center gap-2">
        <span className="w-2 h-2 bg-va-green rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
        <span className="font-semibold text-va-green">{status}</span>
      </span>
    </div>
  );
}
