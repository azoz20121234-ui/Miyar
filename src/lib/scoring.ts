import {
  Accommodation,
  AccommodationPlan,
  AccommodationPlanItem,
  AssessmentBundle,
  Barrier,
  CapabilityDimension,
  CapabilityProfile,
  DimensionScore,
  Job,
  ReadinessReport,
  SuitabilityStatus,
  TaskFitResult
} from "@/models/types";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const dimensionMap = (dimensions: CapabilityDimension[]) =>
  Object.fromEntries(dimensions.map((dimension) => [dimension.id, dimension.score]));

const demandPenalty = (demand: number, capability: number, weight: number) =>
  Math.max(0, demand - capability) * weight;

export const scoreTask = (job: Job, profile: CapabilityProfile, taskId: string): TaskFitResult => {
  const task = job.tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const capabilities = dimensionMap(profile.dimensions);

  const effectiveVisualCapability = Math.round(
    capabilities["visual-interface"] * 0.58 + capabilities["adaptation-readiness"] * 0.42
  );

  const baseScore =
    100 -
    demandPenalty(task.demands.digitalPrecision, capabilities["digital-navigation"], 0.42) -
    demandPenalty(task.demands.writtenCommunication, capabilities["written-communication"], 0.28) -
    demandPenalty(task.demands.concentration, capabilities["concentration"], 0.22) -
    demandPenalty(task.demands.deskMobility, capabilities["desk-mobility"], 0.08) -
    demandPenalty(task.demands.visualLoad, effectiveVisualCapability, 0.62) +
    (task.adaptable ? 5 : 0) -
    (task.essential && !task.adaptable ? 3 : 0);

  const score = clamp(baseScore);

  let fitLevel: TaskFitResult["fitLevel"] = "strong";
  if (score < 80) fitLevel = "partial";
  if (score < 62) fitLevel = "gap";

  const gapSummary =
    score >= 80
      ? "متوافق تشغيليًا مع ضبط بسيط للأدوات."
      : score >= 62
        ? "يتطلب تهيئة رقمية وسياسة عمل واضحة قبل الاعتماد الكامل."
        : "توجد فجوة تشغيلية واضحة تحتاج معالجة قبل بدء الدور.";

  return {
    taskId: task.id,
    title: task.title,
    essential: task.essential,
    adaptable: task.adaptable,
    timeShare: task.timeShare,
    score,
    fitLevel,
    gapSummary
  };
};

export const scoreEnvironment = (job: Job, profile: CapabilityProfile) => {
  const capabilities = dimensionMap(profile.dimensions);
  let score = 88;

  if (job.environment.accessibilityMaturity === "basic") {
    score -= 14;
  }

  if (job.environment.lighting === "high-glare") {
    score -= 10;
  }

  if (job.environment.communicationPattern !== "written-first") {
    score -= 6;
  }

  if (job.environment.mobilityDemand === "high" && capabilities["desk-mobility"] < 75) {
    score -= 12;
  }

  if (job.environment.noiseLevel === "high" && capabilities["concentration"] < 80) {
    score -= 8;
  }

  return clamp(score);
};

export const detectBarriers = (job: Job, taskResults: TaskFitResult[]): Barrier[] => {
  const barriers: Barrier[] = [];

  if (job.environment.accessibilityMaturity === "basic") {
    barriers.push({
      id: "crm-accessibility",
      title: "ضعف جاهزية الأدوات الرقمية",
      type: "tool",
      severity: "high",
      summary: "الأنظمة الأساسية ما زالت تعتمد على حقول أو قوالب غير موسومة بالكامل.",
      affectedTaskIds: ["crm-entry", "doc-archiving"],
      accommodationIds: ["screen-reader-suite", "accessible-templates"]
    });
  }

  if (job.environment.risks.some((risk) => risk.includes("PDF"))) {
    barriers.push({
      id: "scanned-pdfs",
      title: "اعتماد جزئي على ملفات مصورة",
      type: "task",
      severity: "medium",
      summary: "بعض المدخلات تصل بصيغة غير قابلة للوصول السريع، مما يبطئ الاستجابة الأولية.",
      affectedTaskIds: ["doc-archiving", "intake-mail"],
      accommodationIds: ["accessible-templates"]
    });
  }

  if (taskResults.some((task) => task.essential && task.score < 80)) {
    barriers.push({
      id: "quality-risk",
      title: "مخاطر جودة عند المهام الدقيقة بصريًا",
      type: "task",
      severity: "high",
      summary: "بعض المهام الحرجة تتطلب مراجعة إضافية حتى تستقر القوالب وأدوات الوصول.",
      affectedTaskIds: taskResults
        .filter((task) => task.essential && task.score < 80)
        .map((task) => task.taskId),
      accommodationIds: ["workflow-checkpoint", "high-contrast-setup"]
    });
  }

  if (job.environment.lighting === "standard") {
    barriers.push({
      id: "glare-risk",
      title: "بيئة بصرية غير محسنة",
      type: "environment",
      severity: "medium",
      summary: "الإضاءة القياسية قد ترفع الإجهاد البصري في المهام الممتدة على الشاشات.",
      affectedTaskIds: ["crm-entry", "daily-report"],
      accommodationIds: ["high-contrast-setup"]
    });
  }

  return barriers;
};

