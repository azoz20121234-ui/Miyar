import {
  StandardDefinition,
  StandardsCategory
} from "@/lib/standards-types";

const categoryDomain = (
  category: StandardsCategory,
  domain: string
) => ({ category, domain });

export const platformAccessibilityStandards: StandardDefinition[] = [
  {
    id: "platform-wcag-22",
    code: "PA-WCAG-22",
    title: "WCAG 2.2",
    description: "Reference catalog for interface accessibility review inside Meyar.",
    ...categoryDomain("platform-accessibility", "إتاحة المنصة"),
    type: "مبني على",
    level: "AA",
    ownerRole: "platform-admin",
    status: "أدلة معلّقة",
    checkItems: [
      {
        id: "wcag-keyboard-path",
        label: "مسار لوحة المفاتيح موثق",
        description: "Primary platform flows have a review path for keyboard-only use.",
        scoreImpact: 6,
        blocker: false,
        evidenceType: "platform-review",
        responsibleRole: "platform-admin",
        mappingKey: "platform-keyboard-review",
        evidencePlaceholders: ["Flow review note", "Keyboard walkthrough"]
      },
      {
        id: "wcag-semantic-labels",
        label: "التسميات والدلالات مراجعَة",
        description: "Critical controls have a structured semantic review placeholder.",
        scoreImpact: 5,
        blocker: false,
        evidenceType: "platform-review",
        responsibleRole: "platform-admin",
        mappingKey: "platform-semantic-review",
        evidencePlaceholders: ["Semantic checklist", "Form labeling note"]
      }
    ]
  },
  {
    id: "platform-dga-guidance",
    code: "PA-DGA-01",
    title: "إرشادات النفاذ الرقمي من هيئة الحكومة الرقمية",
    description: "Saudi-first accessibility alignment catalog for the platform layer.",
    ...categoryDomain("platform-accessibility", "إتاحة المنصة"),
    type: "متسق مع",
    level: "إرشادي",
    ownerRole: "platform-admin",
    status: "أدلة معلّقة",
    checkItems: [
      {
        id: "dga-accessibility-ownership",
        label: "تم تعيين مالك للإتاحة",
        description: "The platform has a named owner for accessibility follow-up.",
        scoreImpact: 5,
        blocker: false,
        evidenceType: "platform-review",
        responsibleRole: "platform-admin",
        mappingKey: "platform-accessibility-owner",
        evidencePlaceholders: ["Owner register", "Review cadence"]
      },
      {
        id: "dga-content-access-readiness",
        label: "مراجعة نفاذ المحتوى مهيأة",
        description: "Arabic content accessibility review has a defined evidence slot.",
        scoreImpact: 4,
        blocker: false,
        evidenceType: "platform-review",
        responsibleRole: "platform-admin",
        mappingKey: "platform-content-review",
        evidencePlaceholders: ["Arabic content review", "Reading order note"]
      }
    ]
  },
  {
    id: "platform-en-301-549",
    code: "PA-EN-301-549",
    title: "EN 301 549",
    description: "ICT accessibility reference layer used to structure platform evidence.",
    ...categoryDomain("platform-accessibility", "إتاحة المنصة"),
    type: "مبني على",
    level: "ICT",
    ownerRole: "platform-admin",
    status: "أدلة معلّقة",
    checkItems: [
      {
        id: "en-compatibility-note",
        label: "ملاحظة توافق أدوات الوصول",
        description: "Critical flows have a placeholder for assistive technology compatibility evidence.",
        scoreImpact: 5,
        blocker: false,
        evidenceType: "platform-review",
        responsibleRole: "platform-admin",
        mappingKey: "platform-compatibility-review",
        evidencePlaceholders: ["AT compatibility note", "Primary browser matrix"]
      },
      {
        id: "en-audit-trace-slot",
        label: "خانة أثر الإتاحة",
        description: "The platform keeps a placeholder for future trace and audit evidence.",
        scoreImpact: 4,
        blocker: false,
        evidenceType: "platform-review",
        responsibleRole: "platform-admin",
        mappingKey: "platform-audit-trace",
        evidencePlaceholders: ["Audit trace placeholder", "Review date"]
      }
    ]
  }
];

