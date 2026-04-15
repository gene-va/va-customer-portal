'use client';
import { useState } from 'react';
import { CheckCircle2, Send, Check, User } from 'lucide-react';
import { type ReportData } from '@/lib/schemas/report';

export function WarmLeadsBanner({ warmLeads, decisionMakers }: { warmLeads: ReportData['warm_leads']; decisionMakers: ReportData['decision_makers']; companyName: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-card border border-va-green/30 bg-va-green-light p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-va-green/10"><CheckCircle2 className="h-5 w-5 text-va-green" /></div>
          <div><h3 className="font-heading text-xl font-semibold text-va-navy">{warmLeads.length} Warm Intro{warmLeads.length !== 1 ? 's' : ''} Identified</h3><p className="text-sm font-body text-va-green">No cold outreach needed — connected through the VA network.</p></div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{warmLeads.map((l, i) => <WLC key={i} lead={l} dms={decisionMakers} />)}</div>
    </div>
  );
}

function WLC({ lead, dms }: { lead: ReportData['warm_leads'][number]; dms: ReportData['decision_makers'] }) {
  const [req, setReq] = useState(false);
  const dm = dms.find(d => d.name === lead.name);
  return (
    <div className="rounded-card border border-va-border bg-va-surface p-5 shadow-sm hover:shadow-md hover:border-va-navy/20 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-va-navy/5 flex-shrink-0"><User className="h-5 w-5 text-va-navy" /></div>
        <div className="flex-1 min-w-0">
          <h4 className="font-heading font-semibold text-va-navy">{lead.name}</h4>
          <p className="text-sm font-body text-va-text-secondary mt-0.5">{lead.role}</p>
          <div className="mt-2 flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-va-green" /><span className="text-xs font-body font-medium text-va-green">Connected via {lead.connected_via}</span></div>
          {dm?.bio && <p className="mt-2 text-sm font-body text-va-text-muted line-clamp-2">{dm.bio}</p>}
          <div className="mt-4">{req ? <div className="flex items-center gap-2 text-sm font-body font-medium text-va-green"><Check className="h-4 w-4" />Intro requested</div> : <button onClick={() => setReq(true)} className="inline-flex items-center gap-2 rounded-card bg-va-navy px-4 py-2 text-sm font-body font-semibold text-white hover:bg-va-navy-light transition-colors"><Send className="h-3.5 w-3.5" />Request Intro</button>}</div>
        </div>
      </div>
    </div>
  );
}
