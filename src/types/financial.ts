export type FinancialSurfaceTone = "positive" | "watch" | "risk" | "neutral";
export type RetentionImpactLevel = "low" | "medium" | "high";
export type EstimatedDecisionROIBand = "high" | "medium" | "low";
export type FinancialSignalLevel = "promising" | "moderate" | "sensitive";

export interface FinancialAssumptions {
  note: string;
  dailyOperatingCostSarByComplexity: Record<"low" | "medium" | "high", number>;
  rehiringCostSarByComplexity: Record<"low" | "medium" | "high", number>;
  productivityLossDaysByComplexity: Record<"low" | "medium" | "high", number>;
  ghostHiringExposureDaysByComplexity: Record<"low" | "medium" | "high", number>;
  externalAccommodationBaseCostSarByLevel: Record<"low" | "medium" | "high", number>;
  reviewDelayDaysByState: Record<
    | "DRAFT"
    | "UNDER_ASSESSMENT"
    | "MANAGER_REVIEW"
    | "COMPLIANCE_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "NEEDS_REVISION",
    number
  >;
  blockerResolutionDays: number;
  missingEvidenceResolutionDays: number;
  needsReviewResolutionDays: number;
  reassessmentCostSar: number;
  processFlexAllowanceRate: number;
  riskAvoidanceConfidenceFloor: number;
  riskAvoidanceConfidenceCeiling: number;
}

export interface FinancialImpactModel {
  directAccommodationCost: number;
  delayCost: number;
  wrongDecisionCost: number;
  avoidedGhostHiringCost: number;
  retentionImpactLevel: RetentionImpactLevel;
  estimatedRiskAvoidanceValue: number;
  estimatedDecisionROI: number;
  estimatedDecisionROIBand: EstimatedDecisionROIBand;
  financialSignalLevel: FinancialSignalLevel;
  financialSignalLabel: string;
  financialSignalTone: FinancialSurfaceTone;
  dailyOperatingCostSar: number;
  estimatedDelayDays: number;
  summary: string;
  executionScenario: string;
  delayScenario: string;
  wrongDecisionScenario: string;
  executiveConclusion: string;
  assumptionsNote: string;
}

export interface ExternalFinancialPreview {
  directAccommodationCost: number;
  delayCost: number;
  estimatedRiskAvoidanceValue: number;
  financialSignalLevel: FinancialSignalLevel;
  financialSignalLabel: string;
  financialSignalTone: FinancialSurfaceTone;
  retentionImpactLevel: RetentionImpactLevel;
  assumptionsNote: string;
  summary: string;
}
