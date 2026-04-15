'use client';
import { type Investor, type DecisionMaker } from '@/lib/schemas/report';
import { getFitLabel, normalizeScore, cn } from '@/lib/utils';

function fitCls(s: number) { const n = s > 1 ? s : s * 100; if (n >= 80) return 'bg-va-green-light text-va-green border-va-green/20'; if (n >= 65) return 'bg-va-navy/5 text-va-navy border-va-navy/15'; if (n >= 50) return 'bg-va-amber/10 text-va-amber border-va-amber/20'; return 'bg-va-surface-2 text-va-text-muted border-va-border'; }

export function ComparisonTable({ investors, decisionMakers }: { investors: Investor[]; decisionMakers: DecisionMaker[] }) {
  const sorted = [...investors].sort((a, b) => b.fit_score - a.fit_score);
  return (
    <div className="overflow-x-auto rounded-card border border-va-border bg-va-surface shadow-sm">
      <table className="w-full text-sm font-body">
        <thead><tr className="border-b border-va-border bg-va-surface-2">
          <th className="px-5 py-3 text-left font-semibold text-va-text-muted">Investor</th>
          <th className="px-5 py-3 text-center font-semibold text-va-text-muted">Fit</th>
          <th className="px-5 py-3 text-left font-semibold text-va-text-muted">AUM</th>
          <th className="px-5 py-3 text-left font-semibold text-va-text-muted">Focus</th>
          <th className="px-5 py-3 text-left font-semibold text-va-text-muted">Location</th>
          <th className="px-5 py-3 text-center font-semibold text-va-text-muted">Warm</th>
          <th className="px-5 py-3 text-left font-semibold text-va-text-muted">Capacity</th>
        </tr></thead>
        <tbody>{sorted.map(inv => { const s = normalizeScore(inv.fit_score); const w = decisionMakers.filter(dm => dm.investor_name === inv.name && dm.connected).length; return (
          <tr key={inv.name} className="border-b border-va-border/50 hover:bg-va-surface-2 transition-colors">
            <td className="px-5 py-4"><p className="font-semibold text-va-navy">{inv.name}</p><p className="text-xs text-va-text-muted">{inv.segment}</p></td>
            <td className="px-5 py-4 text-center"><span className="font-heading text-lg font-semibold text-va-navy">{s}%</span><br/><span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border', fitCls(inv.fit_score))}>{getFitLabel(inv.fit_score)}</span></td>
            <td className="px-5 py-4 text-va-text-secondary">{inv.aum}</td>
            <td className="px-5 py-4 text-va-text-secondary">{inv.company_info['Focus Areas'] || inv.company_info['focus_areas'] || '—'}</td>
            <td className="px-5 py-4 text-va-text-secondary">{inv.location}</td>
            <td className="px-5 py-4 text-center">{w > 0 ? <span className="inline-flex rounded-full bg-va-green-light px-2.5 py-1 text-xs font-bold text-va-green">{w}</span> : <span className="text-va-text-muted">—</span>}</td>
            <td className="px-5 py-4 text-va-text-secondary">{inv.fit_analysis.investment_capacity}</td>
          </tr>); })}</tbody>
      </table>
    </div>
  );
}
