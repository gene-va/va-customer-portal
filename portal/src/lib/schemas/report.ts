import { z } from "zod";

// --- Zod schemas for JSON validation on upload ---

const companySchema = z.object({
  name: z.string(),
  tagline: z.string(),
  location: z.string(),
  lead_asset: z.string(),
  indication: z.string(),
  fda_status: z.string(),
  prior_clinical: z.string(),
  target_raise: z.string(),
});

const summarySchema = z.object({
  total_investors: z.number(),
  warm_leads: z.number(),
  avg_fit_score: z.number(),
  geographic_match: z.string(),
});

const warmLeadSchema = z.object({
  name: z.string(),
  role: z.string(),
  connected_via: z.string(),
});

const scoreBreakdownSchema = z.object({
  category: z.string(),
  weight: z.number(),
  score: z.number(),
});

const portfolioCompanySchema = z.object({
  name: z.string(),
  detail: z.string(),
  tag: z.string(),
  tag_type: z.string(),
});

const investorSchema = z.object({
  name: z.string(),
  segment: z.string(),
  segment_type: z.string(),
  location: z.string(),
  aum: z.string(),
  fit_score: z.number(),
  tier: z.string(),
  score_breakdown: z.array(scoreBreakdownSchema),
  company_info: z.record(z.string().nullable()),
  portfolio: z.array(portfolioCompanySchema),
  fit_analysis: z.object({
    headline: z.string(),
    points: z.array(z.string()),
    investment_capacity: z.string(),
  }),
  pitch: z.object({
    target_label: z.string(),
    intro: z.string(),
    bullets: z.array(z.string()),
  }),
});

const synergyCardSchema = z.object({
  investor_name: z.string(),
  headline_stat: z.string(),
  summary: z.string(),
  portfolio: z.array(portfolioCompanySchema),
  track_record: z.string(),
});

const synergiesSchema = z.object({
  insight_title: z.string(),
  insight_body: z.string(),
  cards: z.array(synergyCardSchema),
});

const decisionMakerSchema = z.object({
  investor_name: z.string(),
  name: z.string(),
  title: z.string(),
  bio: z.string(),
  connected: z.boolean(),
  connected_via: z.string(),
  segment_type: z.string(),
});

const strategyStepSchema = z.object({
  week: z.string(),
  title: z.string(),
  details: z.string(),
});

const strategySchema = z.object({
  title: z.string(),
  steps: z.array(strategyStepSchema),
});

const platformCapabilitySchema = z.object({
  title: z.string(),
  points: z.array(z.string()),
});

const metadataSchema = z.object({
  generated_date: z.string(),
  prepared_for: z.string(),
  attendees: z.array(z.string()),
});

export const reportSchema = z.object({
  company: companySchema,
  summary: summarySchema,
  warm_leads: z.array(warmLeadSchema),
  investors: z.array(investorSchema),
  synergies: synergiesSchema.optional(),
  decision_makers: z.array(decisionMakerSchema),
  strategy: strategySchema,
  platform_capabilities: z.array(platformCapabilitySchema).optional(),
  metadata: metadataSchema,
});

export type ReportData = z.infer<typeof reportSchema>;
export type Investor = ReportData["investors"][number];
export type WarmLead = ReportData["warm_leads"][number];
export type DecisionMaker = ReportData["decision_makers"][number];
export type ScoreBreakdown = Investor["score_breakdown"][number];
export type StrategyStep = ReportData["strategy"]["steps"][number];

// --- V2: Deal Room schema ---

export type PipelineStage =
  | "identified"
  | "intro_requested"
  | "intro_made"
  | "meeting_scheduled"
  | "in_diligence"
  | "term_sheet";

export interface DealContact {
  name: string;
  title: string;
  connected_via: string | null;
  is_warm: boolean;
}

export interface DealInvestor {
  name: string;
  location: string;
  aum: string;
  segment: string;
  pipeline_stage: PipelineStage;
  why_they_fit: string; // narrative paragraph, not bullets
  portfolio_proof: string; // "They backed X which exited for $Y — your Z is the next chapter"
  contacts: DealContact[];
  pitch_angle: string; // the opening line for the meeting
  pitch_points: string[]; // 3-4 key talking points
  check_size: string;
  next_step: string; // "Helena intros you to Ariel this week"
  notes?: string;
}

export interface WeeklyAction {
  priority: "high" | "medium" | "low";
  investor_name: string;
  action: string; // "Helena to intro you to Ariel Kantor (Principal)"
  context: string; // "Reference their Monteris Medical brain tumor investment"
  due: string; // "This week", "Next week", etc.
  completed: boolean;
}

export interface DealRoomData {
  version: "v2";
  company: {
    name: string;
    tagline: string;
    location: string;
    target_raise: string;
    stage: string;
    lead_asset: string;
  };
  headline: string; // "3 investors, 5 warm intros, 1 term sheet target by Q2"
  weekly_actions: WeeklyAction[];
  investors: DealInvestor[];
  pipeline_summary: {
    total: number;
    with_warm_intros: number;
    meetings_scheduled: number;
    in_diligence: number;
  };
  strategy_narrative: string; // 2-3 paragraph overview of the fundraising strategy
  metadata: {
    generated_date: string;
    prepared_for: string;
    va_lead: string;
  };
}

// Type guard
export function isDealRoomData(data: unknown): data is DealRoomData {
  return (
    typeof data === "object" &&
    data !== null &&
    "version" in data &&
    (data as { version: string }).version === "v2"
  );
}
