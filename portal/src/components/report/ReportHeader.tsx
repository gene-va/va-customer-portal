'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Clock, AlertTriangle } from 'lucide-react';
import { formatDate, getDaysSince, cn } from '@/lib/utils';

interface ReportHeaderProps {
  title: string;
  updatedAt: string;
  generatedDate?: string;
  backHref?: string;
  backLabel?: string;
}

export default function ReportHeader({
  title,
  updatedAt,
  generatedDate,
  backHref = '/dashboard',
  backLabel = 'Back',
}: ReportHeaderProps) {
  const daysSince = getDaysSince(generatedDate || updatedAt);
  const isStale = daysSince > 30;

  return (
    <div className="sticky top-0 z-20 border-b border-va-border bg-va-surface/90 backdrop-blur-sm no-print">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href={backHref} className="flex items-center gap-2 text-va-navy hover:text-va-blue flex-shrink-0 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-body font-medium hidden sm:inline">{backLabel}</span>
        </Link>
        <h1 className="font-heading text-lg font-semibold text-va-navy flex-1 text-center truncate mx-4">{title}</h1>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={cn('hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-body font-medium border',
            isStale ? 'bg-va-amber/10 text-va-amber border-va-amber/20' : 'bg-va-surface-2 text-va-text-muted border-va-border'
          )}>
            {isStale ? <><AlertTriangle className="h-3 w-3" /> Updated {daysSince}d ago</> : <><Clock className="h-3 w-3" /> {formatDate(updatedAt)}</>}
          </div>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-card bg-va-navy px-4 py-2 text-sm font-body font-semibold text-white hover:bg-va-navy-light transition-colors">
            <Download size={15} /><span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
