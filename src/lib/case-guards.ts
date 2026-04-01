import { CaseStandardsEvaluation } from "@/lib/standards-types";
import { AssessmentBundle } from "@/models/types";

import { CaseRecord } from "./case-state";

export interface TransitionRequirement {
  id: string;
  label: string;
  passed: boolean;
  reason: string;
}

export interface GuardEvaluation {
  allowed: boolean;
  requirements: TransitionRequirement[];
  blockingReasons: string[];
}

const checkPassed = (
  standards: CaseStandardsEvaluation,
  checkId: string
) => standards.checks.find((check) => check.checkId === checkId)?.status === "passed";

const withResult = (requirements: TransitionRequirement[]): GuardEvaluation => ({
  allowed: requirements.every((item) => item.passed),
  requirements,
  blockingReasons: requirements.filter((item) => !item.passed).map((item) => item.reason)
});

export const evaluateTransitionGuard = (
  transitionId: string,
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation,
  caseRecord: CaseRecord
): GuardEvaluation => {
  switch (transitionId) {
    case "submit-for-review":
      return withResult([
        {
          id: "draft-job-ready",
          label: "إدخال الوظيفة مكتمل",
          passed: bundle.job.tasks.length >= 3,
          reason: "مطلوب إدخال وظيفة أوضح قبل الإرسال."
        },
        {
          id: "draft-environment-ready",
          label: "بيئة العمل موثقة",
          passed: bundle.job.environment.tools.length >= 3 || bundle.job.tools.length >= 3,
          reason: "بيئة العمل أو أدواتها ما زالت ناقصة."
        }
      ]);
    case "send-to-manager":
      return withResult([
        {
          id: "capability-profile-complete",
          label: "ملف القدرات مكتمل",
          passed: checkPassed(standards, "capability-evidence-present"),
          reason: "ملف القدرات غير مكتمل."
        },
        {
          id: "barriers-documented",
          label: "العوائق موثقة",
          passed: bundle.barriers.length > 0 && checkPassed(standards, "barriers-linked-to-tasks"),
          reason: "العوائق غير مكتملة أو غير مرتبطة بالمهام."
        },
        {
          id: "accommodations-ready",
          label: "التكييفات جاهزة",
          passed: bundle.plan.items.length > 0 && checkPassed(standards, "accommodations-linked"),
          reason: "لا توجد تكييفات جاهزة للإرسال."
        }
      ]);
    case "send-to-compliance":
      return withResult([
        {
          id: "essential-tasks-confirmed",
          label: "المهام الأساسية مؤكدة",
          passed: checkPassed(standards, "task-essential-defined"),
          reason: "المهام الأساسية غير مثبتة."
        },
        {
          id: "manager-review-completed",
          label: "مراجعة المدير مكتملة",
          passed: caseRecord.managerReviewCompleted,
          reason: "مراجعة المدير مطلوبة قبل الإرسال."
        }
      ]);
    case "approve-case":
      return withResult([
        {
          id: "no-blockers",
          label: "لا توجد موانع",
          passed: standards.blockers.length === 0,
          reason: "لا تزال هناك موانع غير مغلقة."
        },
        {
          id: "evidence-complete",
          label: "الأدلة مكتملة",
          passed:
            standards.counts["missing-evidence"] === 0 &&
            standards.counts["needs-review"] === 0,
          reason: "ما زالت الأدلة ناقصة."
        },
        {
          id: "decision-rationale",
          label: "مبررات القرار موجودة",
          passed:
            bundle.report.decisionRationale.length >= 3 &&
            checkPassed(standards, "decision-rationale-present"),
          reason: "مبررات القرار غير مكتملة."
        },
        {
          id: "readiness-threshold",
          label: "حد الجاهزية مستوفى",
          passed: bundle.report.finalReadiness >= 72,
          reason: "الجاهزية أقل من حد الاعتماد."
        }
      ]);
    case "reject-case":
      return withResult([
        {
          id: "compliance-reviewed",
          label: "مراجعة الامتثال نشطة",
          passed: caseRecord.state === "COMPLIANCE_REVIEW",
          reason: "الحالة ليست في مرحلة قرار نهائي."
        }
      ]);
    case "draft-to-revision":
    case "assessment-to-revision":
    case "manager-to-revision":
    case "compliance-to-revision":
      return withResult([
        {
          id: "revision-allowed",
          label: "مسار التعديل متاح",
          passed: true,
          reason: ""
        }
      ]);
    case "resubmit-assessment":
      return withResult([
        {
          id: "revision-exists",
          label: "تم طلب تعديل",
          passed: caseRecord.revisionCount > 0,
          reason: "الحالة لم تدخل مسار التعديل بعد."
        },
        {
          id: "assessment-restart-ready",
          label: "إعادة التقييم جاهزة",
          passed: bundle.job.tasks.length > 0,
          reason: "لا توجد بيانات كافية لإعادة التقييم."
        }
      ]);
    default:
      return withResult([]);
  }
};

export const evaluateStageActionGuard = (
  actionId: string,
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation,
  caseRecord: CaseRecord
): GuardEvaluation => {
  switch (actionId) {
    case "complete-manager-review":
      return withResult([
        {
          id: "manager-review-state",
          label: "مراجعة المدير نشطة",
          passed: caseRecord.state === "MANAGER_REVIEW",
          reason: "الحالة ليست في مرحلة مراجعة المدير."
        },
        {
          id: "task-reality-ready",
          label: "واقعية المهام جاهزة",
          passed: checkPassed(standards, "task-essential-defined"),
          reason: "واقعية المهام غير جاهزة بعد."
        },
        {
          id: "recommendation-visible",
          label: "التوصية ظاهرة",
          passed: bundle.report.recommendation.trim().length > 0,
          reason: "التوصية الحالية غير جاهزة للمراجعة."
        }
      ]);
    default:
      return withResult([]);
  }
};
