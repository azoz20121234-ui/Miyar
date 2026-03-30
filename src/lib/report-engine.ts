import {
  AccommodationPlan,
  Barrier,
  CapabilityProfile,
  ComplianceSignal,
  ExecutiveChecklistItem,
  Job,
  ReadinessReport,
  SuitabilityStatus,
  TaskFitResult
} from "@/models/types";

import { calculateCriticalCoverage, calculateTaskFit } from "./task-engine";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const severityWeight: Record<Barrier["severity"], number> = {
  low: 3,
  medium: 6,
  high: 10
};

const signalTone = (
  score: number,
  direction: ComplianceSignal["direction"]
): ComplianceSignal["tone"] => {
  if (direction === "higher-better") {
    if (score >= 80) return "positive";
    if (score >= 65) return "watch";
    return "risk";
  }

  if (score <= 25) return "positive";
  if (score <= 40) return "watch";
  return "risk";
};

export const buildReadinessReport = (
  job: Job,
  profile: CapabilityProfile,
  taskResults: TaskFitResult[],
  barriers: Barrier[],
  plan: AccommodationPlan,
  environmentFit: number
): ReadinessReport => {
  const taskFit = calculateTaskFit(taskResults);
  const criticalCoverage = calculateCriticalCoverage(taskResults);
  const accommodationFeasibility = clamp(plan.feasibilityScore);
  const baselineReadiness = estimateBaselineReadiness(taskFit, environmentFit, criticalCoverage, barriers);

  const liftFactor =
    (plan.feasibilityScore / 100) * 0.72 + (plan.barrierCoverage / 100) * 0.18;
  const finalReadiness = clamp(
    baselineReadiness + plan.totalExpectedLift * liftFactor + Math.max(0, accommodationFeasibility - 70) * 0.06
  );
  const readinessDelta = clamp(finalReadiness - baselineReadiness);

  const uncoveredHighBarriers = barriers.filter(
    (barrier) =>
      barrier.severity === "high" &&
      !plan.items.some((item) => item.linkedBarrierIds.includes(barrier.id))
  ).length;

  const riskLevel = resolveRiskLevel(barriers);
  const residualRiskLevel =
    uncoveredHighBarriers > 0 || finalReadiness < 74
      ? "medium"
      : barriers.length >= 4 && plan.barrierCoverage < 90
        ? "medium"
        : "low";

  const confidence = clamp(
    profile.assessmentConfidence * 0.34 +
      average(taskResults.map((task) => task.certainty)) * 0.24 +
      average(barriers.map((barrier) => barrier.confidence || 0)) * 0.14 +
      plan.confidence * 0.28
  );

  let status: SuitabilityStatus = "fit";
  if (finalReadiness < 86 || plan.items.length > 0) status = "conditional";
  if (finalReadiness < 72) status = "needs-preparation";
  if (finalReadiness < 56) status = "not-ready";

  const signals = buildSignals(
    job,
    taskResults,
    barriers,
    plan,
    finalReadiness,
    criticalCoverage,
    confidence
  );

  const topBarriers = barriers.slice(0, 3).map((barrier) => ({
    title: barrier.title,
    summary: barrier.summary
  }));

  const topActions = plan.items.slice(0, 3).map((item) => ({
    title: item.name,
    summary: item.whyRecommended
  }));

  const recommendationMap: Record<SuitabilityStatus, string> = {
    fit: "مناسب ضمن الضوابط الحالية",
    conditional: "مناسب بعد التهيئة",
    "needs-preparation": "يحتاج تهيئة إضافية قبل الاعتماد",
    "not-ready": "غير مناسب حاليًا"
  };

  const whyThisDecision =
    status === "conditional"
      ? "لأن جوهر الدور واضح وملائم، لكن الاستمرارية تعتمد على تثبيت تهيئة محددة التكلفة والزمن قبل الاعتماد الكامل."
      : status === "fit"
        ? "لأن المتطلبات الأساسية مغطاة دون حاجة إلى تغييرات مؤثرة على التشغيل."
        : status === "needs-preparation"
          ? "لأن التهيئة المقترحة تقلل الفجوة لكنها لا تكفي بعد للوصول إلى مستوى اعتماد مطمئن."
          : "لأن الفجوة الحالية ما زالت أعلى من أن تعالج بحزمة محدودة ضمن نطاق MVP.";

  const decisionRationale = [
    `ملاءمة المهام الحالية ${taskFit}% مع تغطية حرجة ${criticalCoverage}%.`,
    `العوائق الأساسية ${barriers.slice(0, 3).map((barrier) => barrier.title).join("، ")}.`,
    `خطة التكييف المقترحة تغطي ${plan.barrierCoverage}% من العوائق خلال ${plan.maxImplementationDays} أيام تقريبًا.`,
    `الجاهزية ترتفع من ${baselineReadiness}% إلى ${finalReadiness}% بعد التنفيذ المتوقع.`
  ];

  return {
    id: "report-executive-01",
    status,
    taskFit,
    environmentFit,
    accommodationFeasibility,
    baselineReadiness,
    finalReadiness,
    readinessDelta,
    criticalCoverage,
    confidence,
    riskLevel,
    residualRiskLevel,
    recommendation: recommendationMap[status],
    executiveSummary:
      status === "conditional"
        ? `التوصية التنفيذية هي المضي في التوظيف المشروط. الدور متوافق تشغيليًا من حيث الجوهر، لكن الجاهزية الفعلية ترتفع إلى ${finalReadiness}% فقط بعد تنفيذ حزمة تكييف واضحة ومحدودة زمنيًا.`
        : `النتيجة الحالية تشير إلى ${recommendationMap[status]} مع الحاجة إلى قراءة القرار ضمن التكلفة والزمن والمخاطر المتبقية.`,
    whyThisDecision,
    decisionRationale,
    topBarriers,
    topActions,
    totalCostRangeSar: plan.totalCostRangeSar,
    maxImplementationDays: plan.maxImplementationDays,
    checklist: buildChecklist(job, plan, signals),
    signals
  };
};

