import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ClientNav from '@/components/ui/ClientNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');

  return (
    <div className="min-h-screen bg-va-bg">
      <ClientNav userEmail={user.email || ''} />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
