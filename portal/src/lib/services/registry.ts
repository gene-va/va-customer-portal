// Registry of every service block the portal supports.
// Adding a new block:
//  1. Add the service_type literal below + a SERVICES entry
//  2. Add to the CHECK constraint in schema.sql
//  3. (Optional) Wire a bespoke renderer / admin editor in the dispatch switch
//     of /app/report/[id]/page.tsx and /app/admin/reports/[id]/page.tsx.
//     Without it, the generic fallback components are used.

export type ServiceType =
  | 'asset_matching'
  | 'investment_matching'
  | 'market_access'
  | 'other';

export type CampaignType = 'event' | 'general';

export interface ServicePhase {
  value: string;
  label: string;
  order: number;
}

export interface ServiceDef {
  type: ServiceType;
  label: string;
  shortDescription: string;
  phases: ServicePhase[];
  /** Whether there's a bespoke renderer wired in page files. If false, use generic. */
  hasBespokeRenderer: boolean;
}

const REVIEW_OUTREACH_PHASES: ServicePhase[] = [
  { value: 'review', label: 'Review', order: 0 },
  { value: 'outreach', label: 'Outreach', order: 1 },
];

export const SERVICES: Record<ServiceType, ServiceDef> = {
  asset_matching: {
    type: 'asset_matching',
    label: 'Asset Matching',
    shortDescription: 'Companies that need your platform or capacity.',
    phases: REVIEW_OUTREACH_PHASES,
    hasBespokeRenderer: true,
  },
  investment_matching: {
    type: 'investment_matching',
    label: 'Investment Matching',
    shortDescription: 'Investor targeting for your fundraise.',
    phases: REVIEW_OUTREACH_PHASES,
    hasBespokeRenderer: true,
  },
  market_access: {
    type: 'market_access',
    label: 'Market Access',
    shortDescription: 'Regulatory, payer, and KOL prospects.',
    phases: REVIEW_OUTREACH_PHASES,
    hasBespokeRenderer: false,
  },
  other: {
    type: 'other',
    label: 'Other',
    shortDescription: 'Custom service block.',
    phases: REVIEW_OUTREACH_PHASES,
    hasBespokeRenderer: false,
  },
};

export const SERVICE_TYPE_VALUES: ServiceType[] = [
  'asset_matching',
  'investment_matching',
  'market_access',
  'other',
];

export function isServiceType(v: unknown): v is ServiceType {
  return typeof v === 'string' && (SERVICE_TYPE_VALUES as string[]).includes(v);
}

export function getService(type: ServiceType): ServiceDef {
  return SERVICES[type];
}

export function serviceLabel(type: ServiceType): string {
  return SERVICES[type]?.label ?? type;
}

export function phasesFor(type: ServiceType): ServicePhase[] {
  return SERVICES[type].phases;
}
