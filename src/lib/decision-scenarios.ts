import { CaseStandardsEvaluation } from "@/lib/standards-types";
import {
  AssessmentBundle,
  BarrierSeverity,
  DecisionShiftScenario
} from "@/models/types";

import { APPROVAL_READINESS_THRESHOLD, evaluateApprovalProjection } from "./decision-thresholds";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const lowerRisk = (
  risk: BarrierSeverity,
  steps: number
): BarrierSeverity => {
  const order: BarrierSeverity[] = ["high", "medium", "low"];
  const currentIndex = order.indexOf(risk);
  const nextIndex = Math.min(order.length - 1, currentIndex + steps);
  return order[nextIndex];
};

export const buildDecisionScenarios = (
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation
): DecisionShiftScenario[] => {
  const blockerChecks = standards.checks.filter(
    (check) => check.blocker && check.status !== "passed"
  );
  const missingEvidenceChecks = standards.checks.filter(
    (check) => check.status === "missing-evidence"
  );
  const reviewChecks = standards.checks.filter(
    (check) => check.status === "needs-review"
  );
  const rationalePresent = standards.checks.some(
    (check) => check.checkId === "decision-rationale-present" && check.status === "passed"
  );
  const blockerScore = sum(blockerChecks.map((check) => check.scoreImpact));
  const evidenceScore = sum(
    [...missingEvidenceChecks, ...reviewChecks].map((check) => check.scoreImpact)
  );

  const criticalItems = bundle.plan.items.filter((item) => item.priorityLevel === "critical");
  const criticalLift = sum(criticalItems.map((item) => item.expectedReadinessLift));
  const baselineToPlannedLift = Math.max(
    0,
    bundle.report.finalReadiness - bundle.report.baselineReadiness
  );
  const criticalProjectedReadiness = clamp(
    bundle.report.baselineReadiness +
      Math.min(
        Math.max(criticalLift, Math.round(baselineToPlannedLift * 0.78)),
        baselineToPlannedLift || criticalLift
      )
  );

  const blockersClosedReadiness = clamp(
    bundle.report.finalReadiness + Math.min(8, Math.round(blockerScore * 0.12) + blockerChecks.length)
  );
  const evidenceClosedReadiness = clamp(
    bundle.report.finalReadiness +
      Math.min(6, Math.round(evidenceScore * 0.08) + missingEvidenceChecks.length)
  );

  const scenarioSpecs = [
    {
      id: "close-blockers",
      title: "إذا أُغلقت blockers الحالية",
      summary: "يغلق موانع الاعتماد المرتبطة بالمعايير والحوكمة الحالية.",
      readiness: blockersClosedReadiness,
      confidence: clamp(bundle.report.confidence + Math.min(12, blockerChecks.length * 3)),
      blockers: 0,
      missingEvidence: standards.counts["missing-evidence"],
      needsReview: standards.counts["needs-review"],
      residualRisk: lowerRisk(bundle.report.residualRiskLevel, blockerChecks.length > 0 ? 1 : 0)
    },
    {
      id: "complete-evidence",
      title: "إذا اكتملت الأدلة الناقصة",
      summary: "يرفع يقين القرار ويغلق متطلبات الأدلة الناقصة داخل الحالة.",
      readiness: evidenceClosedReadiness,
      confidence: clamp(
        bundle.report.confidence + Math.min(14, (missingEvidenceChecks.length + reviewChecks.length) * 3)
      ),
      blockers: standards.blockers.length,
      missingEvidence: 0,
      needsReview: 0,
      residualRisk: lowerRisk(bundle.report.residualRiskLevel, reviewChecks.length > 0 ? 1 : 0)
    },
    {
      id: "execute-critical-accommodations",
      title: "إذا نُفذت التكييفات الحرجة",
      summary: "يترجم الخطة الحرجة إلى أثر readiness فعلي على الوظيفة والأدوات.",
      readiness: clamp(Math.max(bundle.report.finalReadiness, criticalProjectedReadiness)),
      confidence: clamp(bundle.report.confidence + Math.min(8, criticalItems.length * 2)),
      blockers: standards.blockers.length,
      missingEvidence: standards.counts["missing-evidence"],
      needsReview: standards.counts["needs-review"],
      residualRisk: lowerRisk(bundle.report.residualRiskLevel, criticalItems.length > 0 ? 1 : 0)
    }
  ];

  return scenarioSpecs.map((scenario) => {
    const projection = evaluateApprovalProjection({
      readiness: scenario.readiness,
      blockers: scenario.blockers,
      missingEvidence: scenario.missingEvidence,
      needsReview: scenario.needsReview,
      rationalePresent
    });

    const closableNow =
      projection.approvalReady ||
      (scenario.readiness >= APPROVAL_READINESS_THRESHOLD &&
        scenario.blockers === 0 &&
        scenario.missingEvidence === 0 &&
        scenario.needsReview === 0);

    return {
      id: scenario.id,
      title: scenario.title,
      summary: scenario.summary,
      projectedDecision: projection.decisionLabel,
      projectedReadiness: scenario.readiness,
      projectedConfidence: scenario.confidence,
      confidenceDelta: clamp(scenario.confidence - bundle.report.confidence),
      residualRisk: scenario.residualRisk,
      closableNow
    };
  });
};
