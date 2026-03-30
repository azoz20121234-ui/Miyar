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
          label: "Job intake ready",
          passed: bundle.job.tasks.length >= 3,
          reason: "مطلوب Job Intake أوضح قبل الإرسال."
        },
        {
          id: "draft-environment-ready",
          label: "Environment captured",
          passed: bundle.job.environment.tools.length >= 3 || bundle.job.tools.length >= 3,
          reason: "بيئة العمل أو أدواتها ما زالت ناقصة."
        }
      ]);
    case "send-to-manager":
      return withResult([
        {
          id: "capability-profile-complete",
          label: "Capability profile complete",
          passed: checkPassed(standards, "capability-evidence-present"),
          reason: "Capability profile غير مكتمل."
        },
        {
          id: "barriers-documented",
          label: "Barriers documented",
          passed: bundle.barriers.length > 0 && checkPassed(standards, "barriers-linked-to-tasks"),
          reason: "العوائق غير مكتملة أو غير مرتبطة بالمهام."
        },
        {
          id: "accommodations-ready",
          label: "Accommodations ready",
          passed: bundle.plan.items.length > 0 && checkPassed(standards, "accommodations-linked"),
          reason: "لا توجد accommodations جاهزة للإرسال."
        }
      ]);
    case "send-to-compliance":
      return withResult([
        {
          id: "essential-tasks-confirmed",
          label: "Essential tasks confirmed",
          passed: checkPassed(standards, "task-essential-defined"),
          reason: "Essential tasks غير مثبتة."
        },
        {
          id: "manager-review-completed",
          label: "Manager review completed",
          passed: caseRecord.managerReviewCompleted,
          reason: "Manager review completed مطلوب قبل الإرسال."
        }
      ]);
    case "approve-case":
      return withResult([
        {
          id: "no-blockers",
          label: "No blockers",
          passed: standards.blockers.length === 0,
          reason: "Blockers unresolved."
        },
        {
          id: "evidence-complete",
          label: "Evidence complete",
          passed:
            standards.counts["missing-evidence"] === 0 &&
            standards.counts["needs-review"] === 0,
          reason: "Evidence pending."
        },
        {
          id: "decision-rationale",
          label: "Decision rationale present",
          passed:
            bundle.report.decisionRationale.length >= 3 &&
            checkPassed(standards, "decision-rationale-present"),
          reason: "Missing decision rationale."
        },
        {
          id: "readiness-threshold",
          label: "Decision readiness threshold",
          passed: bundle.report.finalReadiness >= 72,
          reason: "Readiness below approval threshold."
        }
      ]);
    case "reject-case":
      return withResult([
        {
          id: "compliance-reviewed",
          label: "Compliance review active",
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
          label: "Revision route available",
          passed: true,
          reason: ""
        }
      ]);
    case "resubmit-assessment":
      return withResult([
        {
          id: "revision-exists",
          label: "Revision requested",
          passed: caseRecord.revisionCount > 0,
          reason: "الحالة لم تدخل مسار التعديل بعد."
        },
        {
          id: "assessment-restart-ready",
          label: "Assessment restart ready",
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
          label: "Manager review active",
          passed: caseRecord.state === "MANAGER_REVIEW",
          reason: "الحالة ليست في مرحلة Manager Review."
        },
        {
          id: "task-reality-ready",
          label: "Task reality ready",
          passed: checkPassed(standards, "task-essential-defined"),
          reason: "Task reality غير جاهزة بعد."
        },
        {
          id: "recommendation-visible",
          label: "Recommendation visible",
          passed: bundle.report.recommendation.trim().length > 0,
          reason: "التوصية الحالية غير جاهزة للمراجعة."
        }
      ]);
    default:
      return withResult([]);
  }
};