export const assessmentStandards: StandardDefinition[] = [
  {
    id: "meyar-job-definition",
    code: "MC-JD-01",
    title: "تعريف الوظيفة",
    description: "Structured against Meyar core job framing before assessment starts.",
    ...categoryDomain("assessment-core", "تعريف الوظيفة"),
    type: "منظّم وفق",
    level: "أساسي",
    ownerRole: "hiring-manager",
    status: "نشط",
    checkItems: [
      {
        id: "job-outcomes-documented",
        label: "النتائج موثقة",
        description: "The role includes clear outcomes and operational scope.",
        scoreImpact: 8,
        blocker: false,
        evidenceType: "job-definition",
        responsibleRole: "hiring-manager",
        mappingKey: "job-outcomes-documented",
        evidencePlaceholders: ["Outcome list", "Role summary"]
      },
      {
        id: "job-environment-captured",
        label: "البيئة والأدوات موثقة",
        description: "The case records tools, work mode, and operational risks.",
        scoreImpact: 10,
        blocker: true,
        evidenceType: "job-definition",
        responsibleRole: "hiring-manager",
        mappingKey: "job-environment-captured",
        evidencePlaceholders: ["Tool stack", "Environment note", "Risk note"]
      }
    ]
  },
  {
    id: "meyar-task-reality",
    code: "MC-TR-01",
    title: "واقعية المهام",
    description: "Structured against actual task flow, not job title only.",
    ...categoryDomain("assessment-core", "واقعية المهام"),
    type: "منظّم وفق",
    level: "أساسي",
    ownerRole: "hiring-manager",
    status: "نشط",
    checkItems: [
      {
        id: "task-essential-defined",
        label: "المهام الأساسية محددة",
        description: "Essential tasks are explicitly distinguished from secondary tasks.",
        scoreImpact: 12,
        blocker: true,
        evidenceType: "task-map",
        responsibleRole: "hiring-manager",
        mappingKey: "task-essential-defined",
        evidencePlaceholders: ["Essential task list", "Task tier note"]
      },
      {
        id: "task-adaptable-defined",
        label: "نطاق التعديل محدد",
        description: "The case identifies where redistribution or adaptation is feasible.",
        scoreImpact: 8,
        blocker: false,
        evidenceType: "task-map",
        responsibleRole: "hiring-manager",
        mappingKey: "task-adaptable-defined",
        evidencePlaceholders: ["Adaptable task note", "Redistribution rule"]
      }
    ]
  },
  {
    id: "meyar-capability-evidence",
    code: "MC-CE-01",
    title: "أدلة القدرات",
    description: "Structured against operational evidence rather than medical framing.",
    ...categoryDomain("assessment-core", "أدلة القدرات"),
    type: "منظّم وفق",
    level: "أساسي",
    ownerRole: "assessor",
    status: "نشط",
    checkItems: [
      {
        id: "capability-evidence-present",
        label: "أدلة القدرات موجودة",
        description: "Each capability dimension includes direct evidence or observed note.",
        scoreImpact: 12,
        blocker: true,
        evidenceType: "capability-evidence",
        responsibleRole: "assessor",
        mappingKey: "capability-evidence-present",
        evidencePlaceholders: ["Dimension evidence", "Observed performance note"]
      },
      {
        id: "capability-conditions-captured",
        label: "ظروف العمل موثقة",
        description: "The profile states the conditions required for stable performance.",
        scoreImpact: 8,
        blocker: false,
        evidenceType: "capability-evidence",
        responsibleRole: "assessor",
        mappingKey: "capability-conditions-captured",
        evidencePlaceholders: ["Preferred conditions", "Tool usage note"]
      }
    ]
  },
  {
    id: "meyar-barrier-analysis",
    code: "MC-BA-01",
    title: "تحليل العوائق",
    description: "Structured against explainable barriers linked to task reality.",
    ...categoryDomain("assessment-core", "تحليل العوائق"),
    type: "منظّم وفق",
    level: "أساسي",
    ownerRole: "assessor",
    status: "نشط",
    checkItems: [
      {
        id: "barriers-linked-to-tasks",
        label: "العوائق مرتبطة بالمهام",
        description: "Detected barriers point to affected tasks or tools.",
        scoreImpact: 11,
        blocker: true,
        evidenceType: "barrier-evidence",
        responsibleRole: "assessor",
        mappingKey: "barriers-linked-to-tasks",
        evidencePlaceholders: ["Task linkage", "Barrier source"]
      },
      {
        id: "barriers-rationale-documented",
        label: "مبررات العوائق موثقة",
        description: "Each barrier includes why it was detected and what evidence supports it.",
        scoreImpact: 9,
        blocker: false,
        evidenceType: "barrier-evidence",
        responsibleRole: "assessor",
        mappingKey: "barriers-rationale-documented",
        evidencePlaceholders: ["Detection rationale", "Evidence list"]
      }
    ]
  },
  {
    id: "meyar-accommodation-planning",
    code: "MC-AP-01",
    title: "تخطيط التكييف",
    description: "Structured against implementable adjustments linked to barriers and tasks.",
    ...categoryDomain("assessment-core", "تخطيط التكييف"),
    type: "منظّم وفق",
    level: "أساسي",
    ownerRole: "assessor",
    status: "نشط",
    checkItems: [
      {
        id: "accommodations-linked",
        label: "التكييفات مرتبطة",
        description: "Each proposed accommodation is linked to barriers and supported tasks.",
        scoreImpact: 12,
        blocker: true,
        evidenceType: "accommodation-plan",
        responsibleRole: "assessor",
        mappingKey: "accommodations-linked",
        evidencePlaceholders: ["Barrier mapping", "Task mapping"]
      },
      {
        id: "accommodations-scoped",
        label: "التكلفة والزمن محددان",
        description: "Implementation cost, time, and dependencies are captured.",
        scoreImpact: 10,
        blocker: true,
        evidenceType: "accommodation-plan",
        responsibleRole: "assessor",
        mappingKey: "accommodations-scoped",
        evidencePlaceholders: ["Cost range", "Time to implement", "Dependencies"]
      }
    ]
  },
  {
    id: "meyar-residual-risk",
    code: "MC-RR-01",
    title: "المخاطر المتبقية",
    description: "Structured against visible residual risk after the proposed plan.",
    ...categoryDomain("assessment-core", "المخاطر المتبقية"),
    type: "منظّم وفق",
    level: "أساسي",
    ownerRole: "compliance-reviewer",
    status: "نشط",
    checkItems: [
      {
        id: "residual-risk-stated",
        label: "المخاطر المتبقية مذكورة",
        description: "The final report explicitly states the remaining risk level.",
        scoreImpact: 8,
        blocker: false,
        evidenceType: "decision-trace",
        responsibleRole: "compliance-reviewer",
        mappingKey: "residual-risk-stated",
        evidencePlaceholders: ["Residual risk note", "Decision summary"]
      },
      {
        id: "residual-risk-visible",
        label: "المخاطر المتبقية ظاهرة",
        description: "The case still shows what remains unresolved after accommodation planning.",
        scoreImpact: 7,
        blocker: false,
        evidenceType: "decision-trace",
        responsibleRole: "compliance-reviewer",
        mappingKey: "residual-risk-visible",
        evidencePlaceholders: ["Open risk note", "Uncovered barrier note"]
      }
    ]
  },
  {
    id: "meyar-decision-readiness",
    code: "MC-DR-01",
    title: "جاهزية القرار",
    description: "Structured against a readable and explainable decision package.",
    ...categoryDomain("assessment-core", "جاهزية القرار"),
    type: "منظّم وفق",
    level: "أساسي",
    ownerRole: "compliance-reviewer",
    status: "نشط",
    checkItems: [
      {
        id: "decision-rationale-present",
        label: "مبررات القرار موجودة",
        description: "The case includes a direct why-this-decision explanation.",
        scoreImpact: 12,
        blocker: true,
        evidenceType: "decision-trace",
        responsibleRole: "compliance-reviewer",
        mappingKey: "decision-rationale-present",
        evidencePlaceholders: ["Why this decision", "Decision rationale bullets"]
      },
      {
        id: "decision-readiness-delta",
        label: "الجاهزية قبل وبعد موثقة",
        description: "The case shows baseline readiness and expected readiness after implementation.",
        scoreImpact: 9,
        blocker: false,
        evidenceType: "decision-trace",
        responsibleRole: "compliance-reviewer",
        mappingKey: "decision-readiness-delta",
        evidencePlaceholders: ["Baseline readiness", "Projected readiness"]
      }
    ]
  },
  {
    id: "meyar-governance-readiness",
    code: "MC-GR-01",
    title: "جاهزية الحوكمة",
    description: "Structured against accountable ownership before approval.",
    ...categoryDomain("assessment-core", "جاهزية الحوكمة"),
    type: "منظّم وفق",
    level: "أساسي",
    ownerRole: "compliance-reviewer",
    status: "نشط",
    checkItems: [
      {
        id: "governance-owners-assigned",
        label: "ملاك التنفيذ محددون",
        description: "The implementation checklist includes named owners.",
        scoreImpact: 9,
        blocker: true,
        evidenceType: "governance-proof",
        responsibleRole: "compliance-reviewer",
        mappingKey: "governance-owners-assigned",
        evidencePlaceholders: ["Checklist owner", "Execution owner"]
      },
      {
        id: "governance-review-chain",
        label: "سلسلة المراجعة ظاهرة",
        description: "The case shows that review roles still need formal sign-off.",
        scoreImpact: 10,
        blocker: false,
        evidenceType: "governance-proof",
        responsibleRole: "compliance-reviewer",
        mappingKey: "governance-review-chain",
        evidencePlaceholders: ["Hiring review record", "Compliance review record"]
      }
    ]
  }
];

