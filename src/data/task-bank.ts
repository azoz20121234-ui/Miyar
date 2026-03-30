import { AtomicTask } from "@/models/types";

export const taskBank: AtomicTask[] = [
  {
    id: "intake-mail",
    title: "استقبال الطلبات الواردة وفرزها",
    category: "تشغيل إداري",
    description: "فرز الطلبات الواردة عبر البريد والبوابة الداخلية وتحويلها للمسار الصحيح.",
    essential: true,
    adaptable: false,
    timeShare: 20,
    effortLevel: 3,
    movementLevel: 1,
    tools: ["Outlook", "نظام التذاكر"],
    communicationMode: "written",
    demands: {
      digitalPrecision: 75,
      writtenCommunication: 70,
      concentration: 65,
      deskMobility: 35,
      visualLoad: 78
    }
  },
  {
    id: "crm-entry",
    title: "إدخال وتحديث البيانات في النظام",
    category: "إدخال بيانات",
    description: "إدخال الحقول الإلزامية ومراجعة اكتمالها وتحديث السجلات يوميًا.",
    essential: true,
    adaptable: false,
    timeShare: 28,
    effortLevel: 4,
    movementLevel: 1,
    tools: ["CRM", "Excel"],
    communicationMode: "minimal",
    demands: {
      digitalPrecision: 86,
      writtenCommunication: 48,
      concentration: 82,
      deskMobility: 32,
      visualLoad: 88
    }
  },
  {
    id: "doc-archiving",
    title: "أرشفة المستندات الرقمية",
    category: "حوكمة معلومات",
    description: "تنظيم المجلدات، تسمية الملفات، وربطها بالسجل الصحيح.",
    essential: true,
    adaptable: true,
    timeShare: 12,
    effortLevel: 3,
    movementLevel: 1,
    tools: ["SharePoint", "مجلدات مشتركة"],
    communicationMode: "minimal",
    demands: {
      digitalPrecision: 72,
      writtenCommunication: 40,
      concentration: 70,
      deskMobility: 30,
      visualLoad: 80
    }
  },
  {
    id: "daily-report",
    title: "إعداد تقرير يومي مختصر",
    category: "تقارير تشغيلية",
    description: "تلخيص حجم الإنجاز، التذاكر المتأخرة، والاستثناءات التشغيلية.",
    essential: true,
    adaptable: true,
    timeShare: 10,
    effortLevel: 2,
    movementLevel: 1,
    tools: ["Excel", "PowerPoint"],
    communicationMode: "written",
    demands: {
      digitalPrecision: 66,
      writtenCommunication: 84,
      concentration: 62,
      deskMobility: 26,
      visualLoad: 68
    }
  },
  {
    id: "written-support",
    title: "الرد الكتابي على الاستفسارات القياسية",
    category: "خدمة عملاء كتابية",
    description: "الرد عبر قوالب معتمدة وتوثيق الإجراء داخل النظام.",
    essential: true,
    adaptable: true,
    timeShare: 18,
    effortLevel: 3,
    movementLevel: 1,
    tools: ["نظام التذاكر", "قاعدة المعرفة"],
    communicationMode: "written",
    demands: {
      digitalPrecision: 64,
      writtenCommunication: 88,
      concentration: 68,
      deskMobility: 30,
      visualLoad: 72
    }
  },
  {
    id: "escalation-queue",
    title: "تصعيد الحالات ذات المخاطر التشغيلية",
    category: "تنسيق داخلي",
    description: "رفع الحالات غير المطابقة أو الناقصة إلى المسؤول المباشر ضمن SLA محدد.",
    essential: false,
    adaptable: true,
    timeShare: 12,
    effortLevel: 3,
    movementLevel: 1,
    tools: ["Teams", "نظام التذاكر"],
    communicationMode: "mixed",
    demands: {
      digitalPrecision: 58,
      writtenCommunication: 72,
      concentration: 60,
      deskMobility: 34,
      visualLoad: 56
    }
  }
];
