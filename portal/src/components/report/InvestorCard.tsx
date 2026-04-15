'use client';

import { useState } from 'react';
import { ChevronDown, MapPin, Building2, Zap, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Investor, type DecisionMaker } from '@/lib/schemas/report';
import { cn, getFitLabel, normalizeScore, getScoreBarLabel } from '@/lib/utils';

function fitCls(s: number) { const n = s > 1 ? s : s * 100; if (n >= 80) return 'bg-va-green-light text-va-green border-va-green/20'; if (n >= 65) return 'bg-va-navy/5 text-va-navy border-va-navy/15'; if (n >= 50) return 'bg-va-amber/10 text-va-amber border-va-amber/20'; return 'bg-va-surface-2 text-va-text-muted border-va-border'; }
function ringColor(s: number) { const n = s > 1 ? s : s * 100; if (n >= 80) return 'stroke-[#1a7d45]'; if (n >= 65) return 'stroke-[#0d1b2a]'; if (n >= 50) return 'stroke-[#b8860b]'; return 'stroke-[#6b7a8d]'; }
function barColor(p: number) { if (p >= 80) return 'bg-va-green'; if (p >= 50) return 'bg-va-navy'; return 'bg-va-red'; }

export function InvestorCard({ investor, connectedDecisionMakers, defaultExpanded = false }: { investor: Investor; connectedDecisionMakers: DecisionMaker[]; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [introReq, setIntroReq] = useState(false);
  const score = normalizeScore(investor.fit_score);
  const wc = connectedDecisionMakers.length;

  return (
    <div className={cn('rounded-card border bg-va-surface overflow-hidden transition-all duration-300 shadow-sm', wc > 0 ? 'border-va-green/20' : 'border-va-border', 'hover:shadow-md hover:border-va-navy/20')}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-body font-bold border', fitCls(investor.fit_score))}>{getFitLabel(investor.fit_score)}</span>
                {wc > 0 && <span className="inline-flex items-center gap-1.5 text-xs font-body font-semibold text-va-green"><Zap className="h-3 w-3" />{wc} warm intro{wc !== 1 ? 's' : ''}</span>}
              </div>
              <h3 className="font-heading text-xl font-semibold text-va-navy mt-2">{investor.name}</h3>
              <p className="text-sm font-body text-va-text-muted">{investor.segment}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-body text-va-text-secondary">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-va-text-muted" />{investor.location}</span>
                <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-va-text-muted" />{investor.aum}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#d4cdbf" strokeWidth="5" />
                  <circle cx="32" cy="32" r="28" fill="none" className={ringColor(investor.fit_score)} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(score / 100) * 175.9} 175.9`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-heading text-lg font-semibold text-va-navy">{score}</span>
              </div>
              <span className="text-xs font-body text-va-text-muted">Fit Score</span>
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="mt-1"><ChevronDown className="h-5 w-5 text-va-text-muted" /></motion.div>
            </div>
          </div>
          <p className="mt-3 text-sm font-body text-va-text-secondary line-clamp-2">{investor.fit_analysis.headline}</p>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="border-t border-va-border">
            <div className="px-6 py-6 space-y-6">
              {wc > 0 && (
                <div className="rounded-card border border-va-green/20 bg-va-green-light p-4">
                  <h4 className="text-sm font-body font-bold text-va-green mb-3">Warm Connections at {investor.name}</h4>
                  {connectedDecisionMakers.map(dm => (
                    <div key={dm.name} className="mb-1"><span className="text-sm font-body font-medium text-va-text">{dm.name}</span><span className="text-sm font-body text-va-text-muted"> — {dm.title}</span><p className="text-xs font-body text-va-green">via {dm.connected_via}</p></div>
                  ))}
                  <div className="mt-3">{introReq ? <div className="flex items-center gap-2 text-sm font-body font-medium text-va-green"><Check className="h-4 w-4" />Intro requested</div> : <button onClick={e => { e.stopPropagation(); setIntroReq(true); }} className="inline-flex items-center gap-2 rounded-card bg-va-green text-white px-4 py-2 text-sm font-body font-semibold hover:opacity-90"><Send className="h-3.5 w-3.5" />Request Intro</button>}</div>
                </div>
              )}

              <div>
                <h4 className="font-heading text-base font-semibold text-va-navy mb-4">Score Breakdown</h4>
                <div className="space-y-3">{investor.score_breakdown.map(item => { const p = Math.round((item.score / item.weight) * 100); return (
                  <div key={item.category}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-body font-medium text-va-text-secondary">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-body font-semibold px-2 py-0.5 rounded-full', p >= 80 ? 'bg-va-green-light text-va-green' : p >= 50 ? 'bg-va-navy/5 text-va-navy' : 'bg-va-red/10 text-va-red')}>{getScoreBarLabel(p)}</span>
                        <span className="text-xs font-body text-va-text-muted tabular-nums w-12 text-right">{item.score.toFixed(1)}/{item.weight}</span>
                      </div>
                    </div>
                    <div className="w-full bg-va-surface-2 rounded-full h-2 overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${p}%` }} transition={{ duration: 0.5, delay: 0.1 }} className={cn('h-full rounded-full', barColor(p))} />
                    </div>
                  </div>); })}</div>
              </div>

              {Object.entries(investor.company_info).some(([, v]) => v !== null) && (
                <div><h4 className="font-heading text-base font-semibold text-va-navy mb-3">Company Info</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">{Object.entries(investor.company_info).map(([k, v]) => v ? <div key={k}><p className="text-xs font-body font-medium text-va-text-muted uppercase tracking-wider">{k.replace(/_/g, ' ')}</p><p className="text-sm font-body text-va-text mt-0.5">{v}</p></div> : null)}</div>
                </div>
              )}

              <div><h4 className="font-heading text-base font-semibold text-va-navy mb-3">Why They Fit</h4>
                <ul className="space-y-2">{investor.fit_analysis.points.map((pt, i) => <li key={i} className="flex items-start gap-2.5 text-sm font-body text-va-text-secondary"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-va-blue flex-shrink-0" />{pt}</li>)}</ul>
              </div>

              {investor.portfolio.length > 0 && (
                <div><h4 className="font-heading text-base font-semibold text-va-navy mb-3">Portfolio Highlights ({investor.portfolio.length})</h4>
                  <div className="flex flex-wrap gap-2">{investor.portfolio.map((c, i) => <div key={i} className="rounded-card border border-va-border bg-va-surface-2 px-3 py-2"><p className="text-sm font-body font-medium text-va-text">{c.name}</p><p className="text-xs font-body text-va-text-muted">{c.detail}</p></div>)}</div>
                </div>
              )}

              <div className="rounded-card bg-va-navy/5 border border-va-navy/10 p-4">
                <p className="text-xs font-body font-semibold text-va-navy uppercase tracking-wider mb-1">Investment Capacity</p>
                <p className="text-sm font-body text-va-text">{investor.fit_analysis.investment_capacity}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