export const governanceStandards: StandardDefinition[] = [
  {
    id: "governance-case-ownership",
    code: "GV-01",
    title: "ملكية الحالة",
    description: "Structured against named ownership before approval moves forward.",
    ...categoryDomain("governance", "معايير الحوكمة"),
    type: "منظّم وفق",
    level: "ضابط",
    ownerRole: "platform-admin",
    status: "نشط",
    checkItems: [
      {
        id: "gov-case-owner-set",
        label: "مالك الحالة محدد",
        description: "The case has a named owner accountable for closure.",
        scoreImpact: 12,
        blocker: true,
        evidenceType: "governance-proof",
        responsibleRole: "platform-admin",
        mappingKey: "gov-case-owner-set",
        evidencePlaceholders: ["Owner field", "Queue assignment"]
      },
      {
        id: "gov-essential-tasks-confirmed",
        label: "المهام الأساسية مؤكدة",
        description: "Essential task selection is ready for governance review.",
        scoreImpact: 10,
        blocker: true,
        evidenceType: "task-map",
        responsibleRole: "hiring-manager",
        mappingKey: "gov-essential-tasks-confirmed",
        evidencePlaceholders: ["Essential task approval", "Task confirmation note"]
      }
    ]
  },
  {
    id: "governance-review-chain",
    code: "GV-02",
    title: "سلسلة المراجعة",
    description: "Structured against the minimum review path before approval.",
    ...categoryDomain("governance", "معايير الحوكمة"),
    type: "منظّم وفق",
    level: "ضابط",
    ownerRole: "compliance-reviewer",
    status: "نشط",
    checkItems: [
      {
        id: "gov-hiring-review",
        label: "مراجعة مدير التوظيف",
        description: "Task reality must be reviewed by the Hiring Manager.",
        scoreImpact: 12,
        blocker: true,
        evidenceType: "governance-proof",
        responsibleRole: "hiring-manager",
        mappingKey: "gov-hiring-review",
        evidencePlaceholders: ["Manager sign-off", "Task review note"]
      },
      {
        id: "gov-compliance-review",
        label: "مراجعة الامتثال",
        description: "The case must show a compliance review before approval.",
        scoreImpact: 12,
        blocker: true,
        evidenceType: "governance-proof",
        responsibleRole: "compliance-reviewer",
        mappingKey: "gov-compliance-review",
        evidencePlaceholders: ["Compliance note", "Approval trace"]
      }
    ]
  },
  {
    id: "governance-decision-traceability",
    code: "GV-03",
    title: "قابلية تتبع القرار",
    description: "Structured against a defensible and explainable decision trail.",
    ...categoryDomain("governance", "معايير الحوكمة"),
    type: "منظّم وفق",
    level: "ضابط",
    ownerRole: "compliance-reviewer",
    status: "نشط",
    checkItems: [
      {
        id: "gov-explainable-decision",
        label: "قرار قابل للتفسير",
        description: "The decision can be traced back to evidence, barriers, and actions.",
        scoreImpact: 10,
        blocker: true,
        evidenceType: "decision-trace",
        responsibleRole: "compliance-reviewer",
        mappingKey: "gov-explainable-decision",
        evidencePlaceholders: ["Decision trace", "Rationale"]
      },
      {
        id: "gov-evidence-bundle",
        label: "حزمة الأدلة ظاهرة",
        description: "Capability, barrier, and plan evidence appear in one decision package.",
        scoreImpact: 9,
        blocker: false,
        evidenceType: "decision-trace",
        responsibleRole: "compliance-reviewer",
        mappingKey: "gov-evidence-bundle",
        evidencePlaceholders: ["Capability evidence", "Barrier evidence", "Plan evidence"]
      }
    ]
  },
  {
    id: "governance-execution-accountability",
    code: "GV-04",
    title: "مسؤولية التنفيذ",
    description: "Structured against implementable ownership after the decision.",
    ...categoryDomain("governance", "معايير الحوكمة"),
    type: "منظّم وفق",
    level: "ضابط",
    ownerRole: "assessor",
    status: "نشط",
    checkItems: [
      {
        id: "gov-accommodation-owner",
        label: "للتكييف تكلفة وزمن ومالك",
        description: "The plan includes cost, time to implement, and accountable execution ownership.",
        scoreImpact: 11,
        blocker: true,
        evidenceType: "accommodation-plan",
        responsibleRole: "assessor",
        mappingKey: "gov-accommodation-owner",
        evidencePlaceholders: ["Cost range", "Implementation time", "Owner mapping"]
      },
      {
        id: "gov-implementation-scope",
        label: "نطاق التنفيذ ظاهر",
        description: "The case shows expected execution scope before start.",
        scoreImpact: 7,
        blocker: false,
        evidenceType: "accommodation-plan",
        responsibleRole: "assessor",
        mappingKey: "gov-implementation-scope",
        evidencePlaceholders: ["Change volume", "Timeline note"]
      }
    ]
  }
];

export const standardsCatalog = [
  ...platformAccessibilityStandards,
  ...assessmentStandards,
  ...governanceStandards
];
