export interface DecisionFactor {
  label: string;
  status: "good" | "partial" | "blocker";
  note: string;
}

export interface DecisionBlock {
  factors: DecisionFactor[];
  upliftActions: string[];
}
