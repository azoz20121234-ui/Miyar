export type DecisionLogicStatus = "positive" | "partial" | "blocked";

export interface DecisionLogicItem {
  key:
    | "job-fit"
    | "capability-fit"
    | "environment-readiness"
    | "accommodation-feasibility"
    | "evidence-readiness";
  label: string;
  status: DecisionLogicStatus;
  summary: string;
  impact: "high" | "medium" | "low";
}

export interface DecisionLogicSummary {
  overallNarrative: string;
  items: DecisionLogicItem[];
  blockers: string[];
  upliftActions: string[];
  decisionShiftHint?: string;
}
