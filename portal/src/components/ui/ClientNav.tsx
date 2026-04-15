'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from './Button';

export default function ClientNav({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const supabase = createClient();
  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/login'); };

  return (
    <nav className="border-b border-va-border bg-va-surface/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-va-navy tracking-tight">Ventures Accelerated</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm font-body text-va-text-muted">{userEmail}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    </nav>
  );
}
