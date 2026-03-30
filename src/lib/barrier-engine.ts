import { Barrier, CapabilityProfile, Job, TaskFitResult } from "@/models/types";

import { buildCapabilityIndex } from "./task-engine";

const severityWeight: Record<Barrier["severity"], number> = {
  low: 1,
  medium: 2,
  high: 3
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const riskKeywords = ["pdf", "scan", "ممسوحة", "مرفقات", "ملفات مصورة", "مصور"];

const withSeverity = (impact: number): Barrier["severity"] => {
  if (impact >= 15) return "high";
  if (impact >= 9) return "medium";
  return "low";
};

const average = (values: number[]) =>
  values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : 0;

export const detectBarriers = (
  job: Job,
  profile: CapabilityProfile,
  taskResults: TaskFitResult[]
): Barrier[] => {
  const capability = buildCapabilityIndex(profile);
  const barriers: Barrier[] = [];
  const byId = Object.fromEntries(taskResults.map((task) => [task.taskId, task]));

  const visualTasks = job.tasks.filter((task) => task.visualSensitivity >= 68);
  const digitalHeavyTasks = job.tasks.filter((task) => task.digitalNavigationRequirement >= 72);
  const fileHeavyTasks = job.tasks.filter((task) =>
    ["doc-archiving", "record-validation", "invoice-verification"].includes(task.id)
  );
  const qualityTasks = job.tasks.filter((task) =>
    ["record-validation", "policy-checklist", "invoice-verification", "crm-entry"].includes(task.id)
  );
  const audioTasks = job.tasks.filter((task) => task.auditorySensitivity >= 45);
  const motorTasks = job.tasks.filter((task) => task.fineMotorRequirement >= 55);

  const visualDemand = average(visualTasks.map((task) => task.visualSensitivity));
  const digitalDemand = average(digitalHeavyTasks.map((task) => task.digitalNavigationRequirement));
  const lowScoringEssentials = taskResults.filter(
    (task) => task.taskTier === "essential" && task.score < 74
  );

  if (visualTasks.length && (visualDemand - capability.visual >= 8 || job.environment.lighting !== "controlled")) {
    const scoreImpact = clamp((visualDemand - capability.visual) * 0.7 + (job.environment.lighting === "controlled" ? 3 : 8));
    barriers.push({
      id: "ui-readability",
      title: "عبء مرتفع في قراءة الواجهات والحقول",
      type: "tool",
      severity: withSeverity(scoreImpact),
      summary: "الوظيفة تعتمد على قراءة حقول ونوافذ عالية الحساسية البصرية بسرعة ثابتة.",
      whyDetected:
        "تم اكتشاف هذا العائق لأن متوسط الحس البصري في المهام الأساسية مرتفع بينما القدرة الحالية على قراءة الواجهة لا تزال تحتاج دعماً تقنياً وبيئياً.",
      evidence: [
        `${visualTasks.length} مهام تعتمد على حس بصري مرتفع بمتوسط ${Math.round(visualDemand)}%.`,
        `القدرة الحالية على التعامل مع الواجهة البصرية ${capability.visual}%.`,
        `إضاءة البيئة الحالية: ${job.environment.lighting === "controlled" ? "متحكم بها" : job.environment.lighting === "standard" ? "قياسية" : "مرتفعة الوهج"}.`
      ],
      affectedTaskIds: visualTasks.map((task) => task.id),
      scoreImpact,
      confidence: clamp(profile.assessmentConfidence * 0.84),
      targetAccommodationIds: [
        "screen-reader-suite",
        "magnification-profile",
        "contrast-display-kit"
      ],
      residualRiskIfIgnored:
        "سيبقى التنفيذ ممكنًا نظريًا لكن بسرعة أقل وجودة مراجعة متذبذبة في المهام البصرية الحرجة."
    });
  }

  if (digitalHeavyTasks.length && digitalDemand - capability.digital >= 4) {
    const scoreImpact = clamp((digitalDemand - capability.digital) * 0.95 + 5);
    barriers.push({
      id: "navigation-speed",
      title: "بطء محتمل في التنقل بين الأنظمة والحقول",
      type: "task",
      severity: withSeverity(scoreImpact),
      summary: "السرعة المطلوبة في التنقل داخل البريد وCRM والجداول أعلى من المسار الحالي غير المهيأ.",
      whyDetected:
        "تم اكتشاف هذا العائق لأن كثافة التنقل الرقمي في المهام الأساسية تتجاوز القدرة الحالية دون مسار اختصارات أو workflow مبني للوصول.",
      evidence: [
        `${digitalHeavyTasks.length} مهام تتطلب تنقلاً رقمياً بمتوسط ${Math.round(digitalDemand)}%.`,
        `القدرة الحالية على التنقل الرقمي بعد احتساب الجاهزية للتكييف ${capability.digital}%.`,
        `نضج الوصول الرقمي في البيئة: ${job.environment.accessibilityMaturity}.`
      ],
      affectedTaskIds: digitalHeavyTasks.map((task) => task.id),
      scoreImpact,
      confidence: clamp((average(digitalHeavyTasks.map((task) => byId[task.id]?.certainty ?? 0)) + profile.assessmentConfidence) / 2),
      targetAccommodationIds: ["keyboard-workflow", "screen-reader-suite"],
      residualRiskIfIgnored:
        "سيظهر الخطر على شكل تأخير متكرر في تنفيذ السجلات والفرز وليس على شكل فشل مباشر فقط."
    });
  }

  if (
    fileHeavyTasks.length &&
    (job.environment.documentFormat === "scan-heavy" ||
      job.environment.risks.some((risk) =>
        riskKeywords.some((keyword) => risk.toLowerCase().includes(keyword))
      ))
  ) {
    const scoreImpact = clamp(12 + fileHeavyTasks.length * 2);
    barriers.push({
      id: "document-review",
      title: "مراجعة الملفات غير القابلة للوصول",
      type: "task",
      severity: withSeverity(scoreImpact),
      summary: "الملفات الواردة أو المؤرشفة لا تصل دائمًا بصيغة قابلة للقراءة السريعة أو المراجعة الآلية.",
      whyDetected:
        "تم اكتشاف هذا العائق لأن بيئة الدور تعتمد على ملفات مختلطة أو مصورة، ما يرفع زمن المراجعة وجودة التحقق في المهام المرتبطة بالمستندات.",
      evidence: [
        `تنسيق المستندات الحالي: ${job.environment.documentFormat}.`,
        `${fileHeavyTasks.length} مهام تتأثر مباشرة بجودة الملف أو وسمه.`,
        ...job.environment.risks.slice(0, 2)
      ],
      affectedTaskIds: fileHeavyTasks.map((task) => task.id),
      scoreImpact,
      confidence: clamp(profile.assessmentConfidence * 0.8),
      targetAccommodationIds: [
        "document-conversion-playbook",
        "screen-reader-suite",
        "accessible-file-qa"
      ],
      residualRiskIfIgnored:
        "سيبقى الاعتماد على مراجعة بشرية إضافية أو تأخير في إغلاق الحالات التي تعتمد على مرفقات غير مهيأة."
    });
  }

  if (job.environment.accessibilityMaturity !== "advanced" && digitalHeavyTasks.length >= 2) {
    const scoreImpact = job.environment.accessibilityMaturity === "basic" ? 15 : 10;
    barriers.push({
      id: "tool-structure-gap",
      title: "بنية الأدوات لا تزال غير مهيأة بالكامل",
      type: "tool",
      severity: withSeverity(scoreImpact),
      summary: "القوالب والحقول ومسارات العمل في الأدوات الحالية لم تُبنَ بعد على وصول مؤسسي ثابت.",
      whyDetected:
        "تم اكتشاف هذا العائق لأن عبء التوافق لا يقع فقط على المرشح، بل على بنية الأدوات نفسها داخل الدور.",
      evidence: [
        `نضج الوصول الرقمي الحالي: ${job.environment.accessibilityMaturity}.`,
        `${digitalHeavyTasks.length} مهام تعتمد على أدوات تشغيلية كثيفة الحقول.`,
        `أدوات الدور الأساسية: ${job.tools.slice(0, 4).join("، ")}.`
      ],
      affectedTaskIds: digitalHeavyTasks.map((task) => task.id),
      scoreImpact,
      confidence: clamp(profile.assessmentConfidence * 0.82),
      targetAccommodationIds: [
        "accessible-template-pack",
        "keyboard-workflow",
        "screen-reader-suite"
      ],
      residualRiskIfIgnored:
        "سيبقى النجاح معتمدًا على مجهود فردي غير مستدام بدل مسار تشغيل قابل للتكرار داخل الشركة."
    });
  }

  if (qualityTasks.length && lowScoringEssentials.length >= 2) {
    const scoreImpact = clamp(
      average(lowScoringEssentials.map((task) => 100 - task.score)) * 0.42 + 6
    );
    barriers.push({
      id: "quality-check-overhead",
      title: "عبء إضافي على المراجعة وضبط الجودة",
      type: "communication",
      severity: withSeverity(scoreImpact),
      summary: "بعض المهام الحرجة ستحتاج مراجعة أو checkpoint إضافيًا حتى تستقر القوالب ومسار العمل.",
      whyDetected:
        "تم اكتشاف هذا العائق لأن الفجوة الحالية لا تظهر فقط في التنفيذ، بل في العبء الإضافي المطلوب لضمان الجودة قبل الإقفال.",
      evidence: [
        `${lowScoringEssentials.length} مهام أساسية دون حد اعتماد مريح.`,
        `متوسط فجوة هذه المهام ${Math.round(average(lowScoringEssentials.map((task) => 100 - task.score)))} نقطة.`,
        `المهام الأكثر تأثرًا: ${lowScoringEssentials
          .slice(0, 3)
          .map((task) => task.title)
          .join("، ")}.`
      ],
      affectedTaskIds: qualityTasks.map((task) => task.id),
      scoreImpact,
      confidence: clamp(profile.assessmentConfidence * 0.78),
      targetAccommodationIds: [
        "review-checkpoint",
        "accessible-template-pack",
        "accessible-file-qa"
      ],
      residualRiskIfIgnored:
        "سترتفع احتمالية أخطاء التحقق أو الحاجة إلى إعادة العمل في الحالات الدقيقة."
    });
  }

  if (visualTasks.length && job.environment.lighting !== "controlled") {
    const scoreImpact = job.environment.lighting === "high-glare" ? 13 : 8;
    barriers.push({
      id: "workspace-glare",
      title: "تهيئة محطة العمل لا تدعم الاستقرار البصري",
      type: "environment",
      severity: withSeverity(scoreImpact),
      summary: "المحطة الحالية لا تقلل الوهج أو تدعم وضوح الشاشة بما يكفي للمهام الممتدة.",
      whyDetected:
        "تم اكتشاف هذا العائق لأن خصائص البيئة الفيزيائية ترفع الحمل البصري حتى عند توفر كفاءة جيدة في بقية الأبعاد.",
      evidence: [
        `الإضاءة الحالية: ${job.environment.lighting}.`,
        `${visualTasks.length} مهام تتطلب عملاً بصرياً مستمراً.`,
        `القدرة البصرية الحالية ${capability.visual}%، ما يجعل أثر البيئة أوضح على الاستمرارية.`
      ],
      affectedTaskIds: visualTasks.map((task) => task.id),
      scoreImpact,
      confidence: clamp(profile.assessmentConfidence * 0.76),
      targetAccommodationIds: ["magnification-profile", "contrast-display-kit"],
      residualRiskIfIgnored:
        "قد لا تمنع التوظيف، لكنها ستخفض الاستقرار اليومي وترفع إجهاد التنفيذ بمرور الوقت."
    });
  }

  if (
    audioTasks.length &&
    (job.environment.meetingLoad !== "limited" || job.environment.communicationPattern === "verbal-heavy")
  ) {
    const scoreImpact = clamp(audioTasks.length * 4 + (job.environment.meetingLoad === "heavy" ? 5 : 2));
    barriers.push({
      id: "limited-audio-context",
      title: "الاعتماد السمعي أعلى من الحاجة الفعلية للدور",
      type: "communication",
      severity: withSeverity(scoreImpact),
      summary: "تدفق العمل يحتوي على جزء سمعي يمكن خفضه بسياسات مكتوبة دون تغيير جوهر الدور.",
      whyDetected:
        "تم اكتشاف هذا العائق لأن بعض أجزاء التنسيق والاجتماعات ما زالت شفوية أكثر من اللازم مقارنة بطبيعة الدور المكتبية.",
      evidence: [
        `كثافة الاجتماعات: ${job.environment.meetingLoad}.`,
        `نمط التواصل: ${job.environment.communicationPattern}.`,
        `${audioTasks.length} مهام تتأثر بالسياق السمعي أو الاجتماع.`
      ],
      affectedTaskIds: audioTasks.map((task) => task.id),
      scoreImpact,
      confidence: clamp(profile.assessmentConfidence * 0.74),
      targetAccommodationIds: ["meeting-notes-first", "captioned-meetings"],
      residualRiskIfIgnored:
        "سيبقى جزء من الأداء مرهونًا بالالتقاط الفوري بدل التوثيق القابل للمراجعة."
    });
  }

  if (motorTasks.length && average(motorTasks.map((task) => task.fineMotorRequirement)) - capability.fineMotor >= 6) {
    const scoreImpact = clamp(average(motorTasks.map((task) => task.fineMotorRequirement)) - capability.fineMotor + 6);
    barriers.push({
      id: "fine-motor-friction",
      title: "احتكاك في أدوات الإدخال الدقيقة",
      type: "task",
      severity: withSeverity(scoreImpact),
      summary: "بعض الأدوات أو القوالب تزيد الاحتياج لدقة إدخال يمكن تخفيفها بتهيئة محطة العمل.",
      whyDetected:
        "تم اكتشاف هذا العائق لأن متطلبات الإدخال في بعض المهام أعلى من الحاجة إذا بقيت الأدوات بالشكل الحالي.",
      evidence: [
        `${motorTasks.length} مهام تتطلب حركة دقيقة أعلى من المتوسط.`,
        `القدرة الحالية في الحركة الدقيقة ${capability.fineMotor}%.`
      ],
      affectedTaskIds: motorTasks.map((task) => task.id),
      scoreImpact,
      confidence: clamp(profile.assessmentConfidence * 0.72),
      targetAccommodationIds: ["ergonomic-input-setup", "keyboard-workflow"],
      residualRiskIfIgnored:
        "سيرتفع الجهد اليومي دون قيمة تشغيلية إضافية، خصوصًا في الأدوار كثيفة الإدخال."
    });
  }

  return barriers.sort((left, right) => {
    const severityDelta = severityWeight[right.severity] - severityWeight[left.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }

    return right.scoreImpact - left.scoreImpact;
  });
};
