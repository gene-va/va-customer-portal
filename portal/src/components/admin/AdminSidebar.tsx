'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import {
  LayoutDashboard,
  Users,
  FileText,
  History,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  userEmail: string;
  currentPath: string;
}

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/audit-log', label: 'Audit Log', icon: History },
];

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-5 border-b border-va-border">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Ventures Accelerated"
            width={140}
            height={30}
            priority
            className="h-7 w-auto opacity-90"
          />
        </Link>
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-va-text-muted hover:text-va-text"
          >
            <X size={22} />
          </button>
        )}
      </div>

      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] va-gradient-text">
          Admin Portal
        </p>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-card transition-colors text-sm font-body',
                isActive
                  ? 'bg-va-accent/15 text-va-accent font-semibold border border-va-accent/30'
                  : 'text-va-text-secondary hover:bg-va-surface-2 hover:text-va-text'
              )}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="border-t border-va-border p-5">
        <p className="text-xs text-va-text-muted truncate mb-3">{userEmail}</p>
        <Button
          onClick={handleSignOut}
          loading={isSigningOut}
          variant="ghost"
          size="md"
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 w-64 h-screen bg-va-surface border-r border-va-border z-50">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-va-surface border-b border-va-border px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ventures Accelerated"
            width={120}
            height={24}
            className="h-6 w-auto opacity-90"
          />
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-va-text-muted hover:text-va-text"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <aside className="lg:hidden flex flex-col fixed left-0 top-14 w-full h-[calc(100vh-3.5rem)] bg-va-surface border-r border-va-border z-40">
          {sidebarContent}
        </aside>
      )}
    </>
  );
}
