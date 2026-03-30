import {
  AtomicTask,
  CapabilityProfile,
  DimensionScore,
  Job,
  TaskFitResult
} from "@/models/types";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const frequencyWeight: Record<AtomicTask["frequency"], number> = {
  continuous: 1.28,
  daily: 1.12,
  weekly: 0.88,
  "event-based": 0.7
};

const contributionWeight = (task: AtomicTask) => {
  const base = task.taskTier === "essential" ? 1.55 : 0.92;
  const durationWeight = Math.min(1.45, 0.7 + task.durationMinutes / 35);
  const intensityWeight = 0.9 + task.intensity * 0.08;
  return Number((base * durationWeight * intensityWeight * frequencyWeight[task.frequency]).toFixed(2));
};

const labelByCode = {
  visual: "الحس البصري",
  auditory: "الاعتماد السمعي",
  fineMotor: "الحركة الدقيقة",
  grossMotor: "الحركة العامة",
  cognitive: "الحمل المعرفي",
  communication: "التواصل المنظم",
  digital: "التنقل الرقمي"
} as const;

export type CapabilityIndex = Record<
  | "visual"
  | "auditory"
  | "fineMotor"
  | "grossMotor"
  | "cognitive"
  | "communication"
  | "digital"
  | "adaptation",
  number
>;

export const buildCapabilityIndex = (profile: CapabilityProfile): CapabilityIndex => {
  const raw = Object.fromEntries(profile.dimensions.map((dimension) => [dimension.id, dimension.score]));
  const adaptation = raw["adaptation-readiness"] ?? 72;
  const visual = raw["visual-interface"] ?? 70;
  const digital = raw["digital-navigation"] ?? 70;

  return {
    visual: clamp(visual * 0.76 + adaptation * 0.24),
    auditory: raw["auditory-processing"] ?? 70,
    fineMotor: raw["fine-motor-control"] ?? 70,
    grossMotor: raw["gross-motor-mobility"] ?? 70,
    cognitive: raw["cognitive-load-management"] ?? 70,
    communication: raw["structured-communication"] ?? 70,
    digital: clamp(digital * 0.8 + adaptation * 0.2),
    adaptation
  };
};

const environmentPenaltyForTask = (job: Job, task: AtomicTask) => {
  let penalty = 0;
  const reasons: Array<{ impact: number; text: string }> = [];

  if (task.visualSensitivity >= 68 && job.environment.documentFormat === "scan-heavy") {
    penalty += 8;
    reasons.push({
      impact: 8,
      text: "صيغة الملفات المختلطة أو المصورة ترفع العبء البصري الفعلي في هذه المهمة."
    });
  }

  if (task.visualSensitivity >= 60 && job.environment.lighting === "standard") {
    penalty += 4;
    reasons.push({
      impact: 4,
      text: "الإضاءة القياسية لا تدعم الاستقرار البصري في المهام الممتدة على الشاشة."
    });
  }

  if (task.visualSensitivity >= 60 && job.environment.lighting === "high-glare") {
    penalty += 9;
    reasons.push({
      impact: 9,
      text: "الوهج المرتفع يضاعف صعوبة قراءة الواجهة والحقول الحساسة."
    });
  }

  if (task.digitalNavigationRequirement >= 70 && job.environment.accessibilityMaturity === "basic") {
    penalty += 7;
    reasons.push({
      impact: 7,
      text: "نضج الوصول الرقمي الأساسي فقط يترك الاعتماد على حلول فردية بدل مسار عمل مؤسسي."
    });
  }

  if (task.communicationRequirement >= 68 && job.environment.communicationPattern === "verbal-heavy") {
    penalty += 6;
    reasons.push({
      impact: 6,
      text: "الاعتماد الشفهي المكثف يضغط على المهام التي يفترض أن تعمل بنمط مكتوب أولًا."
    });
  }

  if (task.auditorySensitivity >= 48 && job.environment.meetingLoad === "heavy") {
    penalty += 4;
    reasons.push({
      impact: 4,
      text: "كثافة الاجتماعات ترفع العبء السمعي بما يفوق دورًا مكتبيًا رقميًا ثابتًا."
    });
  }

  if (task.cognitiveRequirement >= 74 && job.environment.workspacePace === "high-velocity") {
    penalty += 5;
    reasons.push({
      impact: 5,
      text: "سرعة الإيقاع العالية تقلل هامش الاستقرار في المهام متعددة الخطوات."
    });
  }

  return { penalty, reasons };
};