export const estimateBaselineReadiness = (
  taskFit: number,
  environmentFit: number,
  criticalCoverage: number,
  barriers: Barrier[]
) => {
  const barrierPenalty = barriers.reduce((sum, barrier) => sum + severityWeight[barrier.severity], 0);

  return clamp(taskFit * 0.52 + environmentFit * 0.2 + criticalCoverage * 0.28 - barrierPenalty);
};

const resolveRiskLevel = (barriers: Barrier[]): Barrier["severity"] => {
  const high = barriers.filter((barrier) => barrier.severity === "high").length;
  const medium = barriers.filter((barrier) => barrier.severity === "medium").length;

  if (high >= 2 || high + medium >= 4) return "high";
  if (high === 1 || medium >= 2) return "medium";
  return "low";
};

const buildSignals = (
  job: Job,
  taskResults: TaskFitResult[],
  barriers: Barrier[],
  plan: AccommodationPlan,
  finalReadiness: number,
  criticalCoverage: number,
  confidence: number
): ComplianceSignal[] => {
  const essentialTasks = job.tasks.filter((task) => task.taskTier === "essential");
  const roleClarity = clamp(
    62 +
      essentialTasks.length * 3 +
      Math.min(job.outcomes.length * 4, 12) +
      Math.min(job.tasks.filter((task) => task.notes.length > 20).length, 5) * 2
  );

  const realTaskAlignment = clamp(taskResults.reduce((sum, task) => sum + task.score, 0) / taskResults.length);
  const accommodationSufficiency = clamp(
    plan.barrierCoverage * 0.55 + plan.feasibilityScore * 0.2 + Math.min(plan.totalExpectedLift * 1.2, 25)
  );
  const fakeRoleRisk = clamp(
    78 -
      roleClarity * 0.35 -
      criticalCoverage * 0.28 +
      job.tasks.filter((task) => task.redistributionPotential === "high").length * 3 +
      barriers.filter((barrier) => barrier.type === "task").length * 2
  );
  const sustainabilityLikelihood = clamp(
    finalReadiness * 0.58 +
      confidence * 0.2 +
      accommodationSufficiency * 0.16 +
      (100 - fakeRoleRisk) * 0.06
  );

  const signalSpecs = [
    {
      id: "role-clarity",
      label: "Role Clarity Signal",
      score: roleClarity,
      direction: "higher-better" as const,
      rationale: "هل الدور مفكك إلى مهام حقيقية واضحة وليست وظيفة شكلية أو عامة؟"
    },
    {
      id: "real-task-alignment",
      label: "Real-Task Alignment Signal",
      score: realTaskAlignment,
      direction: "higher-better" as const,
      rationale: "يقيس التوافق مع المهام الفعلية داخل الدور، لا مع المسمى فقط."
    },
    {
      id: "accommodation-sufficiency",
      label: "Accommodation Sufficiency Signal",
      score: accommodationSufficiency,
      direction: "higher-better" as const,
      rationale: "هل الخطة المقترحة تكفي فعلاً لتقليل العوائق لا مجرد الإشارة إليها؟"
    },
    {
      id: "fake-role-risk",
      label: "Fake-Role Risk Signal",
      score: fakeRoleRisk,
      direction: "lower-better" as const,
      rationale: "كلما انخفضت هذه الإشارة كان الدور أوضح وأقرب إلى مهمة حقيقية قابلة للاستمرار."
    },
    {
      id: "sustainability-likelihood",
      label: "Sustainability Likelihood Signal",
      score: sustainabilityLikelihood,
      direction: "higher-better" as const,
      rationale: "تقدير احتمالية الاستمرارية بعد التهيئة ضمن بيئة الشركة الحالية."
    }
  ];

  return signalSpecs.map((signal) => ({
    ...signal,
    tone: signalTone(signal.score, signal.direction)
  }));
};

