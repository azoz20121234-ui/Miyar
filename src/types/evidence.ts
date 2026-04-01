export type EvidenceStrengthLevel = "strong" | "moderate" | "limited";

export interface EvidenceStrengthItem {
  id: string;
  title: string;
  summary: string;
  ownerLabel: string;
  statusLabel: string;
  blocker: boolean;
}

export interface EvidenceStrengthModel {
  score: number;
  level: EvidenceStrengthLevel;
  label: string;
  defenseLabel: string;
  summary: string;
  verifiedCount: number;
  pendingCount: number;
  blockerCount: number;
  verifiedItems: EvidenceStrengthItem[];
  pendingItems: EvidenceStrengthItem[];
  assumptionsNote: string;
}
