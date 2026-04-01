import { CaseRecord } from "@/lib/case-state";
import {
  complexityLabelMap,
  ExpectedAccommodationLevel,
  ExternalCandidate,
  ExternalHandoffRecord,
  ExternalJob
} from "@/lib/external-handoff";
import { FINANCIAL_ASSUMPTIONS } from "@/lib/financial-assumptions";
import { CaseStandardsEvaluation } from "@/lib/standards-types";
import {
  AssessmentBundle,
  DecisionExplainability
} from "@/models/types";
import {
  EstimatedDecisionROIBand,
  ExternalFinancialPreview,
  FinancialImpactModel,
  FinancialSignalLevel,
  FinancialSurfaceTone,
  RetentionImpactLevel
} from "@/types/financial";

type ComplexityBand = keyof typeof FINANCIAL_ASSUMPTIONS.dailyOperatingCostSarByComplexity;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const roundCurrency = (value: number) => Math.max(0, Math.round(value));

const formatSar = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0
  }).format(value);

const retentionImpactLabelMap: Record<RetentionImpactLevel, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع"
};

const estimatedDecisionROILabelMap: Record<EstimatedDecisionROIBand, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع"
};

const signalToneMap: Record<FinancialSignalLevel, FinancialSurfaceTone> = {
  promising: "positive",
  moderate: "watch",
  sensitive: "risk"
};

const signalLabelMap: Record<FinancialSignalLevel, string> = {
  promising: "أثر مالي واعد",
  moderate: "أثر مالي متوسط",
  sensitive: "أثر مالي حساس"
};

const resolveComplexityBand = (
  bundle?: AssessmentBundle,
  externalHandoff?: ExternalHandoffRecord | null
): ComplexityBand => {
  if (externalHandoff) {
    return externalHandoff.job.complexity;
  }

  if (!bundle) {
    return "medium";
  }

  const taskDemand =
    bundle.job.tasks.length > 0
      ? bundle.job.tasks.reduce((sum, task) => {
          return (
            sum +
            task.intensity * 14 +
            task.cognitiveRequirement * 0.28 +
            task.digitalNavigationRequirement * 0.22
          );
        }, 0) / bundle.job.tasks.length
      : 55;

  const riskLift = bundle.job.environment.risks.length * 4;
  const score = taskDemand + riskLift;

  if (score >= 78) return "high";
  if (score >= 58) return "medium";
  return "low";
};

const resolveRetentionImpact = (
  finalReadiness: number,
  barrierCoverage: number,
  readinessLift: number
): RetentionImpactLevel => {
  if (finalReadiness >= 80 && barrierCoverage >= 78 && readinessLift >= 10) {
    return "high";
  }

  if (finalReadiness >= 66 && barrierCoverage >= 58) {
    return "medium";
  }

  return "low";
};

const resolveWrongDecisionMultiplier = (
  finalReadiness: number,
  blockers: number,
  fakeRoleRiskScore: number,
  criticalCoverage: number
) =>
  clamp(
    0.94 +
      (100 - finalReadiness) / 180 +
      Math.min(blockers, 4) * 0.03 +
      fakeRoleRiskScore / 420 +
      Math.max(0, 75 - criticalCoverage) / 300,
    0.92,
    1.34
  );

const resolveEstimatedDecisionROIBand = (estimatedDecisionROI: number): EstimatedDecisionROIBand => {
  if (estimatedDecisionROI >= 180) return "high";
  if (estimatedDecisionROI >= 60) return "medium";
  return "low";
};

const resolveFinancialSignal = (
  estimatedRiskAvoidanceValue: number,
  directAccommodationCost: number,
  delayCost: number,
  wrongDecisionCost: number
): FinancialSignalLevel => {
  const costBase = Math.max(1, directAccommodationCost);
  const valueRatio = estimatedRiskAvoidanceValue / costBase;

  if (valueRatio >= 2.2 && delayCost <= wrongDecisionCost * 0.7) {
    return "promising";
  }

  if (valueRatio >= 1.15) {
    return "moderate";
  }

  return "sensitive";
};

const buildExecutiveConclusion = (
  directAccommodationCost: number,
  delayCost: number,
  wrongDecisionCost: number
) => {
  const highestAlternative = Math.max(delayCost, wrongDecisionCost);

  if (directAccommodationCost <= highestAlternative * 0.45) {
    return "تنفيذ التهيئة الآن أقل كلفة من إبقاء الحالة معلقة أو معالجة أثر تشغيل غير مناسب لاحقًا.";
  }

  if (directAccommodationCost <= highestAlternative * 0.75) {
    return "الأثر المالي يميل لصالح التنفيذ المبكر، حتى مع بقاء بعض الحساسية في التكلفة أو التوقيت.";
  }

  return "الأثر المالي يحتاج ضبطًا أدق للتكلفة والزمن، لكنه يظل قراءة تفسيرية للحكم التشغيلي لا بديلًا عنه.";
};

const fakeRoleRiskScoreFromBundle = (bundle: AssessmentBundle) =>
  bundle.report.signals.find((signal) => signal.id === "fake-role-risk")?.score ?? 34;

