import { evaluateTransitionGuard } from "@/lib/case-guards";
import { getRoleConfig, type AppRole } from "@/lib/role-model";
import { CaseStandardsEvaluation } from "@/lib/standards-types";
import {
  ApprovalBlock,
  AssessmentBundle,
  DecisionDriver,
  DecisionExplainability,
  DecisionNextAction,
  DecisionRecommendationFrame,
  DecisionRequirementTrace
} from "@/models/types";

import { CaseRecord } from "./case-state";
import { buildDecisionScenarios } from "./decision-scenarios";
import {
  APPROVAL_READINESS_THRESHOLD,
  evaluateApprovalProjection,
  resolveDriverLevel,
  resolveThresholdView
} from "./decision-thresholds";

const clamp = (value: number, max = 18) => Math.max(0, Math.min(max, Math.round(value)));

const roleLabel = (role: AppRole) => getRoleConfig(role).label;

const actionTemplateByCheckId: Record<string, string> = {
  "capability-evidence-present": "أكمل evidence أبعاد القدرات وأثبت ظروف الأداء المناسبة داخل الملف.",
  "barriers-linked-to-tasks": "اربط كل barrier بمهمة أو أداة محددة قبل رفع الحالة.",
  "accommodations-linked": "اربط كل accommodation بالعائق والمهمة المستهدفة بصورة مباشرة.",
  "accommodations-scoped": "أكمل نطاق التكلفة والزمن ومتطلبات التنفيذ لكل accommodation.",
  "decision-rationale-present": "ثبّت why this decision وdecision rationale بصياغة تنفيذية مختصرة.",
  "gov-case-owner-set": "حدد مالك الحالة المسؤول عن الإغلاق النهائي وربطه بطابور المتابعة.",
  "gov-hiring-review": "أكمل مراجعة Hiring Manager وسجلها ضمن الحالة قبل الاعتماد.",
  "gov-compliance-review": "أكمل مراجعة Compliance وحوّل النتيجة إلى sign-off واضح.",
  "gov-accommodation-owner": "أضف owner تنفيذي لكل accommodation مع التكلفة والزمن."
};

const requirementMeta: Record<
  string,
  {
    ownerRole: AppRole;
    requiredAction: string;
  }
> = {
  "no-blockers": {
    ownerRole: "compliance-reviewer",
    requiredAction: "أغلق blocker checks المفتوحة قبل طلب الاعتماد."
  },
  "evidence-complete": {
    ownerRole: "assessor",
    requiredAction: "استكمل evidence pending وأغلق عناصر needs review."
  },
  "decision-rationale": {
    ownerRole: "compliance-reviewer",
    requiredAction: "أكمل decision rationale القابل للعرض على اللجنة."
  },
  "readiness-threshold": {
    ownerRole: "assessor",
    requiredAction: "ارفع readiness فوق حد الاعتماد عبر التكييفات الحرجة."
  }
};

