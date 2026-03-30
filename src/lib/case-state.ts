import { AppRole } from "./role-model";

export const CASE_STATES = [
  "DRAFT",
  "UNDER_ASSESSMENT",
  "MANAGER_REVIEW",
  "COMPLIANCE_REVIEW",
  "APPROVED",
  "REJECTED",
  "NEEDS_REVISION"
] as const;

export type CaseState = (typeof CASE_STATES)[number];

export interface CaseTimelineEvent {
  id: string;
  at: string;
  actorRole: AppRole;
  action: string;
  note: string;
  fromState?: CaseState;
  toState?: CaseState;
}

export interface CaseRecord {
  id: string;
  state: CaseState;
  createdBy: AppRole;
  updatedAt: string;
  managerReviewCompleted: boolean;
  revisionCount: number;
  timeline: CaseTimelineEvent[];
}

export const CASE_STATE_META: Record<
  CaseState,
  {
    label: string;
    shortLabel: string;
    ownerRole: AppRole | "closed";
    nextLabel: string;
    description: string;
    tone: "neutral" | "warning" | "success" | "danger";
  }
> = {
  DRAFT: {
    label: "Draft",
    shortLabel: "مسودة",
    ownerRole: "case-initiator",
    nextLabel: "Under Assessment",
    description: "إدخال أولي قبل تحويل الحالة إلى التقييم.",
    tone: "neutral"
  },
  UNDER_ASSESSMENT: {
    label: "Under Assessment",
    shortLabel: "قيد التقييم",
    ownerRole: "assessor",
    nextLabel: "Manager Review",
    description: "مرحلة بناء ملف القدرات والعوائق وخطة التكييف.",
    tone: "warning"
  },
  MANAGER_REVIEW: {
    label: "Manager Review",
    shortLabel: "مراجعة المدير",
    ownerRole: "hiring-manager",
    nextLabel: "Compliance Review",
    description: "مرحلة اعتماد واقعية المهام والـ essential tasks.",
    tone: "warning"
  },
  COMPLIANCE_REVIEW: {
    label: "Compliance Review",
    shortLabel: "مراجعة الامتثال",
    ownerRole: "compliance-reviewer",
    nextLabel: "Approved / Rejected / Needs Revision",
    description: "مرحلة القرار النهائي بعد التحقق من الأدلة والـ blockers.",
    tone: "warning"
  },
  APPROVED: {
    label: "Approved",
    shortLabel: "معتمد",
    ownerRole: "closed",
    nextLabel: "Closed",
    description: "القرار معتمد والحالة مغلقة تشغيليًا.",
    tone: "success"
  },
  REJECTED: {
    label: "Rejected",
    shortLabel: "مرفوض",
    ownerRole: "closed",
    nextLabel: "Closed",
    description: "القرار النهائي هو الرفض وإيقاف المسار الحالي.",
    tone: "danger"
  },
  NEEDS_REVISION: {
    label: "Needs Revision",
    shortLabel: "تحتاج تعديل",
    ownerRole: "assessor",
    nextLabel: "Under Assessment",
    description: "الحالة عادت للتعديل قبل إعادة التقييم.",
    tone: "warning"
  }
};

export const CASE_DEMO_ID = "90214";

export const createInitialCaseRecord = (): CaseRecord => ({
  id: CASE_DEMO_ID,
  state: "DRAFT",
  createdBy: "case-initiator",
  updatedAt: new Date().toISOString(),
  managerReviewCompleted: false,
  revisionCount: 0,
  timeline: [
    {
      id: "timeline-created",
      at: new Date().toISOString(),
      actorRole: "case-initiator",
      action: "Case created",
      note: "تم إنشاء الحالة وبدء إدخال الوظيفة والمتطلبات الأساسية.",
      toState: "DRAFT"
    }
  ]
});

export const isTerminalCaseState = (state: CaseState) =>
  state === "APPROVED" || state === "REJECTED";

export const isActiveCaseState = (state: CaseState) => !isTerminalCaseState(state);
