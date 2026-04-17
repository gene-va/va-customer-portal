import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ClientNav, { type NavService } from '@/components/ui/ClientNav';
import { isServiceType } from '@/lib/services/registry';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');

  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let services: NavService[] = [];
  if (clientData) {
    const { data } = await supabase
      .from('client_services')
      .select('id, service_type, is_primary')
      .eq('client_id', clientData.id)
      .eq('active', true)
      .order('is_primary', { ascending: false })
      .order('started_at', { ascending: true })
      .order('id', { ascending: true });
    services = ((data ?? []) as NavService[]).filter((s) => isServiceType(s.service_type));
  }

  return (
    <div className="min-h-screen bg-va-bg">
      <ClientNav userEmail={user.email || ''} services={services} />
      {children}
    </div>
  );
}
