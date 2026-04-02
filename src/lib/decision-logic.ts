import { CaseRecord } from "@/lib/case-state";
import { stripInternalCodePrefix } from "@/lib/display-copy";
import { CaseStandardsEvaluation } from "@/lib/standards-types";
import { AssessmentBundle, DecisionExplainability } from "@/models/types";
import { EvidenceStrengthModel } from "@/types/evidence";
import { FinancialImpactModel } from "@/types/financial";
import {
  DecisionLogicItem,
  DecisionLogicStatus,
  DecisionLogicSummary
} from "@/types/decision-logic";

const coreCapabilityDimensionIds = [
  "digital-navigation",
  "visual-interface",
  "cognitive-load-management",
  "structured-communication"
] as const;

const cleanText = (value?: string | null) =>
  stripInternalCodePrefix(value).replace(/[.،؛:\s]+$/g, "").trim();

const resolveImpact = (
  status: DecisionLogicStatus,
  importance: "critical" | "supporting" | "evidence"
): DecisionLogicItem["impact"] => {
  if (status === "blocked") return "high";
  if (status === "partial") return importance === "supporting" ? "medium" : "high";
  return importance === "critical" ? "medium" : "low";
};

const buildJobFitItem = (bundle: AssessmentBundle): DecisionLogicItem => {
  const { taskFit, criticalCoverage } = bundle.report;
  const essentialTaskGaps = bundle.taskResults.filter(
    (task) => task.taskTier === "essential" && task.fitLevel === "gap"
  ).length;

  let status: DecisionLogicStatus = "blocked";
  if (taskFit >= 78 && criticalCoverage >= 76 && essentialTaskGaps === 0) {
    status = "positive";
  } else if (taskFit >= 64 && criticalCoverage >= 60) {
    status = "partial";
  }

  return {
    key: "job-fit",
    label: "ملاءمة الوظيفة",
    status,
    impact: resolveImpact(status, "critical"),
    summary:
      status === "positive"
        ? "الوظيفة قابلة للتنفيذ ضمن نطاقها الحالي."
        : status === "partial"
          ? "الوظيفة قابلة للتكييف لكن بعض المهام الأساسية ما زالت تحتاج مراجعة."
          : "صياغة الوظيفة الحالية ما زالت تحجب الاعتماد الكامل."
  };
};

const buildCapabilityFitItem = (bundle: AssessmentBundle): DecisionLogicItem => {
  const coreDimensions = bundle.profile.dimensions.filter((dimension) =>
    coreCapabilityDimensionIds.includes(
      dimension.id as (typeof coreCapabilityDimensionIds)[number]
    )
  );
  const strongDimensions = coreDimensions.filter((dimension) => dimension.score >= 70).length;
  const weakDimensions = coreDimensions.filter((dimension) => dimension.score < 58).length;

  let status: DecisionLogicStatus = "blocked";
  if (strongDimensions >= 3 && weakDimensions === 0) {
    status = "positive";
  } else if (strongDimensions >= 2 && weakDimensions <= 1) {
    status = "partial";
  }

  return {
    key: "capability-fit",
    label: "ملاءمة القدرات",
    status,
    impact: resolveImpact(status, "critical"),
    summary:
      status === "positive"
        ? "القدرات الأساسية متوفرة وتدعم المضي الحالي."
        : status === "partial"
          ? "القدرات الأساسية متوفرة جزئيًا وتدعم المضي بشروط."
          : "القدرات الحالية لا تغطي بعد متطلبات التنفيذ الأساسية."
  };
};

const buildEnvironmentReadinessItem = (bundle: AssessmentBundle): DecisionLogicItem => {
  const environmentBlockers = bundle.barriers.filter(
    (barrier) => barrier.type === "environment" || barrier.type === "tool"
  );
  const highEnvironmentBlockers = environmentBlockers.filter(
    (barrier) => barrier.severity === "high"
  ).length;

  let status: DecisionLogicStatus = "blocked";
  if (bundle.report.environmentFit >= 76 && highEnvironmentBlockers === 0) {
    status = "positive";
  } else if (bundle.report.environmentFit >= 60) {
    status = "partial";
  }

  return {
    key: "environment-readiness",
    label: "جاهزية البيئة",
    status,
    impact: resolveImpact(status, "critical"),
    summary:
      status === "positive"
        ? "بيئة العمل الحالية تدعم التنفيذ دون فجوة تشغيلية مؤثرة."
        : status === "partial"
          ? "بيئة العمل تحتاج تهيئة إضافية قبل الاعتماد."
          : "بيئة العمل الحالية تحجب الاستقرار قبل إغلاق التهيئة."
  };
};

const buildAccommodationFeasibilityItem = (
  bundle: AssessmentBundle
): DecisionLogicItem => {
  const { accommodationFeasibility } = bundle.report;
  const { barrierCoverage, items } = bundle.plan;

  let status: DecisionLogicStatus = "blocked";
  if (items.length > 0 && accommodationFeasibility >= 74 && barrierCoverage >= 74) {
    status = "positive";
  } else if (items.length > 0 && accommodationFeasibility >= 60) {
    status = "partial";
  }

  return {
    key: "accommodation-feasibility",
    label: "قابلية التكييف",
    status,
    impact: resolveImpact(status, "supporting"),
    summary:
      status === "positive"
        ? "التكييفات المقترحة كافية وقابلة للتطبيق مبدئيًا."
        : status === "partial"
          ? "التكييفات المقترحة كافية مبدئيًا لكنها تحتاج اعتمادًا تشغيليًا."
          : "خطة التكييف الحالية لا تكفي لإزالة المانع التشغيلي."
  };
};

