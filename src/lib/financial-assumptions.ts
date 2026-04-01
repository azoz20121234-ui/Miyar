import { FinancialAssumptions } from "@/types/financial";

export const FINANCIAL_ASSUMPTIONS: FinancialAssumptions = {
  note: "تقدير مالي أولي مبني على افتراضات تشغيلية قابلة للتعديل، ولا يمثل تسعيرًا سوقيًا أو محاسبيًا نهائيًا.",
  dailyOperatingCostSarByComplexity: {
    low: 650,
    medium: 1100,
    high: 1850
  },
  rehiringCostSarByComplexity: {
    low: 9000,
    medium: 15500,
    high: 24000
  },
  productivityLossDaysByComplexity: {
    low: 12,
    medium: 20,
    high: 28
  },
  ghostHiringExposureDaysByComplexity: {
    low: 18,
    medium: 28,
    high: 40
  },
  externalAccommodationBaseCostSarByLevel: {
    low: 1400,
    medium: 4200,
    high: 8800
  },
  reviewDelayDaysByState: {
    DRAFT: 3,
    UNDER_ASSESSMENT: 5,
    MANAGER_REVIEW: 4,
    COMPLIANCE_REVIEW: 3,
    APPROVED: 0,
    REJECTED: 0,
    NEEDS_REVISION: 6
  },
  blockerResolutionDays: 3,
  missingEvidenceResolutionDays: 2,
  needsReviewResolutionDays: 1,
  reassessmentCostSar: 3200,
  processFlexAllowanceRate: 0.08,
  riskAvoidanceConfidenceFloor: 0.68,
  riskAvoidanceConfidenceCeiling: 0.94
};
