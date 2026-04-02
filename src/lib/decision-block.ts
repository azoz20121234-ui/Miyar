import { stripInternalCodePrefix } from "@/lib/display-copy";
import { CaseStandardsEvaluation } from "@/lib/standards-types";
import { AssessmentBundle, DecisionExplainability } from "@/models/types";
import { EvidenceStrengthModel } from "@/types/evidence";
import { DecisionBlock, DecisionFactor } from "@/types/decision-block";

const cleanText = (value?: string | null) =>
  stripInternalCodePrefix(value).replace(/[.،؛:\s]+$/gu, "").trim();

const dedupe = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const buildJobFitFactor = (bundle: AssessmentBundle): DecisionFactor => {
  const essentialTaskGaps = bundle.taskResults.filter(
    (task) => task.taskTier === "essential" && task.fitLevel === "gap"
  ).length;

  if (
    bundle.report.taskFit >= 78 &&
    bundle.report.criticalCoverage >= 76 &&
    essentialTaskGaps === 0
  ) {
    return {
      label: "ملاءمة الوظيفة",
      status: "good",
      note: "الوظيفة قابلة للتنفيذ ضمن نطاقها الحالي."
    };
  }

  if (bundle.report.taskFit >= 64 && bundle.report.criticalCoverage >= 60) {
    return {
      label: "ملاءمة الوظيفة",
      status: "partial",
      note: "الوظيفة قابلة للتكييف لكن بعض المهام الأساسية ما زالت تحتاج مراجعة."
    };
  }

  return {
    label: "ملاءمة الوظيفة",
    status: "blocker",
    note: "صياغة الوظيفة الحالية ما زالت تحجب الاعتماد الكامل."
  };
};

const buildCapabilityFitFactor = (
  bundle: AssessmentBundle,
  explainability: DecisionExplainability
): DecisionFactor => {
  const capabilityBarrier = bundle.barriers.some(
    (barrier) => barrier.type === "task" && barrier.severity === "high"
  );
  const capabilityAction = explainability.nextActions.find(
    (action) => action.source === "accommodation" || action.source === "evidence"
  );

  if (!capabilityBarrier && bundle.report.criticalCoverage >= 76) {
    return {
      label: "ملاءمة القدرات",
      status: "good",
      note: "القدرات الأساسية متوفرة وتدعم المضي الحالي."
    };
  }

  if (bundle.report.criticalCoverage >= 60) {
    return {
      label: "ملاءمة القدرات",
      status: "partial",
      note:
        cleanText(capabilityAction?.expectedImpact) ||
        "القدرات الأساسية متوفرة جزئيًا وتدعم المضي بشروط."
    };
  }

  return {
    label: "ملاءمة القدرات",
    status: "blocker",
    note: "القدرات الحالية لا تغطي بعد متطلبات التنفيذ الأساسية."
  };
};

const buildEnvironmentFactor = (bundle: AssessmentBundle): DecisionFactor => {
  const highEnvironmentBlockers = bundle.barriers.filter(
    (barrier) =>
      (barrier.type === "environment" || barrier.type === "tool") &&
      barrier.severity === "high"
  ).length;

  if (bundle.report.environmentFit >= 76 && highEnvironmentBlockers === 0) {
    return {
      label: "جاهزية البيئة",
      status: "good",
      note: "بيئة العمل الحالية تدعم التنفيذ دون فجوة تشغيلية مؤثرة."
    };
  }

  if (bundle.report.environmentFit >= 60) {
    return {
      label: "جاهزية البيئة",
      status: "partial",
      note: "بيئة العمل تحتاج تهيئة إضافية قبل الاعتماد."
    };
  }

  return {
    label: "جاهزية البيئة",
    status: "blocker",
    note: "بيئة العمل الحالية تحجب الاستقرار قبل إغلاق التهيئة."
  };
};

const buildAccommodationFactor = (bundle: AssessmentBundle): DecisionFactor => {
  if (
    bundle.plan.items.length > 0 &&
    bundle.report.accommodationFeasibility >= 74 &&
    bundle.plan.barrierCoverage >= 74
  ) {
    return {
      label: "قابلية التكييف",
      status: "good",
      note: "التكييفات المقترحة كافية وقابلة للتطبيق مبدئيًا."
    };
  }

  if (bundle.plan.items.length > 0 && bundle.report.accommodationFeasibility >= 60) {
    return {
      label: "قابلية التكييف",
      status: "partial",
      note: "التكييفات المقترحة كافية مبدئيًا لكنها تحتاج اعتمادًا تشغيليًا."
    };
  }

  return {
    label: "قابلية التكييف",
    status: "blocker",
    note: "خطة التكييف الحالية لا تكفي لإزالة المانع التشغيلي."
  };
};

const buildEvidenceFactor = (
  standards: CaseStandardsEvaluation,
  evidenceStrength: EvidenceStrengthModel
): DecisionFactor => {
  const blockingEvidence =
    evidenceStrength.blockerCount > 0 || standards.counts["missing-evidence"] > 0;

  if (
    evidenceStrength.level === "strong" &&
    evidenceStrength.pendingCount === 0 &&
    evidenceStrength.blockerCount === 0
  ) {
    return {
      label: "قوة الدليل",
      status: "good",
      note: "الأدلة الحالية كافية للدفاع عن القرار."
    };
  }

  if (!blockingEvidence && evidenceStrength.pendingCount <= 3) {
    return {
      label: "قوة الدليل",
      status: "partial",
      note: "الأدلة الحالية تدعم القرار جزئيًا وما زال بعضها يحتاج استكمالًا."
    };
  }

  return {
    label: "قوة الدليل",
    status: "blocker",
    note: "حزمة الأدلة الحالية لا تكفي لإغلاق القرار دفاعيًا."
  };
};

const buildUpliftActions = (
  explainability: DecisionExplainability,
  standards: CaseStandardsEvaluation
) => {
  const actions = dedupe([
    ...explainability.nextActions.map((action) => cleanText(action.requiredAction)),
    ...explainability.approvalBlocks.map((block) => cleanText(block.requiredAction)),
    ...standards.blockers.map((blocker) => cleanText(blocker.rationale))
  ]);

  return actions.slice(0, 3);
};

export const buildDecisionBlock = ({
  bundle,
  explainability,
  standards,
  evidenceStrength
}: {
  bundle: AssessmentBundle;
  explainability: DecisionExplainability;
  standards: CaseStandardsEvaluation;
  evidenceStrength: EvidenceStrengthModel;
}): DecisionBlock => ({
  factors: [
    buildJobFitFactor(bundle),
    buildCapabilityFitFactor(bundle, explainability),
    buildEnvironmentFactor(bundle),
    buildAccommodationFactor(bundle),
    buildEvidenceFactor(standards, evidenceStrength)
  ],
  upliftActions: buildUpliftActions(explainability, standards)
});
