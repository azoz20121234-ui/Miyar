import {
  DecisionDriverLevel,
  DecisionThresholdView,
  SuitabilityStatus
} from "@/models/types";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const APPROVAL_READINESS_THRESHOLD = 72;
export const STRONG_READINESS_THRESHOLD = 86;
export const MIN_READINESS_THRESHOLD = 56;

export interface ApprovalProjectionInput {
  readiness: number;
  blockers: number;
  missingEvidence: number;
  needsReview: number;
  rationalePresent: boolean;
}

export interface ApprovalProjection {
  approvalReady: boolean;
  decisionLabel: string;
  reason: string;
}

export const readinessGap = (
  readiness: number,
  threshold = APPROVAL_READINESS_THRESHOLD
) => Math.max(0, threshold - clamp(readiness));

export const resolveReadinessStatus = (readiness: number): SuitabilityStatus => {
  const normalized = clamp(readiness);

  if (normalized >= STRONG_READINESS_THRESHOLD) return "fit";
  if (normalized >= APPROVAL_READINESS_THRESHOLD) return "conditional";
  if (normalized >= MIN_READINESS_THRESHOLD) return "needs-preparation";
  return "not-ready";
};

export const decisionLabelForStatus = (status: SuitabilityStatus) => {
  if (status === "fit") return "مناسب";
  if (status === "conditional") return "مناسب بعد التهيئة";
  if (status === "needs-preparation") return "يحتاج تهيئة إضافية";
  return "غير مناسب حاليًا";
};

export const evaluateApprovalProjection = ({
  readiness,
  blockers,
  missingEvidence,
  needsReview,
  rationalePresent
}: ApprovalProjectionInput): ApprovalProjection => {
  const gap = readinessGap(readiness);

  if (blockers > 0) {
    return {
      approvalReady: false,
      decisionLabel: "محجوب حتى إغلاق الـ blockers",
      reason: "يوجد blocker واحد أو أكثر ما زال يمنع الاعتماد."
    };
  }

  if (missingEvidence > 0 || needsReview > 0) {
    return {
      approvalReady: false,
      decisionLabel: "بانتظار استكمال الأدلة",
      reason: "حزمة الأدلة ما زالت غير مكتملة للاعتماد."
    };
  }

  if (!rationalePresent) {
    return {
      approvalReady: false,
      decisionLabel: "بانتظار rationale القرار",
      reason: "القرار يحتاج تفسيرًا تنفيذيًا مكتملًا قبل الاعتماد."
    };
  }

  if (gap > 0) {
    return {
      approvalReady: false,
      decisionLabel: decisionLabelForStatus(resolveReadinessStatus(readiness)),
      reason: `الجاهزية أقل من حد الاعتماد بـ ${gap} نقطة.`
    };
  }

  return {
    approvalReady: true,
    decisionLabel: "معتمد",
    reason: "أغلقت شروط الاعتماد الحرجة وأصبحت الحالة جاهزة للقرار النهائي."
  };
};

export const resolveThresholdView = (
  readiness: number,
  closableNow: boolean
): DecisionThresholdView => {
  const gap = readinessGap(readiness);

  return {
    currentReadiness: clamp(readiness),
    approvalThreshold: APPROVAL_READINESS_THRESHOLD,
    currentGap: gap,
    closableNow,
    gapSummary:
      gap === 0
        ? "الجاهزية تتجاوز حد الاعتماد، لكن القرار ما زال يعتمد على إغلاق الموانع والأدلة."
        : closableNow
          ? "الفجوة قابلة للإغلاق داخل الحالة الحالية إذا أُنجزت الإجراءات الحرجة."
          : "الفجوة ليست مغلقة بعد وتحتاج معالجة تشغيلية إضافية قبل الاعتماد."
  };
};

export const resolveDriverLevel = (
  impact: number,
  blocker = false
): DecisionDriverLevel => {
  if (blocker) return "blocker";
  if (Math.abs(impact) >= 10) return "major";
  return "minor";
};
