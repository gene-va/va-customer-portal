'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { type ServiceType, serviceLabel } from '@/lib/services/registry';

interface Props {
  clientServiceId: string;
  serviceType: ServiceType;
  initialData: Record<string, unknown>;
  onSaved?: (next: Record<string, unknown>) => void;
}

export function RequirementsEditor({
  clientServiceId,
  serviceType,
  initialData,
  onSaved,
}: Props) {
  const [rawJson, setRawJson] = useState(JSON.stringify(initialData, null, 2));
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    let payload: Record<string, unknown>;
    try {
      const parsed = JSON.parse(rawJson);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setJsonError('Requirements must be a JSON object');
        return;
      }
      payload = parsed;
      setJsonError('');
    } catch (e) {
      setJsonError((e as Error).message);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/client-services/${clientServiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements_data: payload }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Failed to save');
      } else {
        toast.success('Requirements saved');
        onSaved?.(payload);
      }
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-heading text-sm font-semibold text-va-navy">
          Requirements — {serviceLabel(serviceType)}
        </h4>
        <p className="text-xs font-body text-va-text-muted mt-0.5">
          Captured during intake. Client sees this read-only.
        </p>
      </div>
      <textarea
        value={rawJson}
        onChange={(e) => {
          setRawJson(e.target.value);
          setJsonError('');
        }}
        rows={16}
        className={`w-full px-3 py-2 border rounded-card bg-va-surface-2 text-va-text text-xs font-mono focus:ring-2 ${
          jsonError ? 'border-va-red focus:ring-va-red/20' : 'border-va-border focus:ring-va-navy/20'
        }`}
      />
      {jsonError && <p className="text-sm text-va-red">{jsonError}</p>}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          loading={saving}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-3.5 w-3.5" /> Save requirements
        </Button>
      </div>
    </div>
  );
}