const buildPositiveDrivers = (
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation
): DecisionDriver[] => {
  const sustainabilitySignal = bundle.report.signals.find(
    (signal) => signal.id === "sustainability-likelihood"
  );
  const roleClaritySignal = bundle.report.signals.find(
    (signal) => signal.id === "role-clarity"
  );

  const candidates: DecisionDriver[] = [];

  if (bundle.report.taskFit >= 68) {
    candidates.push({
      id: "driver-task-fit",
      title: "ملاءمة المهام",
      summary: `Task fit عند ${bundle.report.taskFit}% مع تغطية حرجة ${bundle.report.criticalCoverage}%.`,
      direction: "positive",
      impact: clamp((bundle.report.taskFit - 58) * 0.58),
      level: resolveDriverLevel((bundle.report.taskFit - 58) * 0.58),
      domain: "task",
      blocker: false,
      ownerRole: "assessor"
    });
  }

  if (bundle.plan.barrierCoverage >= 75) {
    candidates.push({
      id: "driver-barrier-coverage",
      title: "تغطية العوائق بالخطة",
      summary: `خطة التكييف تغطي ${bundle.plan.barrierCoverage}% من العوائق الحالية.`,
      direction: "positive",
      impact: clamp((bundle.plan.barrierCoverage - 68) * 0.42),
      level: resolveDriverLevel((bundle.plan.barrierCoverage - 68) * 0.42),
      domain: "accommodation",
      blocker: false,
      ownerRole: "assessor"
    });
  }

  if (bundle.report.accommodationFeasibility >= 72) {
    candidates.push({
      id: "driver-feasibility",
      title: "قابلية تنفيذ التكييف",
      summary: `Accommodation feasibility عند ${bundle.report.accommodationFeasibility}% بزمن تنفيذ أقصى ${bundle.report.maxImplementationDays} أيام.`,
      direction: "positive",
      impact: clamp((bundle.report.accommodationFeasibility - 66) * 0.45),
      level: resolveDriverLevel((bundle.report.accommodationFeasibility - 66) * 0.45),
      domain: "accommodation",
      blocker: false,
      ownerRole: "assessor"
    });
  }

  if (sustainabilitySignal && sustainabilitySignal.score >= 70) {
    candidates.push({
      id: "driver-sustainability",
      title: "احتمالية الاستمرارية",
      summary: `${sustainabilitySignal.label} عند ${sustainabilitySignal.score}% بعد الخطة المقترحة.`,
      direction: "positive",
      impact: clamp((sustainabilitySignal.score - 64) * 0.4),
      level: resolveDriverLevel((sustainabilitySignal.score - 64) * 0.4),
      domain: "governance",
      blocker: false,
      ownerRole: "compliance-reviewer"
    });
  }

  if (roleClaritySignal && roleClaritySignal.score >= 70) {
    candidates.push({
      id: "driver-role-clarity",
      title: "وضوح الدور",
      summary: `${roleClaritySignal.label} عند ${roleClaritySignal.score}% بما يدعم قرارًا مبنيًا على مهام فعلية.`,
      direction: "positive",
      impact: clamp((roleClaritySignal.score - 66) * 0.35),
      level: resolveDriverLevel((roleClaritySignal.score - 66) * 0.35),
      domain: "task",
      blocker: false,
      ownerRole: "hiring-manager"
    });
  }

  return candidates.sort((left, right) => right.impact - left.impact).slice(0, 3);
};

const buildNegativeDrivers = (
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation
): DecisionDriver[] => {
  const highSeverityBarriers = bundle.barriers.filter((barrier) => barrier.severity === "high");
  const evidencePending =
    standards.counts["missing-evidence"] + standards.counts["needs-review"];
  const blockerImpact = standards.checks
    .filter((check) => check.blocker && check.status !== "passed")
    .reduce((total, check) => total + check.scoreImpact, 0);

  const candidates: DecisionDriver[] = [];

  if (standards.blockers.length > 0) {
    candidates.push({
      id: "driver-blockers",
      title: "Blockers غير مغلقة",
      summary: `${standards.blockers.length} blocker checks ما زالت تمنع الاعتماد النهائي.`,
      direction: "negative",
      impact: -clamp(10 + blockerImpact * 0.08 + standards.blockers.length),
      level: "blocker",
      domain: "governance",
      blocker: true,
      ownerRole: "compliance-reviewer"
    });
  }

  if (evidencePending > 0) {
    candidates.push({
      id: "driver-evidence",
      title: "Evidence pending",
      summary: `${evidencePending} checks ما زالت بين missing evidence وneeds review.`,
      direction: "negative",
      impact: -clamp(7 + evidencePending * 2, 16),
      level: resolveDriverLevel(-(7 + evidencePending * 2)),
      domain: "evidence",
      blocker: false,
      ownerRole: "assessor"
    });
  }

  if (highSeverityBarriers.length > 0) {
    const barrierImpact = highSeverityBarriers.reduce(
      (total, barrier) => total + barrier.scoreImpact,
      0
    );

    candidates.push({
      id: "driver-high-barriers",
      title: "عوائق تشغيلية حرجة",
      summary: highSeverityBarriers
        .slice(0, 2)
        .map((barrier) => barrier.title)
        .join("، "),
      direction: "negative",
      impact: -clamp(barrierImpact * 0.75, 15),
      level: resolveDriverLevel(-(barrierImpact * 0.75)),
      domain: "barrier",
      blocker: false,
      ownerRole: "assessor"
    });
  }

  if (bundle.report.finalReadiness < APPROVAL_READINESS_THRESHOLD) {
    candidates.push({
      id: "driver-threshold-gap",
      title: "فجوة الجاهزية",
      summary: `Approval readiness أقل من threshold الحالي بـ ${APPROVAL_READINESS_THRESHOLD - bundle.report.finalReadiness} نقطة.`,
      direction: "negative",
      impact: -clamp(APPROVAL_READINESS_THRESHOLD - bundle.report.finalReadiness + 6, 14),
      level: resolveDriverLevel(-(APPROVAL_READINESS_THRESHOLD - bundle.report.finalReadiness + 6)),
      domain: "environment",
      blocker: false,
      ownerRole: "assessor"
    });
  }

  if (bundle.report.residualRiskLevel !== "low") {
    candidates.push({
      id: "driver-residual-risk",
      title: "مخاطر متبقية",
      summary: `Residual risk الحالي ${bundle.report.residualRiskLevel} ويحتاج إغلاقًا قبل الاعتماد المطمئن.`,
      direction: "negative",
      impact: -clamp(bundle.report.residualRiskLevel === "high" ? 13 : 9),
      level: resolveDriverLevel(bundle.report.residualRiskLevel === "high" ? -13 : -9),
      domain: "governance",
      blocker: false,
      ownerRole: "compliance-reviewer"
    });
  }

  return candidates.sort((left, right) => Math.abs(right.impact) - Math.abs(left.impact)).slice(0, 3);
};

