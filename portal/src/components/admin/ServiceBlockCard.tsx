'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Pencil, Plus, ExternalLink, Lock, Star } from 'lucide-react';
import { RequirementsEditor } from './RequirementsEditor';
import { NewCampaignDialog } from './NewCampaignDialog';
import { type ServiceType, serviceLabel } from '@/lib/services/registry';

interface CampaignRow {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  phase: 'review' | 'outreach';
  campaign_type: 'event' | 'general';
  event_name: string | null;
  updated_at: string;
}

interface Props {
  clientServiceId: string;
  clientId: string;
  serviceType: ServiceType;
  active: boolean;
  isPrimary: boolean;
  requirementsData: Record<string, unknown>;
  requirementsUpdatedAt: string | null;
  campaigns: CampaignRow[];
}

export function ServiceBlockCard({
  clientServiceId,
  clientId,
  serviceType,
  active,
  isPrimary,
  requirementsData,
  requirementsUpdatedAt,
  campaigns,
}: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [editingReqs, setEditingReqs] = useState(false);
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [currentReqs, setCurrentReqs] = useState(requirementsData);
  const [markingPrimary, setMarkingPrimary] = useState(false);

  const handleMakePrimary = async () => {
    setMarkingPrimary(true);
    try {
      const res = await fetch(`/api/admin/client-services/${clientServiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_primary: true }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Request failed' }));
        alert(`Failed to set primary: ${error}`);
        return;
      }
      router.refresh();
    } finally {
      setMarkingPrimary(false);
    }
  };

  const eventCampaigns = campaigns.filter((c) => c.campaign_type === 'event');
  const generalCampaigns = campaigns.filter((c) => c.campaign_type === 'general');

  return (
    <div className="rounded-card border border-va-border bg-va-surface shadow-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-va-surface-2 transition-colors rounded-t-card"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-va-text-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 text-va-text-muted" />
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base font-semibold text-va-navy">
                {serviceLabel(serviceType)}
              </h3>
              {isPrimary && (
                <span className="inline-flex items-center gap-1 rounded-full bg-va-navy/10 px-2 py-0.5 text-xs font-body font-semibold text-va-navy">
                  <Star className="h-3 w-3 fill-current" /> Primary
                </span>
              )}
            </div>
            <p className="text-xs font-body text-va-text-muted mt-0.5">
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
              {!active && ' · inactive'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isPrimary && active && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); if (!markingPrimary) handleMakePrimary(); }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !markingPrimary) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMakePrimary();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-card border border-va-border bg-va-surface px-2.5 py-1 text-xs font-body font-semibold text-va-text-secondary hover:border-va-navy/30 hover:text-va-navy transition-colors disabled:opacity-50"
              aria-disabled={markingPrimary}
            >
              <Star className="h-3 w-3" />
              {markingPrimary ? 'Setting…' : 'Make primary'}
            </span>
          )}
          {!active && (
            <span className="inline-flex items-center gap-1 text-xs font-body text-va-text-muted">
              <Lock className="h-3 w-3" /> inactive
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-va-border p-4 space-y-5">
          {/* Requirements */}
          <div className="rounded-card border border-va-border bg-va-surface-2 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-heading text-sm font-semibold text-va-navy">Requirements</h4>
                {requirementsUpdatedAt && (
                  <p className="text-xs font-body text-va-text-muted mt-0.5">
                    Updated {new Date(requirementsUpdatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => setEditingReqs((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-body text-va-blue hover:underline"
              >
                <Pencil className="h-3 w-3" />
                {editingReqs ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editingReqs ? (
              <RequirementsEditor
                clientServiceId={clientServiceId}
                serviceType={serviceType}
                initialData={currentReqs}
                onSaved={(next) => {
                  setCurrentReqs(next);
                  setEditingReqs(false);
                }}
              />
            ) : Object.keys(currentReqs).length === 0 ? (
              <p className="text-sm font-body text-va-text-muted italic">
                No requirements captured yet.
              </p>
            ) : (
              <pre className="text-xs font-mono text-va-text-secondary whitespace-pre-wrap max-h-48 overflow-auto">
                {JSON.stringify(currentReqs, null, 2)}
              </pre>
            )}
          </div>

          {/* Campaigns */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-heading text-sm font-semibold text-va-navy">Campaigns</h4>
              <button
                onClick={() => setNewCampaignOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-card bg-va-navy px-3 py-1.5 text-xs font-body font-semibold text-white hover:bg-va-navy-light transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New campaign
              </button>
            </div>

            {campaigns.length === 0 ? (
              <p className="text-sm font-body text-va-text-muted italic">No campaigns yet.</p>
            ) : (
              <div className="space-y-4">
                {eventCampaigns.length > 0 && (
                  <CampaignGroup label="Event campaigns" campaigns={eventCampaigns} />
                )}
                {generalCampaigns.length > 0 && (
                  <CampaignGroup label="General campaigns" campaigns={generalCampaigns} />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <NewCampaignDialog
        clientId={clientId}
        clientServiceId={clientServiceId}
        serviceType={serviceType}
        open={newCampaignOpen}
        onClose={() => setNewCampaignOpen(false)}
      />
    </div>
  );
}

function CampaignGroup({ label, campaigns }: { label: string; campaigns: CampaignRow[] }) {
  return (
    <div>
      <p className="text-xs font-body font-semibold uppercase tracking-wide text-va-text-muted mb-2">
        {label}
      </p>
      <div className="space-y-1.5">
        {campaigns.map((c) => (
          <Link
            key={c.id}
            href={`/admin/reports/${c.id}`}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-card border border-va-border bg-va-surface hover:border-va-navy/30 hover:bg-va-surface-2 transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-sm text-va-navy truncate">{c.title}</p>
              <p className="text-xs font-body text-va-text-muted mt-0.5">
                {c.event_name ? `${c.event_name} · ` : ''}
                {c.status} · phase {c.phase} · updated{' '}
                {new Date(c.updated_at).toLocaleDateString()}
              </p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-va-text-muted shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
