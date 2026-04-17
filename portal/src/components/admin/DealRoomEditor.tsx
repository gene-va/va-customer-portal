'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Save, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { PipelineKanban } from './PipelineKanban';
import { PhaseBanner } from './PhaseBanner';
import {
  type DealRoomData,
  type PipelineStage,
  type WeeklyAction,
  type ReportPhase,
  type InvestorAnnotation,
} from '@/lib/schemas/report';

interface DealRoomEditorProps {
  reportId: string;
  initialData: DealRoomData;
  title: string;
  status: 'draft' | 'published' | 'archived';
  phase: ReportPhase;
  annotations: InvestorAnnotation[];
}

export default function DealRoomEditor({
  reportId,
  initialData,
  title: initialTitle,
  status: initialStatus,
  phase: initialPhase,
  annotations,
}: DealRoomEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState(initialStatus);
  const [data, setData] = useState<DealRoomData>(initialData);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawJson, setRawJson] = useState(JSON.stringify(initialData, null, 2));
  const [jsonError, setJsonError] = useState('');
  const nextStepDebounce = useRef<NodeJS.Timeout | null>(null);
  const candidateNames = data.investors.map((inv) => inv.name);

  // --- Silent background save (used by kanban drop & next-step debounce) ---
  const saveInBackground = async (payload: DealRoomData) => {
    setAutoSaving(true);
    try {
      const res = await fetch('/api/reports/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: reportId,
          title,
          status,
          report_data: payload,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error || 'Auto-save failed');
      }
    } catch {
      toast.error('Auto-save failed');
    } finally {
      setAutoSaving(false);
    }
  };

  // --- Pipeline stage updates (auto-saves) ---
  const updateStage = (investorName: string, newStage: PipelineStage) => {
    const next = {
      ...data,
      investors: data.investors.map(inv =>
        inv.name === investorName ? { ...inv, pipeline_stage: newStage } : inv
      ),
    };
    setData(next);
    setRawJson(JSON.stringify(next, null, 2));
    toast.success(`${investorName} → ${newStage.replace(/_/g, ' ')}`, { duration: 2000 });
    saveInBackground(next);
  };

  // Next-step updates: debounce to avoid save per keystroke
  const updateNextStep = (investorName: string, nextStep: string) => {
    const next = {
      ...data,
      investors: data.investors.map(inv =>
        inv.name === investorName ? { ...inv, next_step: nextStep } : inv
      ),
    };
    setData(next);
    setRawJson(JSON.stringify(next, null, 2));

    if (nextStepDebounce.current) clearTimeout(nextStepDebounce.current);
    nextStepDebounce.current = setTimeout(() => saveInBackground(next), 800);
  };

  // --- Action item updates ---
  const addAction = () => {
    const newAction: WeeklyAction = {
      priority: 'medium',
      investor_name: data.investors[0]?.name || '',
      action: '',
      context: '',
      due: 'This week',
      completed: false,
    };
    setData(prev => ({ ...prev, weekly_actions: [...prev.weekly_actions, newAction] }));
  };

  const updateAction = (index: number, updates: Partial<WeeklyAction>) => {
    setData(prev => ({
      ...prev,
      weekly_actions: prev.weekly_actions.map((a, i) => (i === index ? { ...a, ...updates } : a)),
    }));
  };

  const removeAction = (index: number) => {
    setData(prev => ({
      ...prev,
      weekly_actions: prev.weekly_actions.filter((_, i) => i !== index),
    }));
  };

  const moveAction = (index: number, direction: 'up' | 'down') => {
    setData(prev => {
      const actions = [...prev.weekly_actions];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= actions.length) return prev;
      [actions[index], actions[target]] = [actions[target], actions[index]];
      return { ...prev, weekly_actions: actions };
    });
  };

  // --- Headline ---
  const updateHeadline = (headline: string) => setData(prev => ({ ...prev, headline }));

  // --- Save ---
  const handleSave = async () => {
    let payload: DealRoomData = data;

    if (showRawJson) {
      try {
        payload = JSON.parse(rawJson);
        setJsonError('');
      } catch (e) {
        setJsonError((e as Error).message);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/reports/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: reportId,
          title,
          status,
          report_data: payload,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Failed to save');
      } else {
        toast.success('Saved');
        setData(payload);
        setRawJson(JSON.stringify(payload, null, 2));
      }
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
        phase={initialPhase}
        annotations={annotations}
        totalCandidates={data.investors.length}
        candidateNames={candidateNames}
        candidateLabel="investor"
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
            <label className="block mb-1.5 text-sm font-body font-medium text-va-text-secondary">VA Lead</label>
            <input
              value={data.metadata.va_lead}
              onChange={(e) => setData(prev => ({ ...prev, metadata: { ...prev.metadata, va_lead: e.target.value } }))}
              className="w-full px-3 py-2 border border-va-border rounded-card bg-va-surface text-va-text font-body focus:ring-2 focus:ring-va-navy/20"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block mb-1.5 text-sm font-body font-medium text-va-text-secondary">Headline (client-facing)</label>
          <textarea
            value={data.headline}
            onChange={(e) => updateHeadline(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-va-border rounded-card bg-va-surface text-va-text font-body focus:ring-2 focus:ring-va-navy/20"
          />
        </div>
      </div>

      {/* Pipeline — Kanban */}
      <div className="rounded-card border border-va-border bg-va-surface p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading text-lg font-semibold text-va-navy">Pipeline</h3>
            <p className="text-xs font-body text-va-text-muted mt-0.5">Drag cards between columns to update stage. Changes save automatically.</p>
          </div>
          {autoSaving && (
            <span className="inline-flex items-center gap-1.5 text-xs font-body text-va-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-va-amber animate-pulse" /> Saving…
            </span>
          )}
        </div>

        <PipelineKanban
          investors={data.investors}
          onStageChange={updateStage}
          onNextStepChange={updateNextStep}
        />
      </div>

      {/* Action Items */}
      <div className="rounded-card border border-va-border bg-va-surface p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-lg font-semibold text-va-navy">Action Items</h3>
          <button
            onClick={addAction}
            className="inline-flex items-center gap-1.5 rounded-card bg-va-navy px-3 py-1.5 text-xs font-body font-semibold text-white hover:bg-va-navy-light transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Action
          </button>
        </div>

        {data.weekly_actions.length === 0 ? (
          <p className="text-sm font-body text-va-text-muted italic">No actions yet. Click &ldquo;Add Action&rdquo; to create one.</p>
        ) : (
          <div className="space-y-3">
            {data.weekly_actions.map((action, idx) => (
              <div key={idx} className="rounded-card border border-va-border bg-va-surface-2 p-4">
                <div className="flex items-start gap-3">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 pt-1">
                    <button onClick={() => moveAction(idx, 'up')} disabled={idx === 0} className="text-va-text-muted hover:text-va-navy disabled:opacity-30">
                      <GripVertical className="h-4 w-4 rotate-90" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Row 1: dropdowns */}
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={action.investor_name}
                        onChange={(e) => updateAction(idx, { investor_name: e.target.value })}
                        className="px-2 py-1.5 border border-va-border rounded-card bg-va-surface text-va-text text-xs font-body focus:ring-2 focus:ring-va-navy/20"
                      >
                        {data.investors.map(inv => <option key={inv.name} value={inv.name}>{inv.name}</option>)}
                      </select>
                      <select
                        value={action.priority}
                        onChange={(e) => updateAction(idx, { priority: e.target.value as WeeklyAction['priority'] })}
                        className="px-2 py-1.5 border border-va-border rounded-card bg-va-surface text-va-text text-xs font-body focus:ring-2 focus:ring-va-navy/20"
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                      <select
                        value={action.due}
                        onChange={(e) => updateAction(idx, { due: e.target.value })}
                        className="px-2 py-1.5 border border-va-border rounded-card bg-va-surface text-va-text text-xs font-body focus:ring-2 focus:ring-va-navy/20"
                      >
                        <option value="This week">This week</option>
                        <option value="Next week">Next week</option>
                        <option value="Later">Later</option>
                      </select>
                    </div>

                    {/* Action text */}
                    <input
                      value={action.action}
                      onChange={(e) => updateAction(idx, { action: e.target.value })}
                      placeholder="What needs to happen — e.g. Helena to intro you to Sander Slootweg"
                      className="w-full px-3 py-2 border border-va-border rounded-card bg-va-surface text-va-text text-sm font-body font-medium focus:ring-2 focus:ring-va-navy/20"
                    />

                    {/* Context */}
                    <textarea
                      value={action.context}
                      onChange={(e) => updateAction(idx, { context: e.target.value })}
                      placeholder="Context / talking points — why this matters, what to say"
                      rows={2}
                      className="w-full px-3 py-2 border border-va-border rounded-card bg-va-surface text-va-text text-sm font-body focus:ring-2 focus:ring-va-navy/20"
                    />

                    {/* Row 3: completed + delete */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-body text-va-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={action.completed}
                          onChange={(e) => updateAction(idx, { completed: e.target.checked })}
                          className="h-4 w-4 rounded border-va-border text-va-navy focus:ring-va-navy/20"
                        />
                        Completed
                      </label>
                      <button onClick={() => removeAction(idx)} className="text-va-red hover:text-va-red/80 text-sm font-body flex items-center gap-1">
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced JSON escape hatch */}
      <div className="rounded-card border border-va-border bg-va-surface p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-va-navy">Advanced (raw JSON)</h3>
            <p className="text-xs font-body text-va-text-muted mt-0.5">For editing investor details, contacts, pitch angles, and strategy narrative.</p>
          </div>
          <button onClick={() => setShowRawJson(!showRawJson)} className="text-sm font-body text-va-blue hover:underline">
            {showRawJson ? 'Hide' : 'Show'}
          </button>
        </div>

        {showRawJson && (
          <div>
            <textarea
              value={rawJson}
              onChange={(e) => { setRawJson(e.target.value); setJsonError(''); }}
              rows={20}
              className={`w-full px-3 py-2 border rounded-card bg-va-surface-2 text-va-text text-xs font-mono focus:ring-2 ${
                jsonError ? 'border-va-red focus:ring-va-red/20' : 'border-va-border focus:ring-va-navy/20'
              }`}
            />
            {jsonError && <p className="mt-2 text-sm text-va-red">{jsonError}</p>}
            <p className="mt-2 text-xs font-body text-va-text-muted">
              Saving will use the JSON editor contents, overwriting the pipeline/action edits above.
            </p>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center justify-between sticky bottom-4 rounded-card border border-va-border bg-va-surface/95 backdrop-blur-sm p-4 shadow-lg">
        <p className="text-sm font-body text-va-text-muted">
          Changes are saved to the client&apos;s deal room. They&apos;ll see updates on their next page load.
        </p>
        <div className="flex gap-3">
          <a href={`/report/${reportId}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="md" className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Preview
            </Button>
          </a>
          <Button variant="primary" size="md" onClick={handleSave} loading={saving} disabled={saving} className="flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
