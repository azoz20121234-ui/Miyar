import { accommodationsLibrary } from "@/data/accommodations";
import { taskBank } from "@/data/task-bank";
import { CapabilityProfile, Job } from "@/models/types";

export const demoJob: Job = {
  id: "job-admin-support-01",
  title: "أخصائي إدخال بيانات ودعم إداري",
  family: "عمليات مكتبية",
  department: "التشغيل والخدمات المشتركة",
  location: "الرياض",
  summary:
    "دور تشغيلي يركز على إدخال البيانات، تحديث السجلات، إدارة المستندات الرقمية، والاستجابة الكتابية للحالات القياسية.",
  outcomes: [
    "دقة أعلى في السجلات اليومية",
    "سرعة معالجة مستقرة ضمن SLA",
    "تقليل الاستثناءات الناتجة عن ضعف جودة الإدخال"
  ],
  coreSkills: [
    "إتقان أدوات العمل المكتبي",
    "انضباط في القوالب والإجراءات",
    "قدرة على المتابعة الكتابية الدقيقة"
  ],
  tools: ["CRM", "Excel", "Outlook", "نظام التذاكر", "SharePoint"],
  environment: {
    id: "env-admin-support-01",
    mode: "hybrid",
    lighting: "standard",
    noiseLevel: "moderate",
    mobilityDemand: "low",
    accessibilityMaturity: "basic",
    communicationPattern: "written-first",
    tools: ["CRM", "Excel", "Outlook", "Teams", "قاعدة معرفة داخلية"],
    risks: [
      "وجود ملفات PDF مصورة ضمن بعض الطلبات",
      "بعض الحقول داخل CRM غير موسومة بالكامل",
      "تفاوت جودة القوالب بين الفرق"
    ]
  },
  tasks: taskBank
};

export const demoCapabilityProfile: CapabilityProfile = {
  id: "candidate-low-vision-01",
  candidateAlias: "مرشح A",
  targetDisability: "visual",
  headline:
    "قدرة تشغيلية قوية في الأعمال المكتبية الرقمية عند توفر أدوات وصول رقمية مستقرة وتدفق مكتوب واضح.",
  dimensions: [
    {
      id: "digital-navigation",
      label: "التنقل الرقمي",
      score: 82,
      note: "يتنقل بكفاءة في الأنظمة المكتبية مع الاعتماد على الاختصارات.",
      evidence: "أداء عملي جيد في بيئات CRM والبريد"
    },
    {
      id: "written-communication",
      label: "التواصل الكتابي",
      score: 88,
      note: "قدرة مرتفعة على الصياغة والردود القياسية.",
      evidence: "ردود دقيقة ومنضبطة ضمن القوالب"
    },
    {
      id: "concentration",
      label: "التركيز والاستمرارية",
      score: 76,
      note: "مناسب للمهام المتكررة إذا كانت القوالب مستقرة.",
      evidence: "يحافظ على وتيرة منتظمة عند تقليل التشتيت"
    },
    {
      id: "desk-mobility",
      label: "الحركة المكتبية",
      score: 91,
      note: "لا توجد قيود تشغيلية مؤثرة على الحركة داخل نطاق المكتب.",
      evidence: "تنقل مكتبي منخفض المخاطر"
    },
    {
      id: "visual-interface",
      label: "التعامل مع الواجهات البصرية",
      score: 54,
      note: "تنخفض الكفاءة عند الاعتماد على عناصر غير موسومة أو جداول كثيفة بصريًا.",
      evidence: "يحتاج تهيئة وصول رقمي قبل الوصول للاستقرار"
    },
    {
      id: "adaptation-readiness",
      label: "الجاهزية للتكييف",
      score: 93,
      note: "استجابة مرتفعة للتكيف مع الأدوات والسياسات المنظمة.",
      evidence: "يتبنى الأدوات المساعدة بسرعة"
    }
  ],
  preferredModes: [
    "تواصل مكتوب أولًا",
    "قوالب عمل مستقرة",
    "إرشادات نصية قصيرة",
    "مهام مكتبية رقمية"
  ],
  toolsMastery: ["قارئ شاشة", "اختصارات لوحة المفاتيح", "Outlook", "Excel الأساسي"],
  workConditions: [
    "تباين بصري مرتفع",
    "نصوص قابلة للقراءة الآلية",
    "تقليل الاعتماد على الملفات المصورة"
  ],
  constraints: [
    "ينخفض الأداء مع النماذج غير الموسومة",
    "يحتاج معالجة بديلة للملفات المصورة",
    "الأعمال البصرية الدقيقة بالكامل غير مفضلة"
  ]
};

export const defaultAccommodationIds = [
  "screen-reader-suite",
  "accessible-templates",
  "workflow-checkpoint",
  "high-contrast-setup"
];

export const defaultLibrary = accommodationsLibrary;
