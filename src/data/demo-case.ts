import { accommodationsLibrary } from "@/data/accommodations";
import { roleCatalog } from "@/data/roles";
import { CapabilityProfile, Job } from "@/models/types";

export const demoJob: Job =
  roleCatalog.find((role) => role.id === "admin-data-support") ?? roleCatalog[0];

export const demoCapabilityProfile: CapabilityProfile = {
  id: "candidate-low-vision-01",
  candidateAlias: "مرشح A",
  targetDisability: "visual",
  headline:
    "قدرة تشغيلية قوية في المهام المكتبية الرقمية عند وجود مسار وصول واضح للأدوات والملفات والنماذج.",
  assessmentConfidence: 87,
  dimensions: [
    {
      id: "digital-navigation",
      label: "التنقل الرقمي",
      score: 78,
      note: "يتنقل جيدًا في الأنظمة المكتبية عند وجود اختصارات ومسار عمل واضح.",
      evidence: "أداء مستقر في بيئات بريد وCRM بعد التهيئة"
    },
    {
      id: "visual-interface",
      label: "التعامل مع الواجهات البصرية",
      score: 56,
      note: "ينخفض الأداء مع الحقول غير الموسومة والجداول عالية الكثافة.",
      evidence: "تظهر فجوة واضحة عند الاعتماد على قراءة بصرية مباشرة"
    },
    {
      id: "auditory-processing",
      label: "الاعتماد السمعي",
      score: 79,
      note: "كافٍ للاجتماعات المحدودة إذا كانت القرارات موثقة كتابيًا.",
      evidence: "مناسب للبيئات قليلة الاجتماعات"
    },
    {
      id: "fine-motor-control",
      label: "الحركة الدقيقة",
      score: 86,
      note: "لا توجد قيود تشغيلية مؤثرة على الكتابة والتنقل بلوحة المفاتيح.",
      evidence: "إجادة استخدام الاختصارات والإدخال اليومي"
    },
    {
      id: "gross-motor-mobility",
      label: "الحركة العامة",
      score: 91,
      note: "البيئات المكتبية منخفضة الحركة مناسبة بالكامل.",
      evidence: "تنقل مكتبي منخفض المخاطر"
    },
    {
      id: "cognitive-load-management",
      label: "إدارة الحمل المعرفي",
      score: 74,
      note: "مناسب للمهام المتكررة إذا كانت الخطوات والقوالب مستقرة.",
      evidence: "يحافظ على الجودة عند تقليل التباين بين المسارات"
    },
    {
      id: "structured-communication",
      label: "التواصل المنظم",
      score: 85,
      note: "قوي في الردود الكتابية والتوثيق القصير والإجراءات القياسية.",
      evidence: "أداء قوي في الرسائل والقوالب"
    },
    {
      id: "adaptation-readiness",
      label: "الجاهزية للتكييف",
      score: 94,
      note: "استجابة مرتفعة للأدوات والسياسات المنظمة وتبني سريع للمسارات البديلة.",
      evidence: "يتبنى أدوات الوصول بسرعة ويستقر أداؤه بعد التهيئة"
    }
  ],
  preferredModes: [
    "تواصل مكتوب أولًا",
    "اجتماعات محدودة",
    "قوالب تشغيلية ثابتة",
    "خطوات عمل قصيرة وقابلة للتكرار"
  ],
  toolsMastery: [
    "قارئ شاشة",
    "تكبير ذكي",
    "اختصارات لوحة المفاتيح",
    "Outlook",
    "Excel الأساسي"
  ],
  workConditions: [
    "واجهات موسومة وقابلة للوصول",
    "ملفات رقمية قابلة للقراءة الآلية",
    "انخفاض الاعتماد على المرفقات المصورة",
    "مسار عمل لوحة مفاتيح واضح"
  ],
  operationalStrengths: [
    "استمرارية جيدة في المهام المكتبية المتكررة",
    "انضباط في التوثيق والردود الكتابية",
    "قابلية عالية للتكيف مع الترتيبات التشغيلية"
  ],
  constraints: [
    "تتأثر السرعة في الواجهات غير المهيأة",
    "مراجعة الملفات المصورة ترفع زمن التنفيذ",
    "الجداول شديدة الكثافة تحتاج تهيئة قبل الاعتماد الكامل"
  ]
};

export const defaultLibrary = accommodationsLibrary;
