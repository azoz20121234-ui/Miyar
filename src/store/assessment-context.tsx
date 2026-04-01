"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { defaultLibrary, demoCapabilityProfile, demoJob } from "@/data/demo-case";
import { evaluateStageActionGuard, evaluateTransitionGuard } from "@/lib/case-guards";
import { createInitialCaseRecord, CASE_STATE_META, type CaseRecord } from "@/lib/case-state";
import { buildDecisionExplainability } from "@/lib/decision-explainer";
import {
  getPrimaryTransition,
  getStageActionForRole,
  getTransitionsForRole
} from "@/lib/case-transitions";
import { getRoleConfig } from "@/lib/role-model";
import { buildStandardsEvaluation } from "@/lib/standards-engine";
import { CaseStandardsEvaluation } from "@/lib/standards-types";
import { roleCatalog } from "@/data/roles";
import { buildAssessmentBundle } from "@/lib/scoring";
import {
  Accommodation,
  CapabilityProfile,
  DecisionExplainability,
  Job
} from "@/models/types";
import { useRoleSession } from "@/store/role-session-context";

type ActionTone = "primary" | "secondary" | "danger" | "neutral";

interface CaseActionItem {
  id: string;
  label: string;
  description: string;
  disabled: boolean;
  reasons: string[];
  kind: "transition" | "stage-action" | "link";
  tone: ActionTone;
  href?: string;
}

interface CaseWorkflowSnapshot {
  currentStateLabel: string;
  nextStageLabel: string;
  currentOwnerLabel: string;
  primaryAction: CaseActionItem;
  transitionActions: CaseActionItem[];
}

interface AssessmentContextValue {
  job: Job;
  profile: CapabilityProfile;
  library: Accommodation[];
  roleCatalog: Job[];
  bundle: ReturnType<typeof buildAssessmentBundle>;
  standards: CaseStandardsEvaluation;
  explainability: DecisionExplainability;
  caseRecord: CaseRecord;
  caseWorkflow: CaseWorkflowSnapshot;
  selectRoleTemplate: (jobId: string) => void;
  toggleTaskEssential: (taskId: string) => void;
  toggleTaskAdaptable: (taskId: string) => void;
  setEnvironmentField: <
    K extends keyof Job["environment"]
  >(
    field: K,
    value: Job["environment"][K]
  ) => void;
  updateDimensionScore: (dimensionId: string, delta: number) => void;
  transitionCase: (transitionId: string) => void;
  completeStageAction: (actionId: string) => void;
  resetDemo: () => void;
}

const STORAGE_KEY = "miyar-demo-assessment";

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

const cloneJob = (jobId?: string): Job =>
  JSON.parse(
    JSON.stringify(roleCatalog.find((role) => role.id === jobId) ?? demoJob)
  ) as Job;
const cloneProfile = (): CapabilityProfile =>
  JSON.parse(JSON.stringify(demoCapabilityProfile)) as CapabilityProfile;
