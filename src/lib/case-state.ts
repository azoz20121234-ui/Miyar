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
    label: "مسودة",
    shortLabel: "مسودة",
    ownerRole: "case-initiator",
    nextLabel: "قيد التقييم",
    description: "إدخال أولي قبل تحويل الحالة إلى التقييم.",
    tone: "neutral"
  },
  UNDER_ASSESSMENT: {
    label: "قيد التقييم",
    shortLabel: "قيد التقييم",
    ownerRole: "assessor",
    nextLabel: "مراجعة المدير",
    description: "مرحلة بناء ملف القدرات والعوائق وخطة التكييف.",
    tone: "warning"
  },
  MANAGER_REVIEW: {
    label: "مراجعة المدير",
    shortLabel: "مراجعة المدير",
    ownerRole: "hiring-manager",
    nextLabel: "مراجعة الامتثال",
    description: "مرحلة اعتماد واقعية المهام والمهام الأساسية.",
    tone: "warning"
  },
  COMPLIANCE_REVIEW: {
    label: "مراجعة الامتثال",
    shortLabel: "مراجعة الامتثال",
    ownerRole: "compliance-reviewer",
    nextLabel: "اعتماد أو رفض أو طلب تعديل",
    description: "مرحلة القرار النهائي بعد التحقق من الأدلة والموانع.",
    tone: "warning"
  },
  APPROVED: {
    label: "معتمد",
    shortLabel: "معتمد",
    ownerRole: "closed",
    nextLabel: "مغلق",
    description: "القرار معتمد والحالة مغلقة تشغيليًا.",
    tone: "success"
  },
  REJECTED: {
    label: "مرفوض",
    shortLabel: "مرفوض",
    ownerRole: "closed",
    nextLabel: "مغلق",
    description: "القرار النهائي هو الرفض وإيقاف المسار الحالي.",
    tone: "danger"
  },
  NEEDS_REVISION: {
    label: "تحتاج تعديل",
    shortLabel: "تحتاج تعديل",
    ownerRole: "assessor",
    nextLabel: "قيد التقييم",
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
      action: "تم إنشاء الحالة",
      note: "تم إنشاء الحالة وبدء إدخال الوظيفة والمتطلبات الأساسية.",
      toState: "DRAFT"
    }
  ]
});

export const isTerminalCaseState = (state: CaseState) =>
  state === "APPROVED" || state === "REJECTED";

export const isActiveCaseState = (state: CaseState) => !isTerminalCaseState(state);