const buildEvidenceReadinessItem = (
  standards: CaseStandardsEvaluation,
  evidenceStrength: EvidenceStrengthModel
): DecisionLogicItem => {
  const blockingEvidence =
    evidenceStrength.blockerCount > 0 || standards.counts["missing-evidence"] > 0;

  let status: DecisionLogicStatus = "blocked";
  if (
    evidenceStrength.level === "strong" &&
    evidenceStrength.pendingCount === 0 &&
    evidenceStrength.blockerCount === 0
  ) {
    status = "positive";
  } else if (!blockingEvidence && evidenceStrength.pendingCount <= 3) {
    status = "partial";
  }

  return {
    key: "evidence-readiness",
    label: "جاهزية الدليل",
    status,
    impact: resolveImpact(status, "evidence"),
    summary:
      status === "positive"
        ? "الأدلة الحالية كافية للدفاع عن القرار."
        : status === "partial"
          ? "الأدلة الحالية تدعم القرار جزئيًا وما زال بعضها يحتاج استكمالًا."
          : "حزمة الأدلة الحالية لا تكفي لإغلاق القرار دفاعيًا."
  };
};

const buildOverallNarrative = (
  items: DecisionLogicItem[],
  bundle: AssessmentBundle,
  explainability: DecisionExplainability,
  financialImpact: FinancialImpactModel
) => {
  const blockedItems = items.filter((item) => item.status === "blocked");
  const partialItems = items.filter((item) => item.status === "partial");
  const topBlocker = explainability.approvalBlocks[0];

  if (blockedItems.length > 0) {
    const blockedLabels = blockedItems
      .slice(0, 2)
      .map((item) => item.label)
      .join(" و");

    return `${bundle.report.recommendation} لأن ${blockedLabels} ما زالت تمنع الإغلاق الكامل، مع بقاء الأثر المالي ${financialImpact.financialSignalLabel.toLowerCase()}.`;
  }

  if (partialItems.length > 0) {
    const partialLabels = partialItems
      .slice(0, 2)
      .map((item) => item.label)
      .join(" و");

    return `${bundle.report.recommendation} لأن ${partialLabels} تحتاج استكمالًا محدودًا قبل رفع الحكم.`;
  }

  return topBlocker
    ? `${bundle.report.recommendation} والحالة قابلة للمضي لأن العناصر الأساسية متماسكة، مع بقاء متابعة واحدة على ${cleanText(topBlocker.title)}.`
    : `${bundle.report.recommendation} لأن الوظيفة والقدرات والبيئة والتكييف والدليل تبدو متماسكة في الحالة الحالية.`;
};

const buildUpliftActions = (
  explainability: DecisionExplainability,
  standards: CaseStandardsEvaluation
) => {
  const actions = [
    ...explainability.nextActions.map((action) => cleanText(action.requiredAction)),
    ...standards.blockers.map((blocker) => cleanText(blocker.rationale)),
    ...explainability.approvalBlocks.map((block) => cleanText(block.requiredAction))
  ].filter(Boolean) as string[];

  return Array.from(new Set(actions)).slice(0, 3);
};

const buildDecisionShiftHint = (
  explainability: DecisionExplainability,
  blockers: string[],
  upliftActions: string[]
) => {
  const closableScenario =
    explainability.scenarios.find((scenario) => scenario.closableNow) ??
    explainability.scenarios[0];

  if (!closableScenario) {
    return undefined;
  }

  if (blockers.length > 0) {
    return `إغلاق ${blockers[0]} ثم تنفيذ ${upliftActions[0] ?? "الإجراء التالي"} هو أقصر طريق لرفع القرار.`;
  }

  return `${closableScenario.title.replace(/^إذا\s*/u, "")} يرفع القرار إلى ${closableScenario.projectedDecision}.`;
};

export const buildDecisionLogicSummary = ({
  bundle,
  explainability,
  standards,
  financialImpact,
  evidenceStrength,
  caseRecord
}: {
  bundle: AssessmentBundle;
  explainability: DecisionExplainability;
  standards: CaseStandardsEvaluation;
  financialImpact: FinancialImpactModel;
  evidenceStrength: EvidenceStrengthModel;
  caseRecord: CaseRecord;
}): DecisionLogicSummary => {
  const items = [
    buildJobFitItem(bundle),
    buildCapabilityFitItem(bundle),
    buildEnvironmentReadinessItem(bundle),
    buildAccommodationFeasibilityItem(bundle),
    buildEvidenceReadinessItem(standards, evidenceStrength)
  ];

  const blockers = explainability.approvalBlocks
    .slice(0, caseRecord.state === "COMPLIANCE_REVIEW" ? 3 : 2)
    .map((block) => cleanText(block.title))
    .filter(Boolean);

  const upliftActions = buildUpliftActions(explainability, standards);

  return {
    overallNarrative: buildOverallNarrative(
      items,
      bundle,
      explainability,
      financialImpact
    ),
    items,
    blockers,
    upliftActions,
    decisionShiftHint: buildDecisionShiftHint(explainability, blockers, upliftActions)
  };
};