const gapSummaryForScore = (score: number, blockerCodes: string[]) => {
  if (score >= 82) {
    return "التنفيذ ممكن ضمن ضوابط تشغيلية واضحة مع تهيئة محدودة.";
  }

  if (score >= 68) {
    return blockerCodes.includes("visual-load")
      ? "المهمة قابلة للتنفيذ لكن الحس البصري الحالي يفرض تهيئة وصول قبل الاعتماد الكامل."
      : "المهمة قابلة للاعتماد المشروط إذا ثُبتت التهيئة والسياسات المساندة.";
  }

  return "الفجوة التشغيلية ما زالت مؤثرة على الجودة أو السرعة، ولا يكفي الاعتماد الحالي دون معالجة.";
};

export const scoreTask = (job: Job, profile: CapabilityProfile, task: AtomicTask): TaskFitResult => {
  const capability = buildCapabilityIndex(profile);
  const modifiers = environmentPenaltyForTask(job, task);
  const intensityFactor = 0.95 + task.intensity * 0.08;

  const demands = [
    {
      code: "visual",
      demand: task.visualSensitivity,
      capability: capability.visual,
      weight: 0.23
    },
    {
      code: "auditory",
      demand: task.auditorySensitivity,
      capability: capability.auditory,
      weight: 0.06
    },
    {
      code: "fineMotor",
      demand: task.fineMotorRequirement,
      capability: capability.fineMotor,
      weight: 0.08
    },
    {
      code: "grossMotor",
      demand: task.grossMotorRequirement,
      capability: capability.grossMotor,
      weight: 0.05
    },
    {
      code: "cognitive",
      demand: task.cognitiveRequirement,
      capability: capability.cognitive,
      weight: 0.18
    },
    {
      code: "communication",
      demand: task.communicationRequirement,
      capability: capability.communication,
      weight: 0.17
    },
    {
      code: "digital",
      demand: task.digitalNavigationRequirement,
      capability: capability.digital,
      weight: 0.19
    }
  ] as const;

  const reasons: Array<{ impact: number; text: string }> = [];
  const blockerCodes: string[] = [];
  let score = 100;

  demands.forEach((item) => {
    const gap = item.demand - item.capability;
    const strength = item.capability - item.demand;

    if (gap > 0) {
      const impact = gap * item.weight * intensityFactor;
      score -= impact;
      reasons.push({
        impact,
        text: `المهمة تتطلب ${labelByCode[item.code]} عند ${item.demand}% بينما القدرة الحالية ${item.capability}%.`
      });
    }

    if (strength >= 8) {
      const support = Math.min(3.8, strength * item.weight * 0.08);
      score += support;
      reasons.push({
        impact: support,
        text: `القدرة في ${labelByCode[item.code]} تغطي هذا المتطلب بهامش مريح (${item.capability}% مقابل ${item.demand}%).`
      });
    }

    if (gap >= 12) {
      blockerCodes.push(
        item.code === "visual"
          ? "visual-load"
          : item.code === "digital"
            ? "digital-navigation"
            : item.code === "cognitive"
              ? "cognitive-load"
              : item.code
      );
    }
  });

  score -= modifiers.penalty;
  reasons.push(...modifiers.reasons);

  if (task.adaptable) {
    score += 3;
    reasons.push({
      impact: 3,
      text: "المهمة تحتمل إعادة ترتيب الخطوات أو القالب دون المساس بهدف الدور."
    });
  }

  if (task.redistributionPotential === "high") {
    score += 2;
  }

  if (task.taskTier === "essential" && !task.adaptable) {
    score -= 3;
    reasons.push({
      impact: 3,
      text: "المهمة أساسية وغير قابلة لإعادة التوزيع، لذلك أثر الفجوة فيها أعلى على القرار."
    });
  }

  const finalScore = clamp(score);
  const fitLevel =
    finalScore >= 82 ? "strong" : finalScore >= 68 ? "partial" : "gap";

  const certainty = clamp(profile.assessmentConfidence * 0.82 + 12);

  return {
    taskId: task.id,
    title: task.title,
    taskTier: task.taskTier,
    frequency: task.frequency,
    durationMinutes: task.durationMinutes,
    intensity: task.intensity,
    workTool: task.workTool,
    adaptable: task.adaptable,
    redistributionPotential: task.redistributionPotential,
    contributionWeight: contributionWeight(task),
    score: finalScore,
    fitLevel,
    gapSummary: gapSummaryForScore(finalScore, blockerCodes),
    reasons: reasons
      .sort((left, right) => right.impact - left.impact)
      .slice(0, 4)
      .map((item) => item.text),
    certainty,
    blockerCodes: Array.from(new Set(blockerCodes))
  };
};