const buildApprovalBlocks = (
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation
): ApprovalBlock[] => {
  const blockers = standards.blockers
    .map((blocker) => {
      const check = standards.checks.find((item) => item.checkId === blocker.id);
      const ownerRole = check?.ownerRole ?? blocker.ownerRole;

      return {
        id: blocker.id,
        title: blocker.title,
        reason: blocker.rationale,
        blocker: true,
        status: "blocker" as const,
        ownerRole,
        ownerLabel: roleLabel(ownerRole),
        requiredAction:
          actionTemplateByCheckId[blocker.id] ??
          "أغلق هذا check وربط evidence المطلوب داخل الحزمة الحالية.",
        impact: check?.scoreImpact ?? 10
      };
    })
    .sort((left, right) => right.impact - left.impact);

  const evidenceItems = standards.evidenceRequirements.slice(0, 2).map((requirement) => ({
    id: requirement.id,
    title: `${requirement.standardCode} • ${requirement.label}`,
    reason: requirement.evidenceSummary,
    blocker: false,
    status: "missing-evidence" as const,
    ownerRole: requirement.ownerRole,
    ownerLabel: roleLabel(requirement.ownerRole),
    requiredAction:
      actionTemplateByCheckId[requirement.id] ??
      "استكمل evidence المطلوب ثم أعد رفع الحالة للمراجعة.",
    impact: requirement.impactLabel === "عالٍ" ? 10 : requirement.impactLabel === "متوسط" ? 8 : 6
  }));

  if (
    bundle.report.finalReadiness < APPROVAL_READINESS_THRESHOLD &&
    !blockers.some((item) => item.id === "readiness-threshold")
  ) {
    blockers.push({
      id: "readiness-threshold",
      title: "Approval readiness below threshold",
      reason: `الجاهزية الحالية ${bundle.report.finalReadiness}% بينما حد الاعتماد ${APPROVAL_READINESS_THRESHOLD}%.`,
      blocker: true,
      status: "blocker",
      ownerRole: "assessor",
      ownerLabel: roleLabel("assessor"),
      requiredAction: "نفذ التكييفات الحرجة وراجع الأثر حتى تتجاوز الجاهزية حد الاعتماد.",
      impact: 11
    });
  }

  return [...blockers, ...evidenceItems]
    .sort((left, right) => right.impact - left.impact)
    .slice(0, 4);
};

const buildApprovalRequirements = (
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation,
  caseRecord: CaseRecord
): DecisionRequirementTrace[] => {
  const guard = evaluateTransitionGuard("approve-case", bundle, standards, caseRecord);

  return guard.requirements.map((requirement) => {
    const meta = requirementMeta[requirement.id] ?? {
      ownerRole: "compliance-reviewer" as const,
      requiredAction: "أغلق هذا الشرط قبل طلب الاعتماد."
    };

    return {
      id: requirement.id,
      label: requirement.label,
      passed: requirement.passed,
      reason: requirement.passed ? "مستوفى" : requirement.reason,
      ownerRole: meta.ownerRole,
      ownerLabel: roleLabel(meta.ownerRole),
      requiredAction: meta.requiredAction,
      blocker: !requirement.passed
    };
  });
};

