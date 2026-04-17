import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('user_id', user.id)
    .single();

  if (clientError || !clientData) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="font-heading text-3xl font-semibold text-va-navy mb-4">Access pending</h1>
        <p className="font-body text-lg text-va-text-secondary mb-8">
          Contact your VA team for access to your reports.
        </p>
      </main>
    );
  }

  const { data: services } = await supabase
    .from('client_services')
    .select('id')
    .eq('client_id', clientData.id)
    .eq('active', true)
    .order('is_primary', { ascending: false })
    .order('started_at', { ascending: true })
    .order('id', { ascending: true });

  if (!services || services.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="font-heading text-3xl font-semibold text-va-navy mb-2">
          Welcome, {clientData.company_name}
        </h1>
        <p className="font-body text-lg text-va-text-secondary">
          No service blocks active yet. Your VA team will set you up shortly.
        </p>
      </main>
    );
  }

  redirect(`/services/${services[0].id}`);
}
