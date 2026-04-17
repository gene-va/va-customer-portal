import { FileText } from 'lucide-react';

interface Props {
  data: Record<string, unknown>;
  updatedAt?: string | null;
}

export function RequirementsView({ data, updatedAt }: Props) {
  const keys = Object.keys(data ?? {});
  const isEmpty = keys.length === 0;

  return (
    <div className="rounded-card border border-va-border bg-va-surface p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <FileText className="h-5 w-5 text-va-text-muted" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-va-navy">Requirements</h3>
            <p className="text-xs font-body text-va-text-muted mt-0.5">
              Captured during intake. Read-only.
              {updatedAt && ` Updated ${new Date(updatedAt).toLocaleDateString()}.`}
            </p>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <p className="text-sm font-body text-va-text-muted italic">
          Requirements will appear here after your intake call.
        </p>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {keys.map((k) => {
            const v = (data as Record<string, unknown>)[k];
            return (
              <div key={k}>
                <dt className="text-xs font-body font-semibold uppercase tracking-wide text-va-text-muted">
                  {humanize(k)}
                </dt>
                <dd className="mt-0.5 text-sm font-body text-va-text whitespace-pre-wrap">
                  {renderValue(v)}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}

function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map((x) => String(x)).join(', ');
  return JSON.stringify(v, null, 2);
}
