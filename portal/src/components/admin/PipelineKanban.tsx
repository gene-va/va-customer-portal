'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Zap, GripVertical } from 'lucide-react';
import { type DealInvestor, type PipelineStage } from '@/lib/schemas/report';
import { cn } from '@/lib/utils';

const STAGES: { key: PipelineStage; label: string; accent: string }[] = [
  { key: 'identified', label: 'Identified', accent: 'border-t-va-border-light' },
  { key: 'intro_requested', label: 'Intro Requested', accent: 'border-t-va-amber' },
  { key: 'intro_made', label: 'Intro Made', accent: 'border-t-va-blue' },
  { key: 'meeting_scheduled', label: 'Meeting Set', accent: 'border-t-va-green' },
  { key: 'in_diligence', label: 'In Diligence', accent: 'border-t-va-navy' },
  { key: 'term_sheet', label: 'Term Sheet', accent: 'border-t-va-accent' },
];

interface PipelineKanbanProps {
  investors: DealInvestor[];
  onStageChange: (investorName: string, newStage: PipelineStage) => void;
  onNextStepChange: (investorName: string, nextStep: string) => void;
}

export function PipelineKanban({ investors, onStageChange, onNextStepChange }: PipelineKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // prevent accidental drags
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const investorName = String(active.id);
    const newStage = String(over.id) as PipelineStage;

    const investor = investors.find(i => i.name === investorName);
    if (!investor || investor.pipeline_stage === newStage) return;

    onStageChange(investorName, newStage);
  };

  const activeInvestor = activeId ? investors.find(i => i.name === activeId) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-3">
        {STAGES.map(stage => {
          const stageInvestors = investors.filter(i => i.pipeline_stage === stage.key);
          return (
            <Column key={stage.key} stage={stage.key} label={stage.label} accent={stage.accent} count={stageInvestors.length}>
              {stageInvestors.map(investor => (
                <DraggableCard
                  key={investor.name}
                  investor={investor}
                  onNextStepChange={onNextStepChange}
                  isDragging={activeId === investor.name}
                />
              ))}
            </Column>
          );
        })}
      </div>

      {/* Floating preview while dragging */}
      <DragOverlay>
        {activeInvestor ? <CardContent investor={activeInvestor} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// --- Column ---

function Column({
  stage,
  label,
  accent,
  count,
  children,
}: {
  stage: PipelineStage;
  label: string;
  accent: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-72 rounded-card border border-va-border border-t-4 bg-va-surface-2/50 transition-colors',
        accent,
        isOver && 'bg-va-navy/5 border-va-navy/30'
      )}
    >
      <div className="px-4 py-3 border-b border-va-border flex items-center justify-between">
        <h4 className="font-heading text-sm font-semibold text-va-navy">{label}</h4>
        <span className="text-xs font-body font-bold text-va-text-muted bg-va-surface px-2 py-0.5 rounded-full border border-va-border">
          {count}
        </span>
      </div>
      <div className="p-3 space-y-2 min-h-[6rem]">{children}</div>
    </div>
  );
}

// --- Draggable Card ---

function DraggableCard({
  investor,
  onNextStepChange,
  isDragging,
}: {
  investor: DealInvestor;
  onNextStepChange: (name: string, step: string) => void;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: investor.name });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <CardContent
        investor={investor}
        dragHandle={listeners}
        dragAttributes={attributes}
        onNextStepChange={onNextStepChange}
      />
    </div>
  );
}

// --- Card content (shared between live & drag overlay) ---

function CardContent({
  investor,
  dragHandle,
  dragAttributes,
  onNextStepChange,
  dragging,
}: {
  investor: DealInvestor;
  dragHandle?: Record<string, unknown>;
  dragAttributes?: Record<string, unknown>;
  onNextStepChange?: (name: string, step: string) => void;
  dragging?: boolean;
}) {
  const warmCount = investor.contacts.filter(c => c.is_warm).length;

  return (
    <div
      className={cn(
        'rounded-card border border-va-border bg-va-surface p-3 group',
        dragging ? 'shadow-xl cursor-grabbing rotate-2' : 'hover:shadow-sm hover:border-va-navy/20'
      )}
    >
      {/* Handle row */}
      <div className="flex items-start gap-2 mb-2">
        <div {...dragHandle} {...dragAttributes} className="flex-shrink-0 cursor-grab active:cursor-grabbing text-va-text-muted hover:text-va-navy mt-0.5">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-semibold text-va-navy leading-tight">{investor.name}</p>
          <p className="text-xs font-body text-va-text-muted mt-0.5 truncate">{investor.segment}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 text-xs font-body text-va-text-muted ml-6">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{investor.location.split(',')[0]}</span>
        {warmCount > 0 && (
          <span className="flex items-center gap-1 text-va-green font-semibold">
            <Zap className="h-3 w-3" />{warmCount}
          </span>
        )}
      </div>

      {/* Next step — editable inline */}
      {!dragging && onNextStepChange && (
        <div className="mt-2 ml-6">
          <input
            value={investor.next_step}
            onChange={(e) => onNextStepChange(investor.name, e.target.value)}
            placeholder="Next step..."
            onPointerDown={(e) => e.stopPropagation()}
            className="w-full px-2 py-1 border border-transparent hover:border-va-border focus:border-va-navy rounded bg-transparent text-xs font-body text-va-text-secondary focus:outline-none focus:ring-1 focus:ring-va-navy/20"
          />
        </div>
      )}

      {dragging && investor.next_step && (
        <p className="mt-2 ml-6 text-xs font-body text-va-text-secondary line-clamp-1">{investor.next_step}</p>
      )}
    </div>
  );
}
