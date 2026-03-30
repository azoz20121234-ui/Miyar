import { Job, WorkEnvironment } from "@/models/types";

import { taskBankById } from "./task-bank";

const buildEnvironment = (overrides: Partial<WorkEnvironment>): WorkEnvironment => ({
  id: "env-template",
  mode: "hybrid",
  lighting: "standard",
  noiseLevel: "moderate",
  mobilityDemand: "low",
  accessibilityMaturity: "basic",
  communicationPattern: "written-first",
  meetingLoad: "limited",
  documentFormat: "mixed",
  workspacePace: "steady",
  tools: ["Outlook", "Excel", "CRM", "Teams", "قاعدة معرفة"],
  risks: [],
  ...overrides
});

const job = (input: Omit<Job, "tasks"> & { taskIds: string[] }): Job => ({
  ...input,
  tasks: input.taskIds.map((taskId) => taskBankById[taskId])
});

export const roleCatalog: Job[] = [
  job({
    id: "admin-data-support",
    title: "أخصائي دعم إداري وإدخال بيانات",
    family: "عمليات مكتبية",
    department: "التشغيل والخدمات المشتركة",
    location: "الرياض",
    summary:
      "دور يجمع بين إدخال البيانات، إدارة البريد، مراجعة الملفات، والدعم الكتابي في بيئة مكتبية رقمية.",
    outcomes: [
      "استقرار جودة السجلات اليومية",
      "رفع سرعة المعالجة ضمن SLA واضح",
      "خفض الأخطاء الناتجة عن ضعف تنظيم الملفات"
    ],
    coreSkills: ["دقة رقمية", "التزام بالقوالب", "تنسيق كتابي منظم"],
    tools: ["CRM", "Excel", "Outlook", "Teams", "SharePoint"],
    environment: buildEnvironment({
      id: "env-admin-data-support",
      documentFormat: "scan-heavy",
      risks: [
        "بعض المرفقات تصل PDF مصور",
        "واجهة CRM تحتوي على حقول غير موسومة بالكامل",
        "الجداول تحتاج تنقل سريع ودقة في المراجعة"
      ]
    }),
    taskIds: [
      "intake-mail",
      "crm-entry",
      "doc-archiving",
      "written-support",
      "record-validation",
      "daily-report",
      "knowledge-base-search"
    ]
  }),
  job({
    id: "data-entry-specialist",
    title: "أخصائي إدخال بيانات",
    family: "جودة البيانات",
    department: "العمليات",
    location: "الرياض",
    summary: "تركيز أعلى على إدخال البيانات وتنظيفها والتحقق من اكتمال السجلات.",
    outcomes: ["رفع اكتمال السجلات", "خفض التكرار", "تحسين جودة البيانات التشغيلية"],
    coreSkills: ["دقة عالية", "سرعة تنقل رقمي", "تركيز متكرر"],
    tools: ["CRM", "Excel"],
    environment: buildEnvironment({
      id: "env-data-entry-specialist",
      documentFormat: "structured-digital",
      workspacePace: "high-velocity",
      risks: ["كثافة جداول عالية", "ضغط على سرعة التنقل بين الحقول"]
    }),
    taskIds: ["crm-entry", "data-cleaning", "record-validation", "policy-checklist", "daily-report"]
  }),
  job({
    id: "written-customer-support",
    title: "أخصائي خدمة عملاء كتابية",
    family: "خدمة عملاء رقمية",
    department: "تجربة العميل",
    location: "جدة",
    summary: "معالجة الاستفسارات الكتابية القياسية وتوثيقها وتشغيل التصعيدات المحدودة.",
    outcomes: ["تحسين زمن الرد", "رفع اتساق الرسائل", "خفض الأخطاء الإجرائية"],
    coreSkills: ["صياغة مكتوبة", "اتباع قوالب", "بحث سريع في المعرفة"],
    tools: ["Ticketing", "Knowledge Base", "Outlook"],
    environment: buildEnvironment({
      id: "env-written-customer-support",
      communicationPattern: "written-first",
      documentFormat: "structured-digital",
      risks: ["قاعدة معرفة قديمة في بعض المسارات", "قوالب متفاوتة بين الفرق"]
    }),
    taskIds: ["written-support", "knowledge-base-search", "intake-mail", "escalation-queue", "daily-report"]
  }),
  job({
    id: "document-control-coordinator",
    title: "منسق ضبط مستندات",
    family: "حوكمة معلومات",
    department: "الجودة",
    location: "الرياض",
    summary: "مراجعة وتنظيم المستندات الرقمية وربطها بالملفات الصحيحة.",
    outcomes: ["خفض ضياع الملفات", "رفع جودة الأرشفة", "وضوح مرجعية السجلات"],
    coreSkills: ["تنظيم ملفات", "تحقق بصري رقمي", "اتباع naming conventions"],
    tools: ["SharePoint", "Shared Folders"],
    environment: buildEnvironment({
      id: "env-document-control-coordinator",
      documentFormat: "scan-heavy",
      risks: ["مجلدات متفاوتة البنية", "ملفات ممسوحة ضوئيًا"]
    }),
    taskIds: ["doc-archiving", "record-validation", "policy-checklist", "knowledge-base-search"]
  }),
  job({
    id: "hr-operations-assistant",
    title: "مساعد عمليات الموارد البشرية",
    family: "عمليات إدارية",
    department: "الموارد البشرية",
    location: "الرياض",
    summary: "متابعة ملفات الموظفين والنماذج والتحديثات الإدارية الداخلية.",
    outcomes: ["جاهزية ملفات مكتملة", "سرعة متابعة الطلبات", "انضباط في النماذج"],
    coreSkills: ["سرية معلومات", "دقة في النماذج", "متابعة كتابية"],
    tools: ["HR Portal", "Excel", "Outlook"],
    environment: buildEnvironment({
      id: "env-hr-operations-assistant",
      tools: ["HR Portal", "Excel", "Outlook", "Teams"],
      risks: ["نماذج متعددة المصدر", "مرفقات غير موحدة"]
    }),
    taskIds: ["intake-mail", "crm-entry", "policy-checklist", "doc-archiving", "schedule-coordination"]
  }),
  job({
    id: "finance-operations-assistant",
    title: "مساعد عمليات مالية",
    family: "مساندة مالية",
    department: "المالية",
    location: "الرياض",
    summary: "مراجعة أولية للفواتير والنماذج والتتبع الكتابي للحالات الناقصة.",
    outcomes: ["خفض أخطاء الإدخال المالي", "تحسين اكتمال النماذج", "وضوح في حالة الطلب"],
    coreSkills: ["تحقق من الحقول", "دقة رقمية", "تتبع كتابي"],
    tools: ["ERP", "Excel", "Outlook"],
    environment: buildEnvironment({
      id: "env-finance-operations-assistant",
      tools: ["ERP", "Excel", "Outlook"],
      workspacePace: "variable",
      risks: ["نماذج كثيرة الحقول", "مراجعة أرقام دقيقة"]
    }),
    taskIds: ["invoice-verification", "record-validation", "daily-report", "vendor-follow-up"]
  }),
  job({
    id: "compliance-records-assistant",
    title: "مساعد سجلات وامتثال",
    family: "امتثال تشغيلي",
    department: "الامتثال",
    location: "الرياض",
    summary: "مراجعة checklists وسجلات الإثبات وربطها بالحالة الصحيحة قبل الإغلاق.",
    outcomes: ["رفع جاهزية السجلات", "خفض فجوات الإثبات", "تحسين الإغلاق التشغيلي"],
    coreSkills: ["اتباع checklists", "تنظيم ملفات", "مراجعة متسقة"],
    tools: ["Internal Portal", "SharePoint", "Excel"],
    environment: buildEnvironment({
      id: "env-compliance-records-assistant",
      documentFormat: "mixed",
      risks: ["اختلاف جودة ملفات الإثبات", "ضغط على التحقق قبل الإغلاق"]
    }),
    taskIds: ["policy-checklist", "doc-archiving", "record-validation", "daily-report"]
  }),
  job({
    id: "crm-operations-coordinator",
    title: "منسق عمليات CRM",
    family: "تشغيل رقمي",
    department: "المبيعات والعمليات",
    location: "الرياض",
    summary: "إدارة إدخال وتحديث سجلات CRM ومتابعة الاستثناءات الكتابية.",
    outcomes: ["دقة أعلى في CRM", "وضوح حالة السجلات", "خفض التأخير في الإدخال"],
    coreSkills: ["إتقان CRM", "تنقل سريع", "تنظيم استثناءات"],
    tools: ["CRM", "Teams", "Excel"],
    environment: buildEnvironment({
      id: "env-crm-operations-coordinator",
      workspacePace: "high-velocity",
      risks: ["واجهة CRM غير محسنة بالكامل", "كثافة تنقل عالية"]
    }),
    taskIds: ["crm-entry", "data-cleaning", "record-validation", "escalation-queue", "daily-report"]
  }),
  job({
    id: "reporting-support-assistant",
    title: "مساعد دعم تقارير",
    family: "تقارير تشغيلية",
    department: "الإدارة التنفيذية",
    location: "الرياض",
    summary: "تجميع بيانات تشغيلية وتحديث لوحات متابعة وتقارير أسبوعية بسيطة.",
    outcomes: ["وضوح مؤشرات أسبوعية", "تحديث منتظم للمتابعة", "خفض الجهد اليدوي على المدير"],
    coreSkills: ["تجميع بيانات", "تلخيص تشغيلي", "استخدام جداول"],
    tools: ["Excel", "PowerPoint", "BI Export"],
    environment: buildEnvironment({
      id: "env-reporting-support-assistant",
      documentFormat: "structured-digital",
      risks: ["جداول كثيفة", "حاجة إلى قوالب ثابتة للتقارير"]
    }),
    taskIds: ["dashboard-refresh", "daily-report", "data-cleaning", "knowledge-base-search"]
  }),
  job({
    id: "scheduling-and-correspondence",
    title: "منسق مواعيد ومراسلات",
    family: "تنسيق إداري",
    department: "الإدارة",
    location: "جدة",
    summary: "إدارة جداول ورسائل المتابعة والاجتماعات المحدودة لقسم داخلي.",
    outcomes: ["انتظام أعلى للمواعيد", "متابعة كتابية أوضح", "تقليل ضياع الطلبات"],
    coreSkills: ["تنسيق", "تواصل كتابي", "تنظيم متابعة"],
    tools: ["Outlook", "Teams"],
    environment: buildEnvironment({
      id: "env-scheduling-and-correspondence",
      meetingLoad: "limited",
      risks: ["تغييرات متكررة على الجداول", "حاجة لرسائل دقيقة"]
    }),
    taskIds: ["schedule-coordination", "meeting-minutes", "vendor-follow-up", "intake-mail"]
  }),
  job({
    id: "digital-archive-assistant",
    title: "مساعد أرشفة رقمية",
    family: "أرشفة رقمية",
    department: "العمليات",
    location: "الدمام",
    summary: "تنظيم الأرشيف الرقمي وربط الملفات بالمرجع الصحيح ومتابعة جودة الملفات.",
    outcomes: ["أرشيف أكثر وضوحًا", "خفض فقدان الوثائق", "تحسين سرعة الاسترجاع"],
    coreSkills: ["تنظيم مجلدات", "تحقق من الملفات", "ثبات في naming"],
    tools: ["SharePoint", "Shared Drive"],
    environment: buildEnvironment({
      id: "env-digital-archive-assistant",
      documentFormat: "scan-heavy",
      risks: ["كثافة ملفات ممسوحة", "جودة متفاوتة للمرفقات"]
    }),
    taskIds: ["doc-archiving", "record-validation", "knowledge-base-search", "policy-checklist"]
  }),
  job({
    id: "procurement-support-coordinator",
    title: "منسق دعم مشتريات",
    family: "مساندة تشغيلية",
    department: "المشتريات",
    location: "الرياض",
    summary: "متابعة نماذج الطلبات والمرفقات والمراسلات الداخلية قبل التحويل والاعتماد.",
    outcomes: ["وضوح حالة الطلبات", "خفض النواقص", "تحسين سرعة الإغلاق"],
    coreSkills: ["تتبع كتابي", "مراجعة نماذج", "تنسيق داخلي"],
    tools: ["ERP", "Outlook", "Shared Drive"],
    environment: buildEnvironment({
      id: "env-procurement-support-coordinator",
      documentFormat: "mixed",
      risks: ["طلبات متعددة المرفقات", "نماذج متفاوتة المصدر"]
    }),
    taskIds: ["intake-mail", "invoice-verification", "record-validation", "vendor-follow-up", "daily-report"]
  })
];
