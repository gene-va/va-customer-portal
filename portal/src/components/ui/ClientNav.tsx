'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SERVICES, type ServiceType } from '@/lib/services/registry';
import Button from './Button';

export type NavService = {
  id: string;
  service_type: ServiceType;
  is_primary: boolean;
};

export default function ClientNav({
  userEmail,
  services,
}: {
  userEmail: string;
  services: NavService[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const currentId = extractServiceId(pathname);
  const current = services.find((s) => s.id === currentId) ?? services[0];
  const showSwitcher = services.length >= 2;

  return (
    <nav className="sticky top-0 z-40 border-b border-va-border bg-va-surface/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="Ventures Accelerated"
              width={140}
              height={30}
              priority
              className="h-7 w-auto opacity-90"
            />
            <span className="hidden sm:inline font-heading text-sm font-bold va-gradient-text tracking-tight">
              Customer Portal
            </span>
          </Link>
          {showSwitcher && current && (
            <ServiceSwitcher services={services} current={current} />
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-xs font-body text-va-text-muted truncate max-w-[16rem]">
            {userEmail}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}

function ServiceSwitcher({ services, current }: { services: NavService[]; current: NavService }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-card border border-va-border bg-va-surface px-3 py-1.5 text-sm font-body font-semibold text-va-navy hover:border-va-navy/30 hover:shadow-sm transition-all"
      >
        {SERVICES[current.service_type].label}
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 rounded-card border border-va-border bg-va-surface shadow-md z-10 overflow-hidden">
          {services.map((s) => {
            const isCurrent = s.id === current.id;
            return (
              <Link
                key={s.id}
                href={`/services/${s.id}`}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-body hover:bg-va-bg transition-colors ${
                  isCurrent ? 'text-va-navy font-semibold' : 'text-va-text-secondary'
                }`}
              >
                <span>{SERVICES[s.service_type].label}</span>
                {isCurrent && <Check className="h-4 w-4 text-va-navy" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function extractServiceId(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/services\/([^/]+)/);
  return match ? match[1] : null;
}