const cloneCaseRecord = (): CaseRecord =>
  JSON.parse(JSON.stringify(createInitialCaseRecord())) as CaseRecord;

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  const { role } = useRoleSession();
  const [job, setJob] = useState<Job>(cloneJob);
  const [profile, setProfile] = useState<CapabilityProfile>(cloneProfile);
  const [caseRecord, setCaseRecord] = useState<CaseRecord>(cloneCaseRecord);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        job: Job;
        profile: CapabilityProfile;
        caseRecord?: CaseRecord;
      };
      setJob(parsed.job ?? cloneJob());
      setProfile(parsed.profile ?? cloneProfile());
      setCaseRecord(parsed.caseRecord ?? cloneCaseRecord());
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ job, profile, caseRecord }));
  }, [job, profile, caseRecord]);

  const toggleTaskEssential = (taskId: string) => {
    setJob((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              essential: !task.essential,
              taskTier: task.essential ? "secondary" : "essential"
            }
          : task
      )
    }));
  };

  const selectRoleTemplate = (jobId: string) => {
    setJob(cloneJob(jobId));
  };

  const toggleTaskAdaptable = (taskId: string) => {
    setJob((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, adaptable: !task.adaptable } : task
      )
    }));
  };

  const setEnvironmentField: AssessmentContextValue["setEnvironmentField"] = (field, value) => {
    setJob((current) => ({
      ...current,
      environment: {
        ...current.environment,
        [field]: value
      }
    }));
  };

  const updateDimensionScore = (dimensionId: string, delta: number) => {
    setProfile((current) => ({
      ...current,
      dimensions: current.dimensions.map((dimension) =>
        dimension.id === dimensionId
          ? {
              ...dimension,
              score: Math.max(20, Math.min(98, dimension.score + delta))
            }
          : dimension
      )
    }));
  };

  const bundle = buildAssessmentBundle(job, profile, defaultLibrary, roleCatalog);
  const standards = buildStandardsEvaluation(bundle);
  const explainability = buildDecisionExplainability(bundle, standards, caseRecord);
  const caseMeta = CASE_STATE_META[caseRecord.state];

  const transitionCase = (transitionId: string) => {
    const transition = getTransitionsForRole(caseRecord.state, role).find(
      (item) => item.id === transitionId
    );

    if (!transition) {
      return;
    }

    const guard = evaluateTransitionGuard(transition.id, bundle, standards, caseRecord);
    if (!guard.allowed) {
      return;
    }

    const timestamp = new Date().toISOString();
    setCaseRecord((current) => ({
      ...current,
      state: transition.to,
      updatedAt: timestamp,
      revisionCount:
        transition.to === "NEEDS_REVISION" ? current.revisionCount + 1 : current.revisionCount,
      managerReviewCompleted:
        transition.to === "MANAGER_REVIEW" ||
        transition.to === "UNDER_ASSESSMENT" ||
        transition.to === "NEEDS_REVISION"
          ? false
          : current.managerReviewCompleted,
      timeline: [
        ...current.timeline,
        {
          id: `timeline-${Date.now()}`,
          at: timestamp,
          actorRole: role,
          action: transition.label,
          note: transition.description,
          fromState: current.state,
          toState: transition.to
        }
      ]
    }));
  };

  const completeStageAction = (actionId: string) => {
    const action = getStageActionForRole(caseRecord.state, role);

    if (!action || action.id !== actionId) {
      return;
    }

    const guard = evaluateStageActionGuard(action.id, bundle, standards, caseRecord);
    if (!guard.allowed) {
      return;
    }

    const timestamp = new Date().toISOString();
    setCaseRecord((current) => ({
      ...current,
      updatedAt: timestamp,
      managerReviewCompleted:
        action.id === "complete-manager-review" ? true : current.managerReviewCompleted,
      timeline: [
        ...current.timeline,
        {
          id: `timeline-${Date.now()}`,
          at: timestamp,
          actorRole: role,
          action: "اكتملت مراجعة المدير",
          note: "تم تأكيد واقعية المهام والمهام الأساسية قبل إرسال الحالة إلى الامتثال.",
          fromState: current.state,
          toState: current.state
        }
      ]
    }));
  };

  const caseWorkflow = useMemo<CaseWorkflowSnapshot>(() => {
    const roleConfig = getRoleConfig(role);
    const currentOwnerLabel =
      caseMeta.ownerRole === "closed" ? "مغلق" : getRoleConfig(caseMeta.ownerRole).label;

    const stageAction = getStageActionForRole(caseRecord.state, role);
    const stageActionItem = stageAction
      ? (() => {
          const guard = evaluateStageActionGuard(
            stageAction.id,
            bundle,
            standards,
            caseRecord
          );

          return {
            id: stageAction.id,
            label: stageAction.label,
            description: stageAction.description,
            disabled: !guard.allowed || caseRecord.managerReviewCompleted,
            reasons:
              caseRecord.managerReviewCompleted
                ? ["اكتملت مراجعة المدير."]
                : guard.blockingReasons,
            kind: "stage-action" as const,
            tone: "primary" as const
          };
        })()
      : null;

    const transitionActions = getTransitionsForRole(caseRecord.state, role).map((transition) => {
      const guard = evaluateTransitionGuard(transition.id, bundle, standards, caseRecord);

      return {
        id: transition.id,
        label: transition.label,
        description: transition.description,
        disabled: !guard.allowed,
        reasons: guard.blockingReasons,
        kind: "transition" as const,
        tone:
          transition.kind === "primary"
            ? ("primary" as const)
            : transition.kind === "danger"
              ? ("danger" as const)
              : ("secondary" as const)
      };
    });

    const primaryTransition = getPrimaryTransition(caseRecord.state, role);
    const primaryTransitionItem = primaryTransition
      ? transitionActions.find((item) => item.id === primaryTransition.id)
      : null;

    let primaryAction: CaseActionItem = {
      id: "view-role-home",
      label: roleConfig.primaryAction.label,
      description: "هذا الدور لا يملك إجراء انتقال مباشر في المرحلة الحالية.",
      disabled: false,
      reasons: [],
      kind: "link",
      tone: "neutral",
      href: roleConfig.primaryAction.href
    };

    if (stageActionItem && !caseRecord.managerReviewCompleted) {
      primaryAction = stageActionItem;
    } else if (primaryTransitionItem) {
      primaryAction = primaryTransitionItem;
    } else if (role === "executive-viewer") {
      primaryAction = {
        id: "view-report",
        label: "اعرض التقرير",
        description: "هذا الدور يطّلع فقط على القرار والمحفظة.",
        disabled: false,
        reasons: [],
        kind: "link",
        tone: "neutral",
        href: "/readiness-report"
      };
    } else if (caseMeta.ownerRole !== "closed" && caseMeta.ownerRole !== role) {
      primaryAction = {
        id: "wait-current-owner",
        label: "اعرض الحالة الحالية",
        description: `الحالة الآن عند ${currentOwnerLabel}.`,
        disabled: false,
        reasons: [],
        kind: "link",
        tone: "neutral",
        href: roleConfig.primaryAction.href
      };
    }

    return {
      currentStateLabel: caseMeta.label,
      nextStageLabel: caseMeta.nextLabel,
      currentOwnerLabel,
      primaryAction,
      transitionActions: [
        ...(stageActionItem && !caseRecord.managerReviewCompleted ? [stageActionItem] : []),
        ...transitionActions
      ]
    };
  }, [bundle, caseMeta, caseRecord, role, standards]);

  const resetDemo = () => {
    setJob(cloneJob());
    setProfile(cloneProfile());
    setCaseRecord(cloneCaseRecord());
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AssessmentContext.Provider
      value={{
        job,
        profile,
        library: defaultLibrary,
        roleCatalog,
        bundle,
        standards,
        explainability,
        caseRecord,
        caseWorkflow,
        selectRoleTemplate,
        toggleTaskEssential,
        toggleTaskAdaptable,
        setEnvironmentField,
        updateDimensionScore,
        transitionCase,
        completeStageAction,
        resetDemo
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);

  if (!context) {
    throw new Error("useAssessment must be used within AssessmentProvider");
  }

  return context;
};