const buildNextActions = (
  bundle: AssessmentBundle,
  approvalBlocks: ApprovalBlock[]
): DecisionNextAction[] => {
  const actions: DecisionNextAction[] = approvalBlocks.slice(0, 2).map((block, index) => ({
    id: `action-${block.id}`,
    title: block.title,
    ownerRole: block.ownerRole,
    ownerLabel: block.ownerLabel,
    urgency: index === 0 ? "now" : "next",
    requiredAction: block.requiredAction,
    expectedImpact: block.blocker ? "يغلق مانع اعتماد مباشر" : "يرفع يقين القرار ويخفض التعليق",
    source: block.status === "missing-evidence" || block.status === "needs-review" ? "evidence" : "blocker"
  }));

  const criticalAccommodation = bundle.plan.items.find(
    (item) => item.priorityLevel === "critical"
  );

  if (criticalAccommodation) {
    actions.push({
      id: `action-${criticalAccommodation.accommodationId}`,
      title: criticalAccommodation.name,
      ownerRole: "assessor",
      ownerLabel: roleLabel("assessor"),
      urgency: actions.length === 0 ? "now" : "planned",
      requiredAction: criticalAccommodation.whyRecommended,
      expectedImpact: `يرفع الجاهزية بنحو ${criticalAccommodation.expectedReadinessLift} نقطة متوقعة.`,
      source: "accommodation"
    });
  }

  return actions.slice(0, 3);
};

const buildRecommendationModes = (
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation,
  approvalBlocks: ApprovalBlock[],
  scenarios: ReturnType<typeof buildDecisionScenarios>
): DecisionRecommendationFrame[] => {
  const topBlockers = approvalBlocks.slice(0, 2).map((item) => item.title).join("، ");
  const leadScenario =
    scenarios.find((scenario) => scenario.closableNow) ??
    [...scenarios].sort((left, right) => right.projectedReadiness - left.projectedReadiness)[0];
  const approvalProjection = evaluateApprovalProjection({
    readiness: bundle.report.finalReadiness,
    blockers: standards.blockers.length,
    missingEvidence: standards.counts["missing-evidence"],
    needsReview: standards.counts["needs-review"],
    rationalePresent: bundle.report.decisionRationale.length >= 3
  });

  return [
    {
      mode: "conservative",
      title: "Conservative",
      summary: "أوقف الاعتماد حتى إغلاق الموانع الحالية بالكامل.",
      printableText: approvalProjection.approvalReady
        ? `يوصى بالاعتماد الآن. الجاهزية الحالية ${bundle.report.finalReadiness}% وتتجاوز حد الاعتماد، مع مخاطر متبقية ${bundle.report.residualRiskLevel}.`
        : `لا يوصى بالاعتماد الآن. يجب أولًا إغلاق ${topBlockers || "الموانع الحالية"} قبل إعادة العرض على اللجنة.`
    },
    {
      mode: "balanced",
      title: "Balanced",
      summary: "حافظ على القرار الحالي، واسمح فقط بما يدفع الحالة إلى الاعتماد.",
      printableText: `التوصية الحالية هي ${bundle.report.recommendation}. أبقِ الحالة في مسارها الحالي، وأغلق ${topBlockers || "المتطلبات الحرجة"} للوصول إلى جاهزية متوقعة ${leadScenario.projectedReadiness}%.`
    },
    {
      mode: "enablement-first",
      title: "Enablement-first",
      summary: "ابدأ التنفيذ الآن مع منع الاعتماد النهائي حتى إغلاق الشروط الحرجة.",
      printableText: `يمكن البدء بتنفيذ التكييفات الحرجة فورًا ضمن مدة ${bundle.report.maxImplementationDays} أيام تقريبًا، مع تعليق الاعتماد النهائي حتى تصبح الحالة عند قرار ${leadScenario.projectedDecision}.`
    }
  ];
};

export const buildDecisionExplainability = (
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation,
  caseRecord: CaseRecord
): DecisionExplainability => {
  const scenarios = buildDecisionScenarios(bundle, standards);
  const approvalBlocks = buildApprovalBlocks(bundle, standards);
  const nextActions = buildNextActions(bundle, approvalBlocks);
  const approvalRequirements = buildApprovalRequirements(bundle, standards, caseRecord);
  const threshold = resolveThresholdView(
    bundle.report.finalReadiness,
    scenarios.some((scenario) => scenario.closableNow)
  );

  return {
    topPositiveDrivers: buildPositiveDrivers(bundle, standards),
    topNegativeDrivers: buildNegativeDrivers(bundle, standards),
    approvalBlocks,
    scenarios,
    threshold,
    recommendationModes: buildRecommendationModes(bundle, standards, approvalBlocks, scenarios),
    nextActions,
    approvalRequirements
  };
};