export const buildFinancialImpactModel = ({
  bundle,
  standards,
  explainability,
  caseRecord,
  externalHandoff
}: {
  bundle: AssessmentBundle;
  standards: CaseStandardsEvaluation;
  explainability: DecisionExplainability;
  caseRecord: CaseRecord;
  externalHandoff: ExternalHandoffRecord | null;
}): FinancialImpactModel => {
  const complexityBand = resolveComplexityBand(bundle, externalHandoff);
  const dailyOperatingCostSar =
    FINANCIAL_ASSUMPTIONS.dailyOperatingCostSarByComplexity[complexityBand];
  const directAccommodationCost = roundCurrency(
    bundle.plan.totalCostRangeSar.midpoint * (1 + FINANCIAL_ASSUMPTIONS.processFlexAllowanceRate)
  );

  const estimatedDelayDays =
    caseRecord.state === "APPROVED" || caseRecord.state === "REJECTED"
      ? 0
      : clamp(
          FINANCIAL_ASSUMPTIONS.reviewDelayDaysByState[caseRecord.state] +
            standards.blockers.length * FINANCIAL_ASSUMPTIONS.blockerResolutionDays +
            standards.counts["missing-evidence"] *
              FINANCIAL_ASSUMPTIONS.missingEvidenceResolutionDays +
            standards.counts["needs-review"] *
              FINANCIAL_ASSUMPTIONS.needsReviewResolutionDays +
            Math.round(bundle.plan.maxImplementationDays * 0.35),
          2,
          45
        );

  const delayCost = roundCurrency(estimatedDelayDays * dailyOperatingCostSar);
  const fakeRoleRiskScore = fakeRoleRiskScoreFromBundle(bundle);
  const wrongDecisionMultiplier = resolveWrongDecisionMultiplier(
    bundle.report.finalReadiness,
    explainability.approvalBlocks.length,
    fakeRoleRiskScore,
    bundle.report.criticalCoverage
  );
  const wrongDecisionCost = roundCurrency(
    (
      FINANCIAL_ASSUMPTIONS.rehiringCostSarByComplexity[complexityBand] +
      dailyOperatingCostSar *
        FINANCIAL_ASSUMPTIONS.productivityLossDaysByComplexity[complexityBand] +
      FINANCIAL_ASSUMPTIONS.reassessmentCostSar
    ) * wrongDecisionMultiplier
  );

  const avoidedGhostHiringCost = roundCurrency(
    dailyOperatingCostSar *
      FINANCIAL_ASSUMPTIONS.ghostHiringExposureDaysByComplexity[complexityBand] *
      (0.42 + fakeRoleRiskScore / 100) *
      0.62
  );

  const confidenceFactor = clamp(
    FINANCIAL_ASSUMPTIONS.riskAvoidanceConfidenceFloor +
      bundle.report.confidence / 250 +
      standards.overview.completionRate / 500,
    FINANCIAL_ASSUMPTIONS.riskAvoidanceConfidenceFloor,
    FINANCIAL_ASSUMPTIONS.riskAvoidanceConfidenceCeiling
  );

  const estimatedRiskAvoidanceValue = roundCurrency(
    (
      wrongDecisionCost * 0.52 +
      avoidedGhostHiringCost * 0.8 +
      delayCost * 0.46
    ) * confidenceFactor
  );

  const estimatedDecisionROI = roundCurrency(
    ((estimatedRiskAvoidanceValue - Math.max(1, directAccommodationCost)) /
      Math.max(1, directAccommodationCost)) *
      100
  );

  const retentionImpactLevel = resolveRetentionImpact(
    bundle.report.finalReadiness,
    bundle.plan.barrierCoverage,
    bundle.report.readinessDelta
  );
  const estimatedDecisionROIBand =
    resolveEstimatedDecisionROIBand(estimatedDecisionROI);
  const financialSignalLevel = resolveFinancialSignal(
    estimatedRiskAvoidanceValue,
    directAccommodationCost,
    delayCost,
    wrongDecisionCost
  );

  return {
    directAccommodationCost,
    delayCost,
    wrongDecisionCost,
    avoidedGhostHiringCost,
    retentionImpactLevel,
    estimatedRiskAvoidanceValue,
    estimatedDecisionROI,
    estimatedDecisionROIBand,
    financialSignalLevel,
    financialSignalLabel: signalLabelMap[financialSignalLevel],
    financialSignalTone: signalToneMap[financialSignalLevel],
    dailyOperatingCostSar,
    estimatedDelayDays,
    summary:
      financialSignalLevel === "promising"
        ? "اقتصاديًا، يبدو التنفيذ المبكر أقل عبئًا من ترك الحالة معلقة أو تأجيل التهيئة."
        : financialSignalLevel === "moderate"
          ? "الأثر المالي مقنع، لكنه يبقى مرتبطًا بسرعة الإغلاق والتنفيذ بعد صدور الحكم التشغيلي."
          : "الأثر المالي حساس حاليًا ويحتاج إحكام الأدلة أو خفض كلفة التنفيذ، دون أن يغيّر الحكم الصادر من Meyar Core.",
    executionScenario: `تنفيذ التكييف الآن يقيد الكلفة المباشرة عند ${formatSar(
      directAccommodationCost
    )} مع أثر استمرارية ${retentionImpactLabelMap[retentionImpactLevel]}.`,
    delayScenario:
      estimatedDelayDays > 0
        ? `كل تأخير متوقع بنحو ${estimatedDelayDays} أيام يرفع العبء التشغيلي إلى ${formatSar(delayCost)} تقريبًا.`
        : "لا توجد كلفة تأخير مباشرة في المرحلة الحالية.",
    wrongDecisionScenario: `قرار غير مناسب قد يرفع الكلفة إلى ${formatSar(
      wrongDecisionCost
    )} بين إعادة التوظيف وفقدان الإنتاجية وإعادة التقييم.`,
    executiveConclusion: buildExecutiveConclusion(
      directAccommodationCost,
      delayCost,
      wrongDecisionCost
    ),
    assumptionsNote: `${FINANCIAL_ASSUMPTIONS.note} هذا القسم يفسر الأثر الاقتصادي للحكم التشغيلي ولا يغيّر القرار الصادر من Meyar Core.`
  };
};

