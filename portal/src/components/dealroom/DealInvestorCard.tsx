'use client';

import { useState } from 'react';
import { ChevronDown, MapPin, Send, Check, User, MessageSquare, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type DealInvestor, type PipelineStage } from '@/lib/schemas/report';
import { cn } from '@/lib/utils';

const STAGE_LABELS: Record<PipelineStage, { label: string; cls: string }> = {
  identified: { label: 'Identified', cls: 'bg-va-surface-2 text-va-text-muted border-va-border' },
  intro_requested: { label: 'Intro Requested', cls: 'bg-va-amber/10 text-va-amber border-va-amber/20' },
  intro_made: { label: 'Intro Made', cls: 'bg-va-blue/10 text-va-blue border-va-blue/20' },
  meeting_scheduled: { label: 'Meeting Set', cls: 'bg-va-green-light text-va-green border-va-green/20' },
  in_diligence: { label: 'In Diligence', cls: 'bg-va-navy/10 text-va-navy border-va-navy/15' },
  term_sheet: { label: 'Term Sheet', cls: 'bg-va-green/20 text-va-green border-va-green/30' },
};

export function DealInvestorCard({ investor, defaultExpanded = false, id }: { investor: DealInvestor; defaultExpanded?: boolean; id?: string }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [introReq, setIntroReq] = useState(false);
  const stage = STAGE_LABELS[investor.pipeline_stage];
  const warmContacts = investor.contacts.filter(c => c.is_warm);

  return (
    <div id={id} className="rounded-card border border-va-border bg-va-surface shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 scroll-mt-20">
      {/* Header — always visible */}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Stage + warm count */}
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-body font-bold border', stage.cls)}>
                  {stage.label}
                </span>
                {warmContacts.length > 0 && (
                  <span className="text-xs font-body font-semibold text-va-green flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-va-green" />
                    {warmContacts.length} warm intro{warmContacts.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <h3 className="font-heading text-xl font-semibold text-va-navy">{investor.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-body text-va-text-secondary">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-va-text-muted" />{investor.location}</span>
                <span>{investor.aum}</span>
                <span className="text-va-text-muted">{investor.segment}</span>
              </div>

              {/* Next step — the most important line */}
              <div className="mt-3 rounded-card bg-va-navy/5 border border-va-navy/10 px-4 py-2.5">
                <p className="text-sm font-body font-semibold text-va-navy">
                  Next: {investor.next_step}
                </p>
              </div>
            </div>

            {/* Check size + expand */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs font-body text-va-text-muted">Check size</p>
                <p className="font-heading text-lg font-semibold text-va-navy">{investor.check_size}</p>
              </div>
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-5 w-5 text-va-text-muted" />
              </motion.div>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded — the deal detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="border-t border-va-border">
            <div className="px-6 py-6 space-y-6">
              {/* Why they fit — narrative paragraph */}
              <div>
                <h4 className="font-heading text-base font-semibold text-va-navy mb-2">Why They Fit</h4>
                <p className="font-body text-sm text-va-text-secondary leading-relaxed">{investor.why_they_fit}</p>
              </div>

              {/* Portfolio proof — the killer line */}
              <div className="rounded-card border-l-4 border-va-navy bg-va-navy/5 p-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-va-navy flex-shrink-0 mt-0.5" />
                  <p className="font-body text-sm text-va-text font-medium leading-relaxed">{investor.portfolio_proof}</p>
                </div>
              </div>

              {/* Contacts */}
              <div>
                <h4 className="font-heading text-base font-semibold text-va-navy mb-3">Key Contacts</h4>
                <div className="space-y-2">
                  {investor.contacts.map(contact => (
                    <div key={contact.name} className="flex items-center justify-between gap-3 rounded-card border border-va-border bg-va-surface-2 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-va-navy/5 flex-shrink-0">
                          <User className="h-4 w-4 text-va-navy" />
                        </div>
                        <div>
                          <p className="font-body text-sm font-medium text-va-navy">{contact.name}</p>
                          <p className="font-body text-xs text-va-text-muted">{contact.title}</p>
                        </div>
                      </div>
                      {contact.is_warm ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-va-green" />
                          <span className="text-xs font-body font-medium text-va-green">via {contact.connected_via}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-body text-va-text-muted">Not connected</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Request intro */}
                {warmContacts.length > 0 && (
                  <div className="mt-3">
                    {introReq ? (
                      <div className="flex items-center gap-2 text-sm font-body font-medium text-va-green">
                        <Check className="h-4 w-4" /> Intro requested — VA team will follow up
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setIntroReq(true); }}
                        className="inline-flex items-center gap-2 rounded-card bg-va-navy px-4 py-2 text-sm font-body font-semibold text-white hover:bg-va-navy-light transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" /> Request Intro
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Pitch — what to say in the meeting */}
              <div className="rounded-card border border-va-border bg-va-surface p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-va-blue" />
                  <h4 className="font-heading text-base font-semibold text-va-navy">Your Pitch Angle</h4>
                </div>
                <p className="font-body text-sm text-va-text-secondary leading-relaxed italic mb-4">
                  &ldquo;{investor.pitch_angle}&rdquo;
                </p>
                <div className="space-y-2">
                  {investor.pitch_points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-va-blue flex-shrink-0" />
                      <p className="text-sm font-body text-va-text-secondary">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {investor.notes && (
                <div className="rounded-card bg-va-amber/5 border border-va-amber/20 p-4">
                  <p className="text-xs font-body font-semibold text-va-amber uppercase tracking-wider mb-1">Intel</p>
                  <p className="text-sm font-body text-va-text-secondary">{investor.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
