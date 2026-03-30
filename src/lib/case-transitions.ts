import { AppRole } from "./role-model";
import { CaseRecord, CaseState, isTerminalCaseState } from "./case-state";

export interface CaseTransitionDefinition {
  id: string;
  label: string;
  from: CaseState;
  to: CaseState;
  allowedRoles: AppRole[];
  kind: "primary" | "secondary" | "danger";
  description: string;
}

export interface CaseStageActionDefinition {
  id: string;
  label: string;
  state: CaseState;
  allowedRoles: AppRole[];
  description: string;
}

export const CASE_TRANSITIONS: CaseTransitionDefinition[] = [
  {
    id: "submit-for-review",
    label: "Submit for Review",
    from: "DRAFT",
    to: "UNDER_ASSESSMENT",
    allowedRoles: ["case-initiator"],
    kind: "primary",
    description: "تحويل الحالة من الإدخال الأولي إلى مرحلة التقييم."
  },
  {
    id: "send-to-manager",
    label: "Send to Manager",
    from: "UNDER_ASSESSMENT",
    to: "MANAGER_REVIEW",
    allowedRoles: ["assessor"],
    kind: "primary",
    description: "إرسال الحالة بعد اكتمال التقييم إلى مدير التوظيف."
  },
  {
    id: "send-to-compliance",
    label: "Send to Compliance",
    from: "MANAGER_REVIEW",
    to: "COMPLIANCE_REVIEW",
    allowedRoles: ["hiring-manager"],
    kind: "primary",
    description: "تحويل الحالة بعد مراجعة المهام إلى الامتثال."
  },
  {
    id: "approve-case",
    label: "Approve",
    from: "COMPLIANCE_REVIEW",
    to: "APPROVED",
    allowedRoles: ["compliance-reviewer"],
    kind: "primary",
    description: "اعتماد القرار النهائي إذا أغلقت الشروط الحرجة."
  },
  {
    id: "reject-case",
    label: "Reject",
    from: "COMPLIANCE_REVIEW",
    to: "REJECTED",
    allowedRoles: ["compliance-reviewer"],
    kind: "danger",
    description: "رفض الحالة نهائيًا."
  },
  {
    id: "draft-to-revision",
    label: "Request Changes",
    from: "DRAFT",
    to: "NEEDS_REVISION",
    allowedRoles: ["case-initiator"],
    kind: "secondary",
    description: "إرجاع الحالة إلى مسار التعديل قبل التقييم."
  },
  {
    id: "assessment-to-revision",
    label: "Request Changes",
    from: "UNDER_ASSESSMENT",
    to: "NEEDS_REVISION",
    allowedRoles: ["assessor"],
    kind: "secondary",
    description: "إرجاع الحالة للتعديل قبل إرسالها للمراجعة الإدارية."
  },
  {
    id: "manager-to-revision",
    label: "Request Changes",
    from: "MANAGER_REVIEW",
    to: "NEEDS_REVISION",
    allowedRoles: ["hiring-manager"],
    kind: "secondary",
    description: "إرجاع الحالة إلى التعديل قبل رفعها للامتثال."
  },
  {
    id: "compliance-to-revision",
    label: "Request Changes",
    from: "COMPLIANCE_REVIEW",
    to: "NEEDS_REVISION",
    allowedRoles: ["compliance-reviewer"],
    kind: "secondary",
    description: "إرجاع الحالة للتعديل بدل الرفض النهائي."
  },
  {
    id: "resubmit-assessment",
    label: "Resubmit Assessment",
    from: "NEEDS_REVISION",
    to: "UNDER_ASSESSMENT",
    allowedRoles: ["assessor"],
    kind: "primary",
    description: "إعادة الحالة إلى التقييم بعد معالجة المطلوب."
  }
];

export const CASE_STAGE_ACTIONS: CaseStageActionDefinition[] = [
  {
    id: "complete-manager-review",
    label: "Review essential tasks before approval",
    state: "MANAGER_REVIEW",
    allowedRoles: ["hiring-manager"],
    description: "تثبيت مراجعة مدير التوظيف قبل الإرسال إلى الامتثال."
  }
];

export const getTransitionsForState = (state: CaseState) =>
  CASE_TRANSITIONS.filter((transition) => transition.from === state);

export const getTransitionsForRole = (state: CaseState, role: AppRole) =>
  getTransitionsForState(state).filter((transition) => transition.allowedRoles.includes(role));

export const getPrimaryTransition = (state: CaseState, role: AppRole) =>
  getTransitionsForRole(state, role).find((transition) => transition.kind === "primary");

export const getStageActionForRole = (state: CaseState, role: AppRole) =>
  CASE_STAGE_ACTIONS.find(
    (action) => action.state === state && action.allowedRoles.includes(role)
  );

export const canRoleOperateCurrentState = (caseRecord: CaseRecord, role: AppRole) =>
  !isTerminalCaseState(caseRecord.state) &&
  (getTransitionsForRole(caseRecord.state, role).length > 0 ||
    Boolean(getStageActionForRole(caseRecord.state, role)));