export const buildExternalFinancialPreview = ({
  candidate,
  job,
  expectedAccommodationLevel
}: {
  candidate: ExternalCandidate;
  job: ExternalJob;
  expectedAccommodationLevel: ExpectedAccommodationLevel;
}): ExternalFinancialPreview => {
  const dailyOperatingCostSar =
    FINANCIAL_ASSUMPTIONS.dailyOperatingCostSarByComplexity[job.complexity];
  const directAccommodationCost = roundCurrency(
    FINANCIAL_ASSUMPTIONS.externalAccommodationBaseCostSarByLevel[
      expectedAccommodationLevel
    ] + job.risks.length * 260
  );
  const delayDays = clamp(
    (job.complexity === "high" ? 9 : job.complexity === "medium" ? 6 : 4) +
      Math.max(0, 2 - candidate.evidence.length) * 2,
    3,
    18
  );
  const delayCost = roundCurrency(delayDays * dailyOperatingCostSar);
  const wrongDecisionCost = roundCurrency(
    (
      FINANCIAL_ASSUMPTIONS.rehiringCostSarByComplexity[job.complexity] +
      dailyOperatingCostSar *
        FINANCIAL_ASSUMPTIONS.productivityLossDaysByComplexity[job.complexity] +
      FINANCIAL_ASSUMPTIONS.reassessmentCostSar
    ) *
      (candidate.capabilityScore >= 78 ? 0.92 : candidate.capabilityScore >= 64 ? 1.02 : 1.12)
  );
  const avoidedGhostHiringCost = roundCurrency(
    dailyOperatingCostSar *
      FINANCIAL_ASSUMPTIONS.ghostHiringExposureDaysByComplexity[job.complexity] *
      (0.56 + job.criticalTasks.length * 0.04)
  );
  const estimatedRiskAvoidanceValue = roundCurrency(
    wrongDecisionCost * 0.42 + avoidedGhostHiringCost * 0.72 + delayCost * 0.4
  );
  const retentionImpactLevel: RetentionImpactLevel =
    candidate.capabilityScore >= 80 && expectedAccommodationLevel !== "high"
      ? "high"
      : candidate.capabilityScore >= 64
        ? "medium"
        : "low";
  const financialSignalLevel = resolveFinancialSignal(
    estimatedRiskAvoidanceValue,
    directAccommodationCost,
    delayCost,
    wrongDecisionCost
  );

  return {
    directAccommodationCost,
    delayCost,
    estimatedRiskAvoidanceValue,
    financialSignalLevel,
    financialSignalLabel: signalLabelMap[financialSignalLevel],
    financialSignalTone: signalToneMap[financialSignalLevel],
    retentionImpactLevel,
    summary:
      financialSignalLevel === "promising"
        ? `تمهيديًا، تعقيد الوظيفة ${complexityLabelMap[job.complexity]} والتكييف المتوقع لا يبدوان عبئًا أعلى من المخاطر المتجنبة.`
        : financialSignalLevel === "moderate"
          ? `تمهيديًا، القيمة المالية موجودة لكنها قراءة أثر فقط قبل دخول الحالة إلى نواة Meyar.`
          : `تمهيديًا، الحساسية المالية أعلى وتحتاج الحالة ضبطًا أفضل، دون أن يكون هذا بديلًا عن الحكم التشغيلي.`,
    assumptionsNote: `${FINANCIAL_ASSUMPTIONS.note} هذا التقدير يشرح الأثر المالي التمهيدي فقط، ولا يقرر بديلًا عن Meyar Core.`
  };
};

export const retentionImpactLevelLabel = (value: RetentionImpactLevel) =>
  retentionImpactLabelMap[value];

export const estimatedDecisionROIBandLabel = (value: EstimatedDecisionROIBand) =>
  estimatedDecisionROILabelMap[value];