const buildChecklist = (
  job: Job,
  plan: AccommodationPlan,
  signals: ComplianceSignal[]
): ExecutiveChecklistItem[] => {
  const checklist: ExecutiveChecklistItem[] = plan.items.slice(0, 4).map((item, index) => ({
    id: `check-${index + 1}`,
    label:
      item.category === "software"
        ? `اعتماد ${item.name}`
        : item.category === "process"
          ? `توثيق ${item.name}`
          : `تهيئة ${item.name}`,
    rationale: item.whyRecommended,
    owner:
      item.category === "software"
        ? "تقنية المعلومات"
        : item.category === "process"
          ? "التشغيل"
          : "الخدمات المشتركة",
    priority: index < 2 ? "required" : "recommended"
  }));

  const roleRisk = signals.find((signal) => signal.id === "fake-role-risk");
  if (roleRisk && roleRisk.score >= 32) {
    checklist.push({
      id: "check-role-clarity",
      label: "تثبيت وصف المهمة الفعلية قبل المباشرة",
      rationale: `إشارة Fake-Role Risk الحالية عند ${roleRisk.score}%، ما يستلزم تثبيت حدود الدور قبل اعتماد البداية.`,
      owner: "الموارد البشرية",
      priority: "required"
    });
  }

  checklist.push({
    id: "check-live-validation",
    label: "اختبار حي على أدوات الدور قبل المباشرة",
    rationale: `لأن القرار مبني على أدوات ${job.tools.slice(0, 3).join("، ")} ويجب التحقق من فاعلية التكييف داخلها فعليًا.`,
    owner: "التشغيل",
    priority: "required"
  });

  return checklist.slice(0, 6);
};

const average = (values: number[]) =>
  values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : 0;
