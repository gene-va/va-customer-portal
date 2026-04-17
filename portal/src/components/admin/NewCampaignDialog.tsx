'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { type CampaignType, type ServiceType, serviceLabel } from '@/lib/services/registry';

interface Props {
  clientId: string;
  clientServiceId: string;
  serviceType: ServiceType;
  open: boolean;
  onClose: () => void;
}

export function NewCampaignDialog({
  clientId,
  clientServiceId,
  serviceType,
  open,
  onClose,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [campaignType, setCampaignType] = useState<CampaignType>('general');
  const [eventName, setEventName] = useState('');
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (campaignType === 'event' && !eventName.trim()) {
      toast.error('Event name is required for event campaigns');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_service_id: clientServiceId,
          title: title.trim(),
          campaign_type: campaignType,
          event_name: campaignType === 'event' ? eventName.trim() : null,
          status: 'draft',
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.report) {
        toast.error(body.error || 'Failed to create campaign');
        return;
      }
      toast.success('Campaign created');
      router.push(`/admin/reports/${body.report.id}`);
    } catch {
      toast.error('Create failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-va-navy/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-card bg-va-surface border border-va-border shadow-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-va-navy">New campaign</h3>
            <p className="text-xs font-body text-va-text-muted mt-0.5">
              Under {serviceLabel(serviceType)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-card border border-va-border hover:bg-va-surface-2"
          >
            <X className="h-4 w-4 text-va-text-muted" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-body font-medium text-va-text-secondary">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. InterPhex 2026 Prospects"
              className="w-full px-3 py-2 border border-va-border rounded-card bg-va-surface text-va-text font-body focus:ring-2 focus:ring-va-navy/20 focus:border-va-navy"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-body font-medium text-va-text-secondary">
              Campaign type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['general', 'event'] as CampaignType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setCampaignType(t)}
                  className={`px-3 py-2 rounded-card border text-sm font-body font-semibold transition-colors ${
                    campaignType === t
                      ? 'bg-va-navy text-white border-va-navy'
                      : 'bg-va-surface border-va-border text-va-text-secondary hover:border-va-navy/40'
                  }`}
                >
                  {t === 'general' ? 'General' : 'Event-specific'}
                </button>
              ))}
            </div>
          </div>

          {campaignType === 'event' && (
            <div>
              <label className="block mb-1.5 text-sm font-body font-medium text-va-text-secondary">
                Event name
              </label>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. InterPhex 2026"
                className="w-full px-3 py-2 border border-va-border rounded-card bg-va-surface text-va-text font-body focus:ring-2 focus:ring-va-navy/20 focus:border-va-navy"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={creating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleCreate}
            loading={creating}
            disabled={creating}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
