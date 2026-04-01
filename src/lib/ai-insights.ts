import { stripInternalCodePrefix } from "@/lib/display-copy";
import {
  AssessmentBundle,
  DecisionExplainability
} from "@/models/types";
import { FinancialImpactModel } from "@/types/financial";

interface InsightWorkflow {
  currentStateLabel: string;
  nextStageLabel: string;
  currentOwnerLabel: string;
  primaryAction: {
    label: string;
    description: string;
    disabled: boolean;
    reasons: string[];
  };
}

export interface MeyarAIInsightInput {
  bundle: AssessmentBundle;
  explainability: DecisionExplainability;
  caseWorkflow: InsightWorkflow;
  financialImpact?: FinancialImpactModel;
}

const stripTrailingPunctuation = (value: string) => value.replace(/[.،؛:\s]+$/g, "").trim();

const humanBlocker = (input: MeyarAIInsightInput) => {
  const block = input.explainability.approvalBlocks[0];

  if (!block) {
    return null;
  }

  return {
    title: stripInternalCodePrefix(block.title),
    reason: stripTrailingPunctuation(block.reason || block.requiredAction),
    action: stripTrailingPunctuation(block.requiredAction)
  };
};

const humanDriver = (value?: string) => (value ? stripTrailingPunctuation(value) : null);

export const generateDecisionExplanation = (input: MeyarAIInsightInput) => {
  const blocker = humanBlocker(input);
  const positiveDriver = input.explainability.topPositiveDrivers[0];
  const negativeDriver = input.explainability.topNegativeDrivers[0];
  const lines = [
    blocker
      ? `القرار الحالي ${input.bundle.report.recommendation} لأن ${blocker.reason}.`
      : `القرار الحالي ${input.bundle.report.recommendation} لأن الشروط الأساسية اكتملت جزئيًا فقط في هذه المرحلة.`,
    negativeDriver
      ? `${stripInternalCodePrefix(negativeDriver.title)} هو العامل الأكثر خفضًا للجاهزية الآن.`
      : null,
    positiveDriver
      ? `${stripInternalCodePrefix(positiveDriver.title)} يبقي القرار قابلًا للتحسن عند إغلاق المانع الحالي.`
      : null
  ].filter(Boolean) as string[];

  return lines.slice(0, 3);
};

export const generateNextActionReason = (input: MeyarAIInsightInput) => {
  const blocker = humanBlocker(input);

  if (input.caseWorkflow.primaryAction.disabled) {
    return (
      humanDriver(input.caseWorkflow.primaryAction.reasons[0]) ??
      "يلزم إغلاق المتطلبات المفتوحة قبل تحريك المرحلة التالية."
    );
  }

  if (blocker) {
    return `لأن ${blocker.action} هو أقصر طريق للانتقال إلى ${input.caseWorkflow.nextStageLabel}.`;
  }

  return `لأن هذه الخطوة تنقل الحالة إلى ${input.caseWorkflow.nextStageLabel} دون فتح مسار إضافي.`;
};

const riskLabel = (value: AssessmentBundle["report"]["residualRiskLevel"]) => {
  if (value === "low") return "منخفضة";
  if (value === "medium") return "متوسطة";
  return "مرتفعة";
};

export const generateRiskNarrative = (input: MeyarAIInsightInput) => {
  const topBarrier = input.bundle.report.topBarriers[0];
  const topAction = input.bundle.report.topActions[0];
  const blocker = humanBlocker(input);
  const lines = [
    topBarrier
      ? `المخاطر ${riskLabel(input.bundle.report.residualRiskLevel)} الآن بسبب ${stripTrailingPunctuation(topBarrier.summary)}.`
      : `المخاطر ${riskLabel(input.bundle.report.residualRiskLevel)} في المرحلة الحالية.`,
    blocker
      ? `إغلاق ${blocker.title} هو أسرع خطوة لتخفيف الخطر المتبقي.`
      : null,
    topAction ? `${stripTrailingPunctuation(topAction.summary)} هو الإجراء الأكثر تأثيرًا الآن.` : null
  ].filter(Boolean) as string[];

  return lines.slice(0, 3);
};
