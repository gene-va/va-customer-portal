'use client';

import { Users, Zap, TrendingUp, MapPin } from 'lucide-react';
import { type ReportData } from '@/lib/schemas/report';
import { normalizeScore } from '@/lib/utils';

interface ExecutiveSummaryProps {
  summary: ReportData['summary'];
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  const stats = [
    { label: 'Matched Investors', value: String(summary.total_investors), icon: Users, text: 'text-va-accent' },
    { label: 'Warm Intros', value: String(summary.warm_leads), icon: Zap, text: 'text-va-green' },
    { label: 'Avg Fit Score', value: `${normalizeScore(summary.avg_fit_score)}%`, icon: TrendingUp, text: 'text-va-gold' },
    { label: 'Geographic Match', value: summary.geographic_match, icon: MapPin, text: 'text-va-text-secondary' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-xl border border-va-border bg-va-surface p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-va-text-muted">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.text}`}>{stat.value}</p>
              </div>
              <Icon className={`h-5 w-5 ${stat.text} opacity-50`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