export const buildTaskResults = (job: Job, profile: CapabilityProfile) =>
  job.tasks.map((task) => scoreTask(job, profile, task));

export const calculateTaskFit = (taskResults: TaskFitResult[]) => {
  const totalWeight = taskResults.reduce((sum, task) => sum + task.contributionWeight, 0);
  if (totalWeight === 0) {
    return 0;
  }

  return clamp(
    taskResults.reduce((sum, task) => sum + task.score * task.contributionWeight, 0) / totalWeight
  );
};

export const calculateCriticalCoverage = (taskResults: TaskFitResult[]) => {
  const essentialTasks = taskResults.filter((task) => task.taskTier === "essential");
  const denominator =
    essentialTasks.reduce((sum, task) => sum + task.contributionWeight, 0) || 1;

  const numerator = essentialTasks
    .filter((task) => task.score >= 72)
    .reduce((sum, task) => sum + task.contributionWeight, 0);

  return clamp((numerator / denominator) * 100);
};

export const scoreEnvironment = (job: Job, profile: CapabilityProfile) => {
  const capability = buildCapabilityIndex(profile);
  let score = 86;

  if (job.environment.accessibilityMaturity === "basic") score -= 14;
  if (job.environment.accessibilityMaturity === "managed") score -= 6;
  if (job.environment.accessibilityMaturity === "advanced") score += 2;

  if (job.environment.lighting === "standard") score -= capability.visual < 72 ? 6 : 3;
  if (job.environment.lighting === "high-glare") score -= 12;

  if (job.environment.communicationPattern === "written-first") score += 4;
  if (job.environment.communicationPattern === "mixed") score -= 1;
  if (job.environment.communicationPattern === "verbal-heavy") score -= 8;

  if (job.environment.documentFormat === "structured-digital") score += 3;
  if (job.environment.documentFormat === "mixed") score -= 3;
  if (job.environment.documentFormat === "scan-heavy") score -= 11;

  if (job.environment.meetingLoad === "limited") score += 2;
  if (job.environment.meetingLoad === "moderate") score -= 2;
  if (job.environment.meetingLoad === "heavy") score -= 7;

  if (job.environment.workspacePace === "steady") score += 2;
  if (job.environment.workspacePace === "variable") score -= 2;
  if (job.environment.workspacePace === "high-velocity") score -= capability.cognitive < 80 ? 8 : 5;

  if (job.environment.mobilityDemand === "moderate" && capability.grossMotor < 72) score -= 5;
  if (job.environment.mobilityDemand === "high" && capability.grossMotor < 82) score -= 10;

  if (profile.preferredModes.some((mode) => mode.includes("مكتوب")) && job.environment.communicationPattern !== "written-first") {
    score -= 4;
  }

  return clamp(score);
};

export const buildEnvironmentExplainability = (job: Job, profile: CapabilityProfile) => {
  const statements: string[] = [];

  statements.push(
    job.environment.accessibilityMaturity === "basic"
      ? "نضج الوصول الرقمي ما زال أساسيًا، ما يعني أن الاعتماد سيقوم على تهيئة إضافية لا على جاهزية أصلية."
      : "يوجد حد أدنى مناسب من نضج الوصول الرقمي يخفف عبء التهيئة قبل التوظيف."
  );

  statements.push(
    job.environment.documentFormat === "scan-heavy"
      ? "صيغة المستندات الحالية ترفع مخاطر البطء والمراجعة اليدوية، خصوصًا في الأدوار التي تعتمد على ملفات واردة."
      : "صيغة المستندات لا تضيف عبئًا كبيرًا على الأداء إذا بقيت القوالب مستقرة."
  );

  statements.push(
    job.environment.communicationPattern === "written-first"
      ? "نمط التواصل المكتوب أولًا يدعم الاستقرار في الأدوار الإدارية والرقمية ضمن MVP."
      : "نمط التواصل الحالي يحتاج ضبطًا حتى لا تنتقل المخاطرة من المهام إلى التنسيق اليومي."
  );

  if (profile.workConditions.some((condition) => condition.includes("لوحة مفاتيح"))) {
    statements.push("وجود مسار عمل لوحة مفاتيح واضح يرفع ملاءمة البيئة بصورة مباشرة لهذا الملف.");
  }

  return statements;
};

export const buildDimensionScores = (
  profile: CapabilityProfile,
  environmentFit: number
): DimensionScore[] => [
  ...profile.dimensions.map((dimension) => ({
    label: dimension.label,
    score: dimension.score
  })),
  {
    label: "توافق البيئة",
    score: environmentFit
  }
];
