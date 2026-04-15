'use client';

import { useState } from 'react';
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

export default function AdminSidebar({
  userEmail,
  currentPath,
}: AdminSidebarProps) {
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
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-brand-500">VA Platform</h1>
          <p className="text-xs text-gray-400">Admin Portal</p>
        </div>
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

          return (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{link.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="border-t border-gray-700 p-6">
        <div className="mb-4">
          <p className="text-xs text-gray-400 truncate">{userEmail}</p>
        </div>
        <Button
          onClick={handleSignOut}
          loading={isSigningOut}
          variant="ghost"
          size="md"
          className="w-full flex items-center justify-center gap-2 text-gray-300 hover:text-white"
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 w-64 h-screen bg-gray-900 text-white z-50">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-gray-900 text-white px-4 py-3 border-b border-gray-700">
        <h1 className="text-lg font-bold text-brand-500">VA Platform</h1>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-gray-400 hover:text-white"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <aside className="lg:hidden flex flex-col fixed left-0 top-14 w-full h-screen bg-gray-900 text-white z-40">
          {sidebarContent}
        </aside>
      )}
    </>
  );
}
