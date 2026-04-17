'use client';

import { useState } from 'react';
import { Save, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { PhaseBanner } from './PhaseBanner';
import {
  type InvestorAnnotation,
  type ProspectResearchData,
  type ReportPhase,
} from '@/lib/schemas/report';

interface Props {
  reportId: string;
  initialData: ProspectResearchData;
  title: string;
  status: 'draft' | 'published' | 'archived';
  phase: ReportPhase;
  annotations: InvestorAnnotation[];
}

export default function ProspectResearchAdminView({
  reportId,
  initialData,
  title: initialTitle,
  status: initialStatus,
  phase,
  annotations,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState(initialStatus);
  const [rawJson, setRawJson] = useState(JSON.stringify(initialData, null, 2));
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving] = useState(false);

  const candidateNames = initialData.prospects.map((p) => p.company);

  const handleSave = async () => {
    let payload: ProspectResearchData;
    try {
      payload = JSON.parse(rawJson);
      setJsonError('');
    } catch (e) {
      setJsonError((e as Error).message);
      return;
    }
    if (payload.version !== 'v3') {
      setJsonError('Payload must have version: "v3"');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/reports/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, title, status, report_data: payload }),
      });
      const body = await res.json();
      if (!res.ok) toast.error(body.error || 'Failed to save');
      else toast.success('Saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PhaseBanner
        reportId={reportId}
        phase={phase}
        annotations={annotations}
        totalCandidates={initialData.prospects.length}
        candidateNames={candidateNames}
        candidateLabel="prospect"
      />

      {/* Meta */}
      <div className="rounded-card border border-va-border bg-va-surface p-6 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-va-navy mb-4">Report Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-body font-medium text-va-text-secondary">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-va-border rounded-card bg-va-surface text-va-text font-body focus:ring-2 focus:ring-va-navy/20 focus:border-va-navy"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-body font-medium text-va-text-secondary">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full px-3 py-2 border border-va-border rounded-card bg-va-surface text-va-text font-body focus:ring-2 focus:ring-va-navy/20"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-body font-medium text-va-text-secondary">Prospects</label>
            <p className="px-3 py-2 text-sm font-body text-va-text-secondary bg-va-surface-2 rounded-card border border-va-border">
              {initialData.prospects.length} loaded — {initialData.event.name}
            </p>
          </div>
        </div>
      </div>

      {/* Raw JSON editor */}
      <div className="rounded-card border border-va-border bg-va-surface p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="font-heading text-lg font-semibold text-va-navy">Report data (raw JSON)</h3>
          <p className="text-xs font-body text-va-text-muted mt-0.5">
            Prospect research data is generated externally. Paste a new version here to replace it.
          </p>
        </div>

        <textarea
          value={rawJson}
          onChange={(e) => {
            setRawJson(e.target.value);
            setJsonError('');
          }}
          rows={24}
          className={`w-full px-3 py-2 border rounded-card bg-va-surface-2 text-va-text text-xs font-mono focus:ring-2 ${
            jsonError ? 'border-va-red focus:ring-va-red/20' : 'border-va-border focus:ring-va-navy/20'
          }`}
        />
        {jsonError && <p className="mt-2 text-sm text-va-red">{jsonError}</p>}
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between sticky bottom-4 rounded-card border border-va-border bg-va-surface/95 backdrop-blur-sm p-4 shadow-lg">
        <p className="text-sm font-body text-va-text-muted">
          Changes are saved to the client&apos;s prospect research report.
        </p>
        <div className="flex gap-3">
          <a href={`/report/${reportId}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="md" className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Preview
            </Button>
          </a>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            loading={saving}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
