import { PipelineCase } from "@/models/types";

export const pipelineCases: PipelineCase[] = [
  {
    id: "case-01",
    company: "شركة خدمات رقمية",
    roleTitle: "إدخال بيانات",
    statusLabel: "مناسب بعد التهيئة",
    readiness: 79,
    costSar: 7350,
    owner: "فريق التمكين"
  },
  {
    id: "case-02",
    company: "مجموعة تشغيل أعمال",
    roleTitle: "خدمة عملاء كتابية",
    statusLabel: "مناسب بشروط",
    readiness: 74,
    costSar: 5900,
    owner: "الموارد البشرية"
  },
  {
    id: "case-03",
    company: "مكتب استشارات",
    roleTitle: "منسق إداري",
    statusLabel: "يحتاج تهيئة إضافية",
    readiness: 63,
    costSar: 9400,
    owner: "التشغيل"
  },
  {
    id: "case-04",
    company: "شركة تقنية",
    roleTitle: "مساعد تقارير",
    statusLabel: "مناسب",
    readiness: 84,
    costSar: 2800,
    owner: "الامتثال"
  }
];
