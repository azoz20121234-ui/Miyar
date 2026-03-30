import { AssessmentBundle } from "@/models/types";
import {
  CaseCheckStatus,
  EvidenceStatus
} from "@/lib/standards-types";

interface MappingEvaluation {
  status: CaseCheckStatus;
  evidenceStatus: EvidenceStatus;
  evidenceSummary: string;
  rationale: string;
}

export interface StandardsMappingRule {
  key: string;
  linkedArtifacts: string[];
  evaluate: (bundle: AssessmentBundle) => MappingEvaluation;
}

const reviewPending = (
  evidenceSummary: string,
  rationale: string
): MappingEvaluation => ({
  status: "needs-review",
  evidenceStatus: "missing",
  evidenceSummary,
  rationale
});

const missingEvidence = (
  evidenceSummary: string,
  rationale: string,
  blocker = false
): MappingEvaluation => ({
  status: blocker ? "blocker" : "missing-evidence",
  evidenceStatus: "missing",
  evidenceSummary,
  rationale
});

const passed = (
  evidenceSummary: string,
  rationale: string
): MappingEvaluation => ({
  status: "passed",
  evidenceStatus: "present",
  evidenceSummary,
  rationale
});

export const standardsMapping: Record<string, StandardsMappingRule> = {
  "platform-keyboard-review": {
    key: "platform-keyboard-review",
    linkedArtifacts: ["platform.review.keyboard"],
    evaluate: () =>
      reviewPending(
        "Evidence pending",
        "Framework موجود لكن لا يوجد بعد trace موثق لمسار لوحة المفاتيح داخل المنصة."
      )
  },
  "platform-semantic-review": {
    key: "platform-semantic-review",
    linkedArtifacts: ["platform.review.semantics"],
    evaluate: () =>
      reviewPending(
        "Evidence pending",
        "تم إنشاء خانة الإثبات فقط. مراجعة labels والدلالات لم تُربط بعد بسجل فحص فعلي."
      )
  },
  "platform-accessibility-owner": {
    key: "platform-accessibility-owner",
    linkedArtifacts: ["platform.review.owner"],
    evaluate: () =>
      missingEvidence(
        "Owner field missing",
        "يوجد owner role على مستوى الكتالوج، لكن لا يوجد owner مسجل بعد كسجل متابعة accessibility.",
        false
      )
  },
  "platform-content-review": {
    key: "platform-content-review",
    linkedArtifacts: ["platform.review.content"],
    evaluate: () =>
      reviewPending(
        "Evidence pending",
        "المنصة مهيأة لربط المراجعة، لكن مراجعة ترتيب القراءة والمحتوى العربي ما زالت pending."
      )
  },
  "platform-compatibility-review": {
    key: "platform-compatibility-review",
    linkedArtifacts: ["platform.review.compatibility"],
    evaluate: () =>
      reviewPending(
        "Evidence pending",
        "لا يوجد بعد سجل يثبت اختبار التوافق مع أدوات الوصول عبر المتصفحات الأساسية."
      )
  },
  "platform-audit-trace": {
    key: "platform-audit-trace",
    linkedArtifacts: ["platform.review.audit-trace"],
    evaluate: () =>
      missingEvidence(
        "Audit trace placeholder only",
        "تم تجهيز placeholder للتدقيق لاحقًا، لكن لا يوجد audit backend أو سجل فحص فعلي الآن."
      )
  },
  "job-outcomes-documented": {
    key: "job-outcomes-documented",
    linkedArtifacts: ["job.summary", "job.outcomes"],
    evaluate: (bundle) =>
      bundle.job.outcomes.length >= 2 && bundle.job.summary.trim().length > 30
        ? passed(
            `${bundle.job.outcomes.length} outcomes`,
            "الوظيفة معرفة بنتائج تشغيلية واضحة وليست مسمى فقط."
          )
        : missingEvidence(
            "Outcomes incomplete",
            "الوظيفة تحتاج نتائج تشغيلية أوضح قبل الاعتماد."
          )
  },
  "job-environment-captured": {
    key: "job-environment-captured",
    linkedArtifacts: ["job.environment", "job.tools"],
    evaluate: (bundle) =>
      bundle.job.tools.length >= 3 && bundle.job.environment.risks.length >= 1
        ? passed(
            `${bundle.job.tools.length} tools • ${bundle.job.environment.risks.length} risks`,
            "أدوات العمل وبيئة التشغيل والمخاطر الأساسية موثقة داخل الحالة."
          )
        : missingEvidence(
            "Environment note missing",
            "البيئة أو الأدوات أو المخاطر التشغيلية غير مكتملة.",
            true
          )
  },
  "task-essential-defined": {
    key: "task-essential-defined",
    linkedArtifacts: ["job.tasks.taskTier"],
    evaluate: (bundle) => {
      const essentialTasks = bundle.job.tasks.filter((task) => task.essential);
      return essentialTasks.length >= 3
        ? passed(
            `${essentialTasks.length} essential tasks`,
            "تم تثبيت المهام الأساسية بما يكفي لدعم قرار تشغيلي واضح."
          )
        : missingEvidence(
            "Essential tasks incomplete",
            "عدد المهام الأساسية المحددة غير كافٍ لدعم القرار.",
            true
          );
    }
  },
  "task-adaptable-defined": {
    key: "task-adaptable-defined",
    linkedArtifacts: ["job.tasks.adaptable"],
    evaluate: (bundle) => {
      const adaptableTasks = bundle.job.tasks.filter((task) => task.adaptable);
      return adaptableTasks.length >= 1
        ? passed(
            `${adaptableTasks.length} adaptable tasks`,
            "الحالة تميز بين ما يمكن تعديله وما يجب تثبيته كما هو."
          )
        : reviewPending(
            "Adaptable scope pending",
            "لا يوجد بعد نطاق كافٍ للمهام القابلة للتعديل ضمن هذه الحالة."
          );
    }
  },
  "capability-evidence-present": {
    key: "capability-evidence-present",
    linkedArtifacts: ["profile.dimensions.evidence", "profile.assessmentConfidence"],
    evaluate: (bundle) => {
      const evidenceCount = bundle.profile.dimensions.filter(
        (dimension) => dimension.evidence.trim().length > 0
      ).length;
      return evidenceCount === bundle.profile.dimensions.length &&
        bundle.profile.assessmentConfidence >= 70
        ? passed(
            `${evidenceCount}/${bundle.profile.dimensions.length} dimensions`,
            "ملف القدرات مبني على evidence تشغيلي مباشر عبر جميع الأبعاد."
          )
        : missingEvidence(
            "Capability evidence incomplete",
            "بعض أبعاد القدرات ما زالت بدون evidence كافٍ أو بثقة منخفضة.",
            true
          );
    }
  },
  "capability-conditions-captured": {
    key: "capability-conditions-captured",
    linkedArtifacts: ["profile.workConditions", "profile.preferredModes"],
    evaluate: (bundle) =>
      bundle.profile.workConditions.length >= 2 &&
      bundle.profile.preferredModes.length >= 2
        ? passed(
            `${bundle.profile.workConditions.length} work conditions`,
            "الحالة توضّح الظروف المناسبة للأداء والاستمرارية."
          )
        : missingEvidence(
            "Work conditions missing",
            "الظروف التشغيلية المناسبة للأداء غير مكتملة."
          )
  },
  "barriers-linked-to-tasks": {
    key: "barriers-linked-to-tasks",
    linkedArtifacts: ["barriers.affectedTaskIds"],
    evaluate: (bundle) =>
      bundle.barriers.every((barrier) => barrier.affectedTaskIds.length > 0)
        ? passed(
            `${bundle.barriers.length} linked barriers`,
            "كل عائق مرتبط بمهام أو أدوات متأثرة داخل الحالة."
          )
        : missingEvidence(
            "Barrier linkage missing",
            "هناك عوائق غير مربوطة بمهام فعلية داخل الحالة.",
            true
          )
  },
  "barriers-rationale-documented": {
    key: "barriers-rationale-documented",
    linkedArtifacts: ["barriers.whyDetected", "barriers.evidence"],
    evaluate: (bundle) =>
      bundle.barriers.every(
        (barrier) =>
          barrier.whyDetected.trim().length > 0 && barrier.evidence.length > 0
      )
        ? passed(
            "Barrier rationale present",
            "العوائق موثقة بتفسير واضح وإثباتات تشغيلية مباشرة."
          )
        : reviewPending(
            "Barrier evidence pending",
            "بعض العوائق تحتاج صياغة evidence أوضح قبل الاعتماد."
          )
  },
  "accommodations-linked": {
    key: "accommodations-linked",
    linkedArtifacts: ["plan.items.linkedBarrierIds", "plan.items.linkedTaskIds"],
    evaluate: (bundle) =>
      bundle.plan.items.every(
        (item) =>
          item.linkedBarrierIds.length > 0 && item.linkedTaskIds.length > 0
      )
        ? passed(
            `${bundle.plan.items.length} linked accommodations`,
            "التكييفات المقترحة مرتبطة بالعائق والمهمة، وليس بنوع الإعاقة فقط."
          )
        : missingEvidence(
            "Accommodation linkage missing",
            "بعض التكييفات غير مربوطة بالعائق أو المهمة المستهدفة.",
            true
          )
  },
  "accommodations-scoped": {
    key: "accommodations-scoped",
    linkedArtifacts: ["plan.items.cost", "plan.items.implementationDays", "plan.items.dependencies"],
    evaluate: (bundle) =>
      bundle.plan.items.every(
        (item) =>
          item.implementationDays > 0 &&
          item.estimatedCostRangeSar.max > 0 &&
          item.dependencyRequirements.length > 0
      )
        ? passed(
            `${bundle.plan.maxImplementationDays} days max`,
            "كل تكييف يحتوي نطاق تكلفة وزمن ومتطلبات تنفيذ أولية."
          )
        : missingEvidence(
            "Cost or time missing",
            "واحد أو أكثر من التكييفات يحتاج تكلفة أو زمن أو dependencies أوضح.",
            true
          )
  },
  "residual-risk-stated": {
    key: "residual-risk-stated",
    linkedArtifacts: ["report.residualRiskLevel", "report.whyThisDecision"],
    evaluate: (bundle) =>
      bundle.report.residualRiskLevel
        ? passed(
            bundle.report.residualRiskLevel,
            "مستوى المخاطر المتبقي ظاهر داخل التقرير التنفيذي."
          )
        : missingEvidence(
            "Residual risk missing",
            "التقرير لا يوضح المخاطر المتبقية بشكل صريح."
          )
  },
  "residual-risk-visible": {
    key: "residual-risk-visible",
    linkedArtifacts: ["report.topBarriers", "plan.barrierCoverage"],
    evaluate: (bundle) =>
      bundle.report.topBarriers.length > 0 && bundle.plan.barrierCoverage < 100
        ? passed(
            `${bundle.plan.barrierCoverage}% coverage`,
            "الحالة لا تخفي ما تبقى من فجوات بعد الخطة المقترحة."
          )
        : reviewPending(
            "Residual risk review",
            "المخاطر المتبقية تحتاج قراءة مراجعة إضافية داخل مسار الامتثال."
          )
  },
  "decision-rationale-present": {
    key: "decision-rationale-present",
    linkedArtifacts: ["report.whyThisDecision", "report.decisionRationale"],
    evaluate: (bundle) =>
      bundle.report.whyThisDecision.trim().length > 0 &&
      bundle.report.decisionRationale.length >= 3
        ? passed(
            `${bundle.report.decisionRationale.length} rationale points`,
            "القرار النهائي مفسر بوضوح من task fit إلى التكييف ثم الجاهزية."
          )
        : missingEvidence(
            "Decision rationale missing",
            "الحالة تحتاج rationale أوضح قبل إصدار القرار.",
            true
          )
  },
  "decision-readiness-delta": {
    key: "decision-readiness-delta",
    linkedArtifacts: ["report.baselineReadiness", "report.finalReadiness"],
    evaluate: (bundle) =>
      bundle.report.finalReadiness >= bundle.report.baselineReadiness
        ? passed(
            `${bundle.report.baselineReadiness}% → ${bundle.report.finalReadiness}%`,
            "التقرير يظهر أثر التهيئة على الجاهزية بشكل مباشر."
          )
        : missingEvidence(
            "Readiness delta missing",
            "الحالة لا تعرض أثر التهيئة على الجاهزية بما يكفي."
          )
  },
  "governance-owners-assigned": {
    key: "governance-owners-assigned",
    linkedArtifacts: ["report.checklist.owner"],
    evaluate: (bundle) =>
      bundle.report.checklist.every((item) => item.owner.trim().length > 0)
        ? passed(
            `${bundle.report.checklist.length} checklist owners`,
            "لكل إجراء أساسي owner واضح داخل checklist الحالي."
          )
        : missingEvidence(
            "Owner missing",
            "توجد عناصر تنفيذية بدون owner مسجل.",
            true
          )
  },
  "governance-review-chain": {
    key: "governance-review-chain",
    linkedArtifacts: ["portal.review-chain"],
    evaluate: () =>
      reviewPending(
        "Formal sign-off pending",
        "المنصة تعرض المسار المطلوب لكن لا تحفظ بعد سجلات اعتماد فعلية داخل الـ MVP."
      )
  },
  "gov-case-owner-set": {
    key: "gov-case-owner-set",
    linkedArtifacts: ["case.owner"],
    evaluate: () =>
      missingEvidence(
        "Case owner missing",
        "لا يوجد field محفوظ بعد لمالك الحالة المسؤول عن الإغلاق النهائي.",
        true
      )
  },
  "gov-essential-tasks-confirmed": {
    key: "gov-essential-tasks-confirmed",
    linkedArtifacts: ["job.tasks.taskTier", "job.tasks.essential"],
    evaluate: (bundle) => {
      const essentialTasks = bundle.job.tasks.filter((task) => task.essential);
      return essentialTasks.length >= 3
        ? passed(
            `${essentialTasks.length} essential tasks`,
            "تقسيم essential tasks جاهز للمراجعة الإدارية."
          )
        : missingEvidence(
            "Essential tasks unconfirmed",
            "المهام الأساسية لم تُحسم بعد بشكل كافٍ.",
            true
          );
    }
  },
  "gov-hiring-review": {
    key: "gov-hiring-review",
    linkedArtifacts: ["review.hiring-manager"],
    evaluate: () =>
      missingEvidence(
        "Hiring Manager review pending",
        "اعتماد Hiring Manager مطلوب لكنه غير محفوظ بعد كسجل مراجعة فعلي.",
        true
      )
  },
  "gov-compliance-review": {
    key: "gov-compliance-review",
    linkedArtifacts: ["review.compliance"],
    evaluate: () =>
      missingEvidence(
        "Compliance review pending",
        "مراجعة Compliance Reviewer جزء blocker قبل الاعتماد النهائي وما زالت pending.",
        true
      )
  },
  "gov-explainable-decision": {
    key: "gov-explainable-decision",
    linkedArtifacts: ["report.whyThisDecision", "report.decisionRationale", "barriers", "plan.items"],
    evaluate: (bundle) =>
      bundle.report.decisionRationale.length >= 3 &&
      bundle.barriers.length > 0 &&
      bundle.plan.items.length > 0
        ? passed(
            "Decision trace visible",
            "يمكن تتبع القرار من العوائق إلى الخطة إلى أثر الجاهزية."
          )
        : missingEvidence(
            "Decision trace incomplete",
            "سلسلة تفسير القرار غير مكتملة بما يكفي.",
            true
          )
  },
  "gov-evidence-bundle": {
    key: "gov-evidence-bundle",
    linkedArtifacts: ["profile.dimensions.evidence", "barriers.evidence", "plan.items"],
    evaluate: (bundle) =>
      bundle.profile.dimensions.every((dimension) => dimension.evidence.trim().length > 0) &&
      bundle.barriers.every((barrier) => barrier.evidence.length > 0)
        ? passed(
            "Evidence bundle present",
            "الحالة تجمع Evidence القدرات والعوائق وخطة التكييف في حزمة واحدة."
          )
        : reviewPending(
            "Evidence bundle review",
            "بعض أدلة القرار تحتاج استكمالًا قبل اعتماد كامل."
          )
  },
  "gov-accommodation-owner": {
    key: "gov-accommodation-owner",
    linkedArtifacts: ["plan.items.cost", "plan.items.implementationDays", "report.checklist.owner"],
    evaluate: (bundle) =>
      bundle.plan.items.length > 0 &&
      bundle.report.checklist.every((item) => item.owner.trim().length > 0)
        ? passed(
            "Cost, time, owner captured",
            "التكييف المقترح يملك تكلفة وزمن وowner تنفيذي داخل الحزمة الحالية."
          )
        : missingEvidence(
            "Execution accountability incomplete",
            "التكييفات تحتاج owner أوضح أو بيانات تنفيذ ناقصة.",
            true
          )
  },
  "gov-implementation-scope": {
    key: "gov-implementation-scope",
    linkedArtifacts: ["plan.changeVolume", "report.maxImplementationDays"],
    evaluate: (bundle) =>
      bundle.report.maxImplementationDays > 0
        ? passed(
            `${bundle.plan.changeVolume} • ${bundle.report.maxImplementationDays} days`,
            "نطاق التغيير وزمن التنفيذ ظاهرين قبل المباشرة."
          )
        : missingEvidence(
            "Implementation scope missing",
            "نطاق التنفيذ أو زمنه غير واضح داخل الحالة."
          )
  }
};
