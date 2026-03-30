import { Accommodation } from "@/models/types";

export const accommodationsLibrary: Accommodation[] = [
  {
    id: "screen-reader-suite",
    title: "قارئ شاشة مؤسسي مع إعدادات اختصارات",
    category: "software",
    description:
      "تفعيل قارئ شاشة احترافي وربطه بقوالب العمل الأساسية والنظام الداخلي لتقليل الاعتماد على الرؤية المباشرة.",
    addresses: ["visual-load", "crm-accessibility", "document-navigation"],
    costSar: 3200,
    timelineDays: 4,
    impactScore: 24,
    priority: "critical"
  },
  {
    id: "accessible-templates",
    title: "قوالب ونماذج رقمية قابلة للوصول",
    category: "process",
    description:
      "توحيد النماذج والجداول والتذاكر بصياغة قابلة للقراءة الآلية وإزالة الحقول غير الموسومة.",
    addresses: ["crm-accessibility", "scanned-pdfs", "task-consistency"],
    costSar: 1800,
    timelineDays: 6,
    impactScore: 18,
    priority: "critical"
  },
  {
    id: "workflow-checkpoint",
    title: "نقطة مراجعة تشغيلية للحالات الحساسة",
    category: "process",
    description:
      "إضافة مراجعة قصيرة للحالات عالية الأثر بدل فرض فحص بصري كامل على جميع المهام.",
    addresses: ["quality-risk", "sla-pressure"],
    costSar: 950,
    timelineDays: 3,
    impactScore: 12,
    priority: "high"
  },
  {
    id: "high-contrast-setup",
    title: "تهيئة شاشة عالية التباين وتكبير ذكي",
    category: "physical",
    description:
      "تجهيز محطة العمل بإعدادات تباين وإضاءة تقلل الإجهاد البصري وتزيد وضوح التنقل داخل التطبيقات.",
    addresses: ["visual-load", "glare-risk"],
    costSar: 1400,
    timelineDays: 2,
    impactScore: 11,
    priority: "high"
  },
  {
    id: "knowledge-base-rewrite",
    title: "إعادة صياغة قاعدة المعرفة إلى نصوص قصيرة",
    category: "process",
    description:
      "تحويل الإرشادات الطويلة أو المصورة إلى خطوات نصية مختصرة قابلة للبحث والقراءة السريعة.",
    addresses: ["knowledge-access", "scanned-pdfs"],
    costSar: 1200,
    timelineDays: 5,
    impactScore: 10,
    priority: "medium"
  }
];
