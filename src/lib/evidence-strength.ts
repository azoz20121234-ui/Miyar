import { getRoleConfig } from "@/lib/role-model";
import { CaseStandardsEvaluation } from "@/lib/standards-types";
import { AssessmentBundle, DecisionExplainability } from "@/models/types";
import { EvidenceStrengthItem, EvidenceStrengthLevel, EvidenceStrengthModel } from "@/types/evidence";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const levelLabelMap: Record<EvidenceStrengthLevel, string> = {
  strong: "قوية",
  moderate: "متوسطة",
  limited: "تمهيدية"
};

const defenseLabelMap: Record<EvidenceStrengthLevel, string> = {
  strong: "قابلة للدفاع",
  moderate: "قابلة للدفاع مبدئيًا",
  limited: "تحتاج استكمال"
};

const pendingStatusLabel = (
  status: CaseStandardsEvaluation["checks"][number]["status"],
  blocker: boolean
) => {
  if (blocker || status === "blocker") return "مانع";
  if (status === "needs-review") return "بانتظار مراجعة";
  return "يحتاج استكمال";
};

const toPresentItem = (
  check: CaseStandardsEvaluation["checks"][number]
): EvidenceStrengthItem => ({
  id: check.checkId,
  title: check.label,
  summary: check.evidenceSummary,
  ownerLabel: getRoleConfig(check.ownerRole).label,
  statusLabel: "مثبت",
  blocker: check.blocker
});

const toPendingItem = (
  check: CaseStandardsEvaluation["checks"][number]
): EvidenceStrengthItem => ({
  id: check.checkId,
  title: check.label,
  summary: check.evidenceSummary,
  ownerLabel: getRoleConfig(check.ownerRole).label,
  statusLabel: pendingStatusLabel(check.status, check.blocker),
  blocker: check.blocker
});

export const buildEvidenceStrengthModel = (
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation,
  explainability: DecisionExplainability
): EvidenceStrengthModel => {
  const totalChecks = standards.checks.length || 1;
  const verifiedChecks = standards.checks.filter((check) => check.evidenceStatus === "present");
  const pendingChecks = standards.checks.filter((check) => check.status !== "passed");
  const verifiedRatio = verifiedChecks.length / totalChecks;
  const blockerCount = standards.blockers.length;
  const pendingCount = pendingChecks.length;
  const evidenceGapPenalty =
    standards.counts["missing-evidence"] * 3 + standards.counts["needs-review"] * 2;

  const score = clamp(
    46 +
      verifiedRatio * 38 +
      bundle.report.confidence * 0.12 -
      blockerCount * 9 -
      evidenceGapPenalty
  );

  const level: EvidenceStrengthLevel =
    score >= 78 ? "strong" : score >= 62 ? "moderate" : "limited";

  const verifiedItems = verifiedChecks
    .sort((left, right) => right.scoreImpact - left.scoreImpact)
    .slice(0, 3)
    .map(toPresentItem);

  const pendingItems = pendingChecks
    .sort((left, right) => {
      if (left.blocker !== right.blocker) return left.blocker ? -1 : 1;
      return right.scoreImpact - left.scoreImpact;
    })
    .slice(0, 3)
    .map(toPendingItem);

  const summary =
    pendingCount > 0
      ? `الحزمة الحالية توثق ${verifiedChecks.length} عنصرًا مثبتًا، لكن ما زال ${pendingCount} عنصرًا يحتاج استكمالًا أو مراجعة قبل إغلاق الملف دفاعيًا.`
      : `الحزمة الحالية تجمع أدلة تشغيلية متماسكة وتغلق أبرز المتطلبات المفتوحة داخل القرار.`;

  const strongestPending = explainability.approvalBlocks[0];

  return {
    score,
    level,
    label: levelLabelMap[level],
    defenseLabel: defenseLabelMap[level],
    summary:
      strongestPending && pendingCount > 0
        ? `${summary} أعلى فجوة الآن هي ${strongestPending.title}.`
        : summary,
    verifiedCount: verifiedChecks.length,
    pendingCount,
    blockerCount,
    verifiedItems,
    pendingItems,
    assumptionsNote:
      "قراءة تمهيدية مبنية على اكتمال الأدلة التشغيلية الحالية داخل Miyar، وليست اعتمادًا مستقلاً."
  };
};
