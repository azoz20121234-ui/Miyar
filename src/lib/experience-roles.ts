import type { AppRole } from "@/lib/role-model";

export type RoleSurface = "core" | "external";
export type RoleVisibility = "limited" | "operational" | "decision" | "executive" | "full";

export interface ExperienceRoleReference {
  type: RoleSurface;
  code: string;
  label: string;
  description: string;
  homeHref: string;
  primaryLabel: string;
  visibility: RoleVisibility;
  sees: string[];
  edits: string[];
  submits: string[];
  hidden: string[];
  futureReady?: boolean;
}

export const INTERNAL_ROLE_REFERENCE: Record<AppRole, ExperienceRoleReference> = {
  "case-initiator": {
    type: "core",
    code: "case-initiator",
    label: "مبادر الحالة",
    description: "يدخل الحالة ويهيئها قبل انتقالها إلى مسار التقييم.",
    homeHref: "/home",
    primaryLabel: "ابدأ حالة جديدة",
    visibility: "limited",
    sees: ["الحالة", "إدخال الوظيفة", "حالة الإرسال", "المرحلة الحالية"],
    edits: ["بيانات الحالة", "تعريف الوظيفة الأولي", "المالك الأولي"],
    submits: ["إرسال الحالة إلى التقييم"],
    hidden: ["أثر القرار الكامل", "موانع الامتثال التفصيلية", "صلاحيات الاعتماد"]
  },
  assessor: {
    type: "core",
    code: "assessor",
    label: "المقيّم",
    description: "يبني الملف التشغيلي ويغلق فجوات القدرات والعوائق والتكييف.",
    homeHref: "/home",
    primaryLabel: "راجع المطابقة",
    visibility: "operational",
    sees: ["ملف القدرات", "العوائق", "التكييفات", "الأدلة الناقصة", "الإجراء التالي"],
    edits: ["درجات القدرات", "مراجعة العوائق", "خطة التكييف"],
    submits: ["إرسال الحالة إلى مراجعة المدير"],
    hidden: ["الاعتماد النهائي", "إدارة المعايير", "سجل التدقيق الكامل"]
  },
  "hiring-manager": {
    type: "core",
    code: "hiring-manager",
    label: "مدير التوظيف",
    description: "يحسم واقعية الوظيفة ويؤكد المهام الأساسية والقابلة للتعديل.",
    homeHref: "/home",
    primaryLabel: "راجع التوصية",
    visibility: "decision",
    sees: ["واقعية الوظيفة", "اعتماد المهام", "التوصية الحالية", "المرحلة التالية"],
    edits: ["المهام الأساسية", "المهام القابلة للتعديل", "مراجعة المدير"],
    submits: ["إرسال الحالة إلى الامتثال", "إعادة الحالة للتعديل"],
    hidden: ["إدارة النظام", "كتالوج المعايير الكامل", "صلاحيات الإدارة"]
  },
  "compliance-reviewer": {
    type: "core",
    code: "compliance-reviewer",
    label: "مراجع الامتثال",
    description: "يراجع الموانع، الأدلة، وشروط الاعتماد قبل القرار النهائي.",
    homeHref: "/home",
    primaryLabel: "افتح لوحة الاعتماد",
    visibility: "full",
    sees: ["موانع الامتثال", "الأدلة الناقصة", "شروط الاعتماد", "أثر القرار", "السيناريوهات"],
    edits: ["ملاحظات الامتثال ضمن المراجعة الحالية"],
    submits: ["اعتماد", "رفض", "طلب تعديل"],
    hidden: ["إعدادات النظام العميقة", "تحرير قوالب الوظائف مباشرة"]
  },
  "executive-viewer": {
    type: "core",
    code: "executive-viewer",
    label: "المشاهد التنفيذي",
    description: "يطّلع على القرار والمخاطر والسيناريوهات دون أدوات تحرير.",
    homeHref: "/home",
    primaryLabel: "اعرض التقرير",
    visibility: "executive",
    sees: ["ملخص القرار", "المخاطر", "السيناريوهات", "التوصية النهائية"],
    edits: [],
    submits: [],
    hidden: ["نماذج الإدخال", "التحرير التشغيلي", "صلاحيات الاعتماد والتنفيذ"]
  },
  "platform-admin": {
    type: "core",
    code: "platform-admin",
    label: "مدير المنصة",
    description: "يدير القوالب والمعايير والصلاحيات والسجل داخل Meyar Core.",
    homeHref: "/home",
    primaryLabel: "أدر القوالب",
    visibility: "full",
    sees: ["القوالب", "المعايير", "الأدوار والصلاحيات", "السجل", "الإعدادات"],
    edits: ["المعايير", "القوالب", "إعدادات النظام", "الصلاحيات"],
    submits: ["نشر التعديلات التشغيلية الداخلية"],
    hidden: ["لا توجد قيود داخلية رئيسية"]
  }
};

