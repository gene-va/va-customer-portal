import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: clientData, error: clientError } = await supabase.from('clients').select('id, company_name').eq('user_id', user.id).single();

  if (clientError || !clientData) {
    return (
      <div className="text-center py-16">
        <h1 className="font-heading text-3xl font-semibold text-va-navy mb-4">Access Pending</h1>
        <p className="font-body text-lg text-va-text-secondary mb-8">Contact your VA team for access to your reports</p>
        <div className="max-w-md mx-auto rounded-card bg-va-navy/5 border border-va-navy/10 p-6">
          <p className="text-sm font-body text-va-text-secondary">Your account has been created, but we're still setting up your reports.</p>
        </div>
      </div>
    );
  }

  const { data: reports } = await supabase.from('reports').select('id, title, status, updated_at, published_at')
    .eq('client_id', clientData.id).eq('status', 'published').order('published_at', { ascending: false });
  const list = reports || [];

  if (list.length === 0) return (
    <div className="text-center py-16">
      <h1 className="font-heading text-3xl font-semibold text-va-navy mb-2">Welcome, {clientData.company_name}</h1>
      <p className="font-body text-lg text-va-text-secondary">No reports available yet.</p>
    </div>
  );

  if (list.length === 1) {
    const r = list[0];
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl font-semibold text-va-navy mb-2">Welcome, {clientData.company_name}</h1>
          <p className="font-body text-lg text-va-text-secondary">Your investor matching report is ready</p>
        </div>
        <Link href={`/report/${r.id}`}>
          <div className="rounded-card border border-va-border bg-va-surface p-8 shadow-sm hover:shadow-md hover:border-va-navy/20 transition-all duration-300 cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-va-hero" />
            <h2 className="font-heading text-2xl font-semibold text-va-navy">{r.title}</h2>
            <p className="text-sm font-body text-va-text-muted mt-2">Last updated {formatDate(r.updated_at)}</p>
            <div className="mt-6"><span className="inline-flex items-center rounded-card bg-va-navy px-6 py-3 text-sm font-body font-semibold text-white hover:bg-va-navy-light transition-colors">View Your Report</span></div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold text-va-navy mb-2">Welcome, {clientData.company_name}</h1>
      <p className="font-body text-lg text-va-text-secondary mb-12">Your investor matching reports</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{list.map(r => (
        <Link key={r.id} href={`/report/${r.id}`}>
          <div className="h-full rounded-card border border-va-border bg-va-surface p-6 shadow-sm hover:shadow-md hover:border-va-navy/20 transition-all duration-300 cursor-pointer">
            <h3 className="font-heading text-xl font-semibold text-va-navy">{r.title}</h3>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-body text-va-text-muted">{formatDate(r.updated_at)}</span>
              <span className="px-3 py-1 bg-va-green-light text-va-green text-xs font-body font-medium rounded-full">Published</span>
            </div>
            <div className="mt-4"><span className="inline-flex items-center rounded-card bg-va-navy px-4 py-2 text-sm font-body font-semibold text-white">View Report</span></div>
          </div>
        </Link>
      ))}</div>
    </div>
  );
}
