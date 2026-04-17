'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { SERVICES, type ServiceType, SERVICE_TYPE_VALUES } from '@/lib/services/registry';

interface Props {
  clientId: string;
  /** Service types this client is already subscribed to (to filter them out) */
  existingServiceTypes: ServiceType[];
}

export function AddServiceBlockButton({ clientId, existingServiceTypes }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ServiceType | null>(null);
  const [adding, setAdding] = useState(false);

  const available = SERVICE_TYPE_VALUES.filter((t) => !existingServiceTypes.includes(t));

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/client-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, service_type: selected }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Failed to subscribe');
        return;
      }
      toast.success(`Subscribed to ${SERVICES[selected].label}`);
      setOpen(false);
      setSelected(null);
      router.refresh();
    } catch {
      toast.error('Failed to subscribe');
    } finally {
      setAdding(false);
    }
  };

  if (available.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-card border border-va-border bg-va-surface px-3 py-1.5 text-xs font-body font-semibold text-va-navy hover:border-va-navy/40 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Subscribe to service block
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-va-navy/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-card bg-va-surface border border-va-border shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-va-navy">
                Subscribe to service block
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-card border border-va-border hover:bg-va-surface-2"
              >
                <X className="h-4 w-4 text-va-text-muted" />
              </button>
            </div>

            <div className="space-y-2">
              {available.map((t) => {
                const svc = SERVICES[t];
                const active = selected === t;
                return (
                  <button
                    key={t}
                    onClick={() => setSelected(t)}
                    className={`w-full text-left p-3 rounded-card border transition-all ${
                      active
                        ? 'bg-va-navy/5 border-va-navy/40'
                        : 'bg-va-surface border-va-border hover:border-va-navy/30'
                    }`}
                  >
                    <p className="font-heading text-sm font-semibold text-va-navy">{svc.label}</p>
                    <p className="text-xs font-body text-va-text-muted mt-0.5">
                      {svc.shortDescription}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="md" onClick={() => setOpen(false)} disabled={adding}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleAdd}
                loading={adding}
                disabled={!selected || adding}
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