export const EXTERNAL_ROLE_ORDER = [
  "candidate",
  "employer",
  "provider",
  "external-executive"
] as const;

export type ExternalRole = (typeof EXTERNAL_ROLE_ORDER)[number];

export const EXTERNAL_ROLE_REFERENCE: Record<ExternalRole, ExperienceRoleReference> = {
  candidate: {
    type: "external",
    code: "candidate",
    label: "المرشح",
    description: "يبني ملفه الخارجي، يضيف الأدلة، ويرى الخطوة التالية فقط.",
    homeHref: "/external/candidate",
    primaryLabel: "ابدأ الملف",
    visibility: "limited",
    sees: ["ملف القدرات", "الأدلة", "التفضيلات", "ملخص الجاهزية", "متابعة الحالة المحدودة", "التكييفات المقترحة"],
    edits: ["القدرات", "الأدلة", "التفضيلات"],
    submits: ["إرسال الملف إلى الربط"],
    hidden: ["مسار القرار الكامل", "موانع الامتثال الداخلية", "أثر القرار التفصيلي", "صلاحيات الاعتماد"]
  },
  employer: {
    type: "external",
    code: "employer",
    label: "جهة العمل",
    description: "تعرف الوظيفة والمهام والمخاطر والتكييفات قبل إرسالها إلى Meyar Core.",
    homeHref: "/external/employer",
    primaryLabel: "ابدأ الوظيفة",
    visibility: "limited",
    sees: ["الوصف التشغيلي", "المهام الأساسية", "المتطلبات", "المخاطر", "إمكانات التكييف"],
    edits: ["تفكيك الوظيفة", "المتطلبات", "المخاطر", "التكييفات الممكنة"],
    submits: ["إرسال الوظيفة إلى الربط"],
    hidden: ["الجاهزية الداخلية النهائية", "الموانع الداخلية", "تفاصيل أدوار Meyar Core", "الاعتماد النهائي"]
  },
  provider: {
    type: "external",
    code: "provider",
    label: "مزود التهيئة",
    description: "مسار مستقبلي لتنفيذ التكييفات ورفع أدلة التنفيذ.",
    homeHref: "/external/provider",
    primaryLabel: "قريبًا",
    visibility: "operational",
    sees: ["التكييفات المكلف بها", "أدلة التنفيذ", "حالة التنفيذ"],
    edits: ["تأكيد التنفيذ", "رفع أدلة التنفيذ"],
    submits: ["تسليم حالة التنفيذ"],
    hidden: ["قرار الاعتماد الداخلي", "تفاصيل تقييم الأدوار الداخلية"],
    futureReady: true
  },
  "external-executive": {
    type: "external",
    code: "external-executive",
    label: "مشاهد خارجي",
    description: "مسار مستقبلي لعرض مختصر خارجي دون كشف طبقة القرار الداخلية.",
    homeHref: "/external/executive",
    primaryLabel: "قريبًا",
    visibility: "executive",
    sees: ["ملخص الحالة الخارجي", "الخطوة التالية", "حالة الملف"],
    edits: [],
    submits: [],
    hidden: ["الموانع الداخلية", "منهج القرار", "الصلاحيات الداخلية", "أثر القرار الكامل"],
    futureReady: true
  }
};
