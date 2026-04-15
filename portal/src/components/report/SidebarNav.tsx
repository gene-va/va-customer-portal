'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavSection { id: string; label: string; badge?: number; }

export function SidebarNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id || '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const obs = sections.map(s => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(s.id); }, { threshold: 0.2, rootMargin: '-80px 0px -60% 0px' });
      o.observe(el);
      return o;
    });
    return () => obs.forEach(o => o?.disconnect());
  }, [sections]);

  const click = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setActive(id); setOpen(false); };

  const nav = (
    <nav className="space-y-0.5">{sections.map(s => (
      <button key={s.id} onClick={() => click(s.id)} className={cn(
        'flex w-full items-center justify-between rounded-card px-3 py-2 text-sm font-body font-medium transition-all duration-300',
        active === s.id ? 'bg-va-navy/10 text-va-navy' : 'text-va-text-muted hover:text-va-navy hover:bg-va-surface-2'
      )}>
        <span>{s.label}</span>
        {s.badge! > 0 && <span className="ml-2 inline-flex items-center justify-center rounded-full bg-va-green-light px-2 py-0.5 text-xs font-bold text-va-green">{s.badge}</span>}
      </button>
    ))}</nav>
  );

  return (
    <>
      <aside className="hidden lg:block lg:sticky lg:top-20 lg:h-max w-48 pt-4 no-print">{nav}</aside>
      <div className="lg:hidden fixed bottom-6 right-6 z-30 no-print">
        <button onClick={() => setOpen(!open)} className="flex h-12 w-12 items-center justify-center rounded-full bg-va-navy text-white shadow-lg hover:bg-va-navy-light transition-colors">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && <>
        <div className="lg:hidden fixed inset-0 z-20 bg-black/20" onClick={() => setOpen(false)} />
        <div className="lg:hidden fixed bottom-20 right-6 z-30 w-56 rounded-card border border-va-border bg-va-surface p-3 shadow-xl">{nav}</div>
      </>}
    </>
  );
}
