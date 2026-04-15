'use client';

import { useState } from 'react';
import { ArrowRight, Check, Circle, AlertTriangle } from 'lucide-react';
import { type WeeklyAction } from '@/lib/schemas/report';
import { cn } from '@/lib/utils';

export function ThisWeekActions({ actions }: { actions: WeeklyAction[] }) {
  const thisWeek = actions.filter(a => a.due === 'This week');
  const nextWeek = actions.filter(a => a.due !== 'This week');

  return (
    <div className="space-y-6">
      {thisWeek.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-semibold text-va-navy mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-va-red/10 text-va-red text-xs font-body font-bold">{thisWeek.length}</span>
            This Week
          </h3>
          <div className="space-y-3">
            {thisWeek.map((action, i) => (
              <ActionCard key={i} action={action} />
            ))}
          </div>
        </div>
      )}

      {nextWeek.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-semibold text-va-text-secondary mb-4">Coming Up</h3>
          <div className="space-y-3">
            {nextWeek.map((action, i) => (
              <ActionCard key={i} action={action} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ action }: { action: WeeklyAction }) {
  const [done, setDone] = useState(action.completed);

  const priorityColors = {
    high: 'border-l-va-red bg-va-red/5',
    medium: 'border-l-va-amber bg-va-amber/5',
    low: 'border-l-va-border bg-va-surface',
  };

  return (
    <div className={cn(
      'rounded-card border border-va-border border-l-4 p-5 shadow-sm transition-all duration-300',
      done ? 'opacity-60 bg-va-surface-2' : priorityColors[action.priority]
    )}>
      <div className="flex items-start gap-4">
        {/* Check circle */}
        <button
          onClick={() => setDone(!done)}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors',
            done ? 'bg-va-green border-va-green' : 'border-va-border hover:border-va-navy'
          )}
        >
          {done && <Check className="h-3.5 w-3.5 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Investor + action */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-body text-xs font-bold text-va-text-muted uppercase tracking-wider">{action.investor_name}</span>
            {action.priority === 'high' && !done && (
              <span className="flex items-center gap-1 text-xs font-body font-semibold text-va-red">
                <AlertTriangle className="h-3 w-3" />Priority
              </span>
            )}
          </div>
          <p className={cn('font-body text-base font-medium', done ? 'text-va-text-muted line-through' : 'text-va-navy')}>
            {action.action}
          </p>

          {/* Context — the gold */}
          {!done && (
            <div className="mt-3 rounded-card bg-va-surface-2 border border-va-border p-3">
              <div className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-va-blue flex-shrink-0 mt-0.5" />
                <p className="text-sm font-body text-va-text-secondary leading-relaxed">{action.context}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