export const buildAccommodationPlan = (
  barriers: Barrier[],
  library: Accommodation[]
): AccommodationPlan => {
  const picked = new Map<string, AccommodationPlanItem>();

  barriers.forEach((barrier) => {
    barrier.accommodationIds.forEach((accommodationId) => {
      const accommodation = library.find((item) => item.id === accommodationId);
      if (!accommodation || picked.has(accommodationId)) {
        return;
      }

      picked.set(accommodationId, {
        accommodationId: accommodation.id,
        title: accommodation.title,
        category: accommodation.category,
        rationale: barrier.summary,
        estimatedCostSar: accommodation.costSar,
        implementationDays: accommodation.timelineDays,
        expectedLift: accommodation.impactScore,
        priority: accommodation.priority
      });
    });
  });

  const items = Array.from(picked.values()).sort((left, right) => right.expectedLift - left.expectedLift);
  const totalCostSar = items.reduce((sum, item) => sum + item.estimatedCostSar, 0);
  const maxImplementationDays = items.reduce(
    (maxDays, item) => Math.max(maxDays, item.implementationDays),
    0
  );

  let changeVolume: AccommodationPlan["changeVolume"] = "limited";
  if (totalCostSar >= 6000 || items.length >= 4) changeVolume = "moderate";
  if (totalCostSar >= 9500 || items.length >= 5) changeVolume = "material";

  return {
    id: "plan-demo-01",
    totalCostSar,
    maxImplementationDays,
    changeVolume,
    items
  };
};

export const scoreAccommodationFeasibility = (plan: AccommodationPlan) => {
  let score = 86;

  if (plan.totalCostSar > 8000) {
    score -= 10;
  } else if (plan.totalCostSar > 5000) {
    score -= 5;
  }

  if (plan.maxImplementationDays > 7) {
    score -= 7;
  }

  if (plan.changeVolume === "material") {
    score -= 10;
  }

  return clamp(score);
};

export const buildDimensionScores = (
  profile: CapabilityProfile,
  environmentFit: number
): DimensionScore[] => {
  const base = profile.dimensions.map((dimension) => ({
    label: dimension.label,
    score: dimension.score
  }));

  return [...base, { label: "توافق البيئة", score: environmentFit }];
};

export const buildReadinessReport = (
  job: Job,
  taskResults: TaskFitResult[],
  barriers: Barrier[],
  plan: AccommodationPlan,
  environmentFit: number
): ReadinessReport => {
  const weightedTaskBase = taskResults.reduce((sum, task) => {
    const weight = (task.essential ? 1.35 : 0.7) + task.timeShare / 100;
    const adaptabilityRelief = task.adaptable ? 1.04 : 1;
    return sum + task.score * weight * adaptabilityRelief;
  }, 0);
  const weightTotal = taskResults.reduce((sum, task) => {
    const weight = (task.essential ? 1.35 : 0.7) + task.timeShare / 100;
    return sum + weight;
  }, 0);
  const taskFit = weightTotal === 0 ? 0 : weightedTaskBase / weightTotal;

  const essentialTasks =
    job.tasks.filter((task) => task.essential).length || 1;
  const criticalCoverage =
    (taskResults.filter((task) => task.essential && task.score >= 70).length / essentialTasks) * 100;

  const accommodationFeasibility = scoreAccommodationFeasibility(plan);
  const highBarrierPenalty = barriers.filter((barrier) => barrier.severity === "high").length * 3;
  const finalReadiness = clamp(
    taskFit * 0.42 + environmentFit * 0.18 + accommodationFeasibility * 0.2 + criticalCoverage * 0.2
      - highBarrierPenalty
  );

  let status: SuitabilityStatus = "fit";
  if (finalReadiness < 86) status = "conditional";
  if (finalReadiness < 70) status = "needs-preparation";
  if (finalReadiness < 55) status = "not-ready";

  const severeBarriers = barriers.filter((barrier) => barrier.severity === "high").length;
  const riskLevel = severeBarriers >= 2 ? "high" : severeBarriers === 1 ? "medium" : "low";

  if (status === "fit" && severeBarriers > 0 && plan.items.length > 0) {
    status = "conditional";
  }

  const recommendationMap: Record<SuitabilityStatus, string> = {
    fit: "مناسب مباشرة ضمن الضوابط الحالية.",
    conditional: "مناسب بعد التهيئة.",
    "needs-preparation": "يحتاج تهيئة إضافية قبل القرار النهائي.",
    "not-ready": "غير مناسب حاليًا ضمن البيئة الحالية."
  };

  return {
    id: "report-demo-01",
    status,
    taskFit: clamp(taskFit),
    environmentFit,
    accommodationFeasibility,
    finalReadiness,
    criticalCoverage: clamp(criticalCoverage),
    riskLevel,
    recommendation: recommendationMap[status],
    executiveSummary:
      "القرار الأنسب هو المضي في التوظيف المشروط بعد استكمال حزمة تكييف تشغيلية محدودة ومحددة التكلفة، ما يخفض مخاطر التعثر ويرفع وضوح الاعتماد.",
    keyBarriers: barriers.map((barrier) => barrier.title),
    topAdjustments: plan.items.slice(0, 3).map((item) => item.title)
  };
};

export const buildAssessmentBundle = (
  job: Job,
  profile: CapabilityProfile,
  library: Accommodation[]
): AssessmentBundle => {
  const taskResults = job.tasks.map((task) => scoreTask(job, profile, task.id));
  const environmentFit = scoreEnvironment(job, profile);
  const barriers = detectBarriers(job, taskResults);
  const plan = buildAccommodationPlan(barriers, library);
  const report = buildReadinessReport(job, taskResults, barriers, plan, environmentFit);
  const dimensionScores = buildDimensionScores(profile, environmentFit);

  return {
    job,
    profile,
    taskResults,
    barriers,
    plan,
    report,
    dimensionScores
  };
};

export const statusLabel = (status: SuitabilityStatus) => {
  if (status === "fit") return "مناسب";
  if (status === "conditional") return "مناسب بعد التهيئة";
  if (status === "needs-preparation") return "يحتاج تهيئة إضافية";
  return "غير مناسب حاليًا";
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0
  }).format(value);

export const bandTone = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 65) return "warning";
  return "danger";
};
