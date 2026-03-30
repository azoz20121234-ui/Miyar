import { pipelineCases } from "@/data/dashboard";
import { getRoleConfig, type AppRole, type PortalSlug } from "@/lib/role-model";
import { AssessmentBundle } from "@/models/types";

type MetricTone = "neutral" | "success" | "warning" | "danger";

export interface CompactMetric {
  label: string;
  value: string;
  hint: string;
  tone?: MetricTone;
}

export interface ActionItem {
  title: string;
  meta?: string;
  status?: string;
}

export interface QueueRow {
  primary: string;
  secondary: string;
  status: string;
  owner?: string;
}

export interface RoleHomeContent {
  title: string;
  subtitle: string;
  cta: {
    label: string;
    href: string;
  };
  metrics: CompactMetric[];
  actions: ActionItem[];
  rows: QueueRow[];
}

export interface PortalPageContent extends RoleHomeContent {
  sectionLabel: string;
}

const midpoint = (bundle: AssessmentBundle) =>
  `${bundle.report.totalCostRangeSar.midpoint.toLocaleString("ar-SA")} ر.س`;

const sharedRows = (): QueueRow[] =>
  pipelineCases.slice(0, 4).map((item) => ({
    primary: item.company,
    secondary: item.roleTitle,
    status: item.statusLabel,
    owner: item.owner
  }));

export const getRoleHomeContent = (role: AppRole, bundle: AssessmentBundle): RoleHomeContent => {
  const config = getRoleConfig(role);

  switch (role) {
    case "case-initiator":
      return {
        title: "لوحة بدء الحالات",
        subtitle: "ابدأ الحالة وأكمل الإدخال الأولي قبل الإرسال.",
        cta: config.primaryAction,
        metrics: [
          { label: "الحالات المفتوحة", value: "4", hint: "ضمن نطاقك", tone: "neutral" },
          { label: "جاهز للإرسال", value: "1", hint: "بانتظار ضغطك", tone: "success" },
          { label: "تعديل مطلوب", value: "2", hint: "عادت من المراجعة", tone: "warning" }
        ],
        actions: [
          { title: "ابدأ حالة جديدة", meta: "تعيين الوظيفة + البيانات الأساسية", status: "الآن" },
          { title: "أكمل Job Intake", meta: bundle.job.title, status: "نشطة" },
          { title: "أرسل الحالة للمراجعة", meta: "بعد اكتمال المتطلبات", status: "التالي" }
        ],
        rows: sharedRows()
      };
    case "assessor":
      return {
        title: "لوحة التقييم",
        subtitle: "راجع الملف التشغيلي والعوائق والخطة المقترحة.",
        cta: config.primaryAction,
        metrics: [
          { label: "حالات معيّنة", value: "3", hint: "قيد العمل", tone: "neutral" },
          { label: "عوائق مفتوحة", value: `${bundle.barriers.length}`, hint: "في الحالة الحالية", tone: "warning" },
          { label: "خطط تكييف", value: `${bundle.plan.items.length}`, hint: "جاهزة للمراجعة", tone: "success" }
        ],
        actions: [
          { title: "حدّث ملف القدرات", meta: bundle.profile.candidateAlias, status: "بانتظارك" },
          { title: "راجع العوائق", meta: `${bundle.barriers.length} عوائق مستخرجة`, status: "مفتوح" },
          { title: "أكمل خطة التكييف", meta: midpoint(bundle), status: "جاهز" }
        ],
        rows: sharedRows()
      };
    case "hiring-manager":
      return {
        title: "لوحة مدير التوظيف",
        subtitle: "أكد واقعية الدور وراجع التوصية قبل الاعتماد.",
        cta: config.primaryAction,
        metrics: [
          { label: "بانتظار مراجعتك", value: "2", hint: "حالات الفريق", tone: "warning" },
          {
            label: "مهام أساسية",
            value: `${bundle.job.tasks.filter((task) => task.essential).length}`,
            hint: "في الحالة الحالية",
            tone: "neutral"
          },
          { label: "جاهز للتوصية", value: "1", hint: "بعد مراجعة المهام", tone: "success" }
        ],
        actions: [
          { title: "راجع واقعية المهام", meta: bundle.job.title, status: "نشطة" },
          { title: "أكّد essential vs adaptable", meta: "ضمن Task Validation", status: "مفتوح" },
          { title: "اعتمد أو أعد للتعديل", meta: bundle.report.recommendation, status: "قرار" }
        ],
        rows: sharedRows()
      };
    case "compliance-reviewer":
      return {
        title: "لوحة الامتثال",
        subtitle: "راجع decision trace واعتمد القرار أو اطلب استكمال.",
        cta: config.primaryAction,
        metrics: [
          { label: "طابور الامتثال", value: "3", hint: "جاهز للمراجعة", tone: "neutral" },
          { label: "جاهز للاعتماد", value: "1", hint: "قرار شبه مكتمل", tone: "success" },
          { label: "استكمال مطلوب", value: "1", hint: "قبل الاعتماد", tone: "warning" }
        ],
        actions: [
          { title: "افتح Decision Trace", meta: "تحقق من مبررات القرار", status: "الآن" },
          { title: "راجع المعايير", meta: `${bundle.report.signals.length} إشارات`, status: "مفتوح" },
          { title: "اعتمد أو ارفض", meta: bundle.report.recommendation, status: "قرار" }
        ],
        rows: sharedRows()
      };
    case "executive-viewer":
      return {
        title: "لوحة تنفيذية",
        subtitle: "رؤية سريعة للمحفظة والقرارات والتكلفة.",
        cta: config.primaryAction,
        metrics: [
          { label: "قرارات نشطة", value: `${pipelineCases.length}`, hint: "في المحفظة", tone: "neutral" },
          { label: "متوسط الجاهزية", value: "75%", hint: "محفظة حالية", tone: "success" },
          { label: "قرار معتمد", value: "4", hint: "آخر دورة", tone: "neutral" }
        ],
        actions: [
          { title: "راجع Portfolio Dashboard", meta: "عرض المحفظة الحالية", status: "جاهز" },
          { title: "افتح التقارير", meta: "قراءة تنفيذية", status: "مفتوح" },
          { title: "راجع الاتجاهات", meta: "التكلفة والجاهزية", status: "ملخص" }
        ],
        rows: sharedRows()
      };
    case "platform-admin":
      return {
        title: "لوحة إدارة المنصة",
        subtitle: "إدارة القوالب والمعايير والصلاحيات وسجل التدقيق.",
        cta: config.primaryAction,
        metrics: [
          { label: "قوالب نشطة", value: `${bundle.roleCatalog.length}`, hint: "ضمن النظام", tone: "neutral" },
          { label: "معايير منشورة", value: "5", hint: "جاهزة للاستخدام", tone: "success" },
          { label: "أحداث تدقيق", value: "12", hint: "آخر 7 أيام", tone: "warning" }
        ],
        actions: [
          { title: "حدّث القوالب", meta: "وظائف مكتبية وإدارية", status: "مفتوح" },
          { title: "راجع الصلاحيات", meta: "6 أدوار مفعلة", status: "جاهز" },
          { title: "تحقق من Audit Log", meta: "أثر التغييرات", status: "مراقبة" }
        ],
        rows: sharedRows()
      };
  }
};

export const getPortalPageContent = (
  slug: PortalSlug,
  role: AppRole,
  bundle: AssessmentBundle
): PortalPageContent => {
  const roleLabel = getRoleConfig(role).shortLabel;

  switch (slug) {
    case "cases":
      return {
        title: "الحالات",
        subtitle: "الحالات التي بدأتَها ضمن هذا الدور.",
        sectionLabel: "Case Queue",
        cta: { label: "ابدأ حالة جديدة", href: "/portal/new-case" },
        metrics: [
          { label: "نشطة", value: "4", hint: "قيد المتابعة" },
          { label: "بانتظار إرسال", value: "1", hint: "جاهزة" , tone: "success"},
          { label: "أعيدت للتعديل", value: "2", hint: "من المراجعة", tone: "warning" }
        ],
        actions: [
          { title: "راجع الحالات المفتوحة", meta: `دور ${roleLabel}` },
          { title: "حدّث Job Intake", meta: bundle.job.title },
          { title: "أرسل ما هو جاهز", meta: "بعد اكتمال المتطلبات" }
        ],
        rows: sharedRows()
      };
    case "new-case":
      return {
        title: "حالة جديدة",
        subtitle: "إدخال أولي سريع قبل الانتقال إلى Job Intake.",
        sectionLabel: "New Case",
        cta: { label: "انتقل إلى Job Intake", href: "/job-analysis" },
        metrics: [
          { label: "قوالب الوظائف", value: `${bundle.roleCatalog.length}`, hint: "متاحة" },
          { label: "حقول أساسية", value: "4", hint: "مطلوبة للبدء" },
          { label: "مسودة حالية", value: "1", hint: "قابلة للإكمال", tone: "warning" }
        ],
        actions: [
          { title: "اختر الوظيفة", meta: bundle.job.title },
          { title: "أدخل المتطلبات الأساسية", meta: "الجهة + المالك + النطاق" },
          { title: "احفظ كمسودة أو انتقل للتحليل", meta: "الخطوة التالية" }
        ],
        rows: sharedRows().slice(0, 3)
      };
    case "submission-status":
      return {
        title: "حالة الإرسال",
        subtitle: "تتبع ما أُرسل وما يحتاج استكمالًا.",
        sectionLabel: "Submission Status",
        cta: { label: "ارجع إلى الحالات", href: "/portal/cases" },
        metrics: [
          { label: "مرسل", value: "2", hint: "بانتظار المراجعة", tone: "success" },
          { label: "مسودات", value: "1", hint: "غير مرسلة", tone: "neutral" },
          { label: "استكمال مطلوب", value: "1", hint: "قبل الإرسال", tone: "warning" }
        ],
        actions: [
          { title: "راجع ما عاد من التقييم", meta: "أسباب الإرجاع واضحة" },
          { title: "أكمل الحقول الناقصة", meta: "ثم أعد الإرسال" },
          { title: "تابع آخر تحديث", meta: "ضمن حالة الإرسال" }
        ],
        rows: sharedRows()
      };
    case "assigned-cases":
      return {
        title: "الحالات المعيّنة",
        subtitle: "الحالات التي تنتظر التقييم أو التحديث.",
        sectionLabel: "Assigned Cases",
        cta: { label: "افتح ملف القدرات", href: "/candidate-profile" },
        metrics: [
          { label: "معيّنة لك", value: "3", hint: "قيد العمل" },
          { label: "ملف غير مكتمل", value: "1", hint: "يحتاج تحديث", tone: "warning" },
          { label: "جاهزة للمطابقة", value: "2", hint: "بعد الملف", tone: "success" }
        ],
        actions: [
          { title: "حدّث Capability Profile", meta: bundle.profile.candidateAlias },
          { title: "راجع العوائق", meta: `${bundle.barriers.length} عناصر` },
          { title: "أكمل خطة التكييف", meta: midpoint(bundle) }
        ],
        rows: sharedRows()
      };
    case "barriers":
      return {
        title: "العوائق",
        subtitle: "العوائق التشغيلية التي تحتاج معالجة قبل القرار.",
        sectionLabel: "Barrier Review",
        cta: { label: "افتح صفحة المطابقة", href: "/matching" },
        metrics: [
          { label: "عوائق مفتوحة", value: `${bundle.barriers.length}`, hint: "في الحالة الحالية", tone: "warning" },
          { label: "عالية الخطورة", value: `${bundle.barriers.filter((item) => item.severity === "high").length}`, hint: "تحتاج أولوية" },
          { label: "جاهزة للتغطية", value: `${bundle.plan.barrierCoverage}%`, hint: "ضمن الخطة", tone: "success" }
        ],
        actions: bundle.barriers.slice(0, 3).map((item) => ({
          title: item.title,
          meta: item.whyDetected,
          status: item.severity
        })),
        rows: bundle.barriers.slice(0, 4).map((item) => ({
          primary: item.title,
          secondary: item.summary,
          status: item.severity,
          owner: "Assessor"
        }))
      };
    case "team-queue":
      return {
        title: "Team Queue",
        subtitle: "الحالات التي تنتظر مراجعة واقعية الدور.",
        sectionLabel: "Hiring Queue",
        cta: { label: "افتح تحليل الوظيفة", href: "/job-analysis" },
        metrics: [
          { label: "بانتظارك", value: "2", hint: "حالات حالية", tone: "warning" },
          { label: "مهام مؤكدة", value: `${bundle.job.tasks.filter((item) => item.essential).length}`, hint: "أساسية" },
          { label: "جاهز للتوصية", value: "1", hint: "بعد التحقق", tone: "success" }
        ],
        actions: [
          { title: "راجع Job Reality", meta: bundle.job.title },
          { title: "اعتمد Task Validation", meta: "essential vs adaptable" },
          { title: "أعد للتعديل عند الحاجة", meta: "قبل التقرير النهائي" }
        ],
        rows: sharedRows()
      };
    case "task-validation":
      return {
        title: "Task Validation",
        subtitle: "التحقق من المهام الأساسية والقابلة للتعديل.",
        sectionLabel: "Task Validation",
        cta: { label: "افتح تحليل الوظيفة", href: "/job-analysis" },
        metrics: [
          { label: "أساسية", value: `${bundle.job.tasks.filter((item) => item.essential).length}`, hint: "جوهر الدور" },
          { label: "قابلة للتعديل", value: `${bundle.job.tasks.filter((item) => item.adaptable).length}`, hint: "يمكن ضبطها", tone: "success" },
          { label: "تحتاج حسم", value: "2", hint: "قبل التوصية", tone: "warning" }
        ],
        actions: bundle.job.tasks.slice(0, 3).map((task) => ({
          title: task.title,
          meta: task.taskTier === "essential" ? "Essential" : "Secondary",
          status: task.adaptable ? "Adaptable" : "Fixed"
        })),
        rows: bundle.job.tasks.slice(0, 5).map((task) => ({
          primary: task.title,
          secondary: `${task.workTool} • ${task.durationMinutes} د`,
          status: task.taskTier === "essential" ? "أساسية" : "ثانوية",
          owner: task.adaptable ? "قابلة للتعديل" : "غير قابلة"
        }))
      };
    case "recommendation-review":
      return {
        title: "Recommendation Review",
        subtitle: "مراجعة التوصية قبل تحويلها إلى قرار نهائي.",
        sectionLabel: "Recommendation",
        cta: { label: "اعرض التقرير التنفيذي", href: "/readiness-report" },
        metrics: [
          { label: "القرار الحالي", value: bundle.report.recommendation, hint: "الناتج الحالي" },
          { label: "الجاهزية", value: `${bundle.report.finalReadiness}%`, hint: "بعد التهيئة", tone: "success" },
          { label: "مخاطر متبقية", value: bundle.report.residualRiskLevel, hint: "قبل الاعتماد", tone: "warning" }
        ],
        actions: bundle.report.decisionRationale.slice(0, 3).map((item) => ({
          title: item,
          meta: "مبرر القرار",
          status: "مراجعة"
        })),
        rows: bundle.report.topActions.map((item) => ({
          primary: item.title,
          secondary: item.summary,
          status: "إجراء",
          owner: "Hiring Manager"
        }))
      };
    case "compliance-queue":
      return {
        title: "Compliance Queue",
        subtitle: "الحالات الداخلة إلى مسار الاعتماد والامتثال.",
        sectionLabel: "Compliance Queue",
        cta: { label: "افتح Decision Trace", href: "/portal/decision-trace" },
        metrics: [
          { label: "جاهز للمراجعة", value: "3", hint: "حالات نشطة" },
          { label: "جاهز للاعتماد", value: "1", hint: "مكتمل تقريبًا", tone: "success" },
          { label: "استكمال مطلوب", value: "1", hint: "قبل القرار", tone: "warning" }
        ],
        actions: [
          { title: "افتح Standards Check", meta: "راجع الإشارات" },
          { title: "تحقق من Decision Trace", meta: "مبررات القرار" },
          { title: "اصدر اعتمادًا أو طلب استكمال", meta: "ضمن Approval Panel" }
        ],
        rows: sharedRows()
      };
    case "standards-check":
      return {
        title: "Standards Check",
        subtitle: "قراءة سريعة للمعايير والإشارات قبل الاعتماد.",
        sectionLabel: "Standards",
        cta: { label: "راجع التقرير التنفيذي", href: "/readiness-report" },
        metrics: bundle.report.signals.slice(0, 3).map((signal) => ({
          label: signal.label,
          value: `${signal.score}%`,
          hint: signal.direction === "higher-better" ? "كلما ارتفع أفضل" : "كلما انخفض أفضل",
          tone: signal.tone === "positive" ? "success" : signal.tone === "watch" ? "warning" : "danger"
        })),
        actions: bundle.report.checklist.slice(0, 3).map((item) => ({
          title: item.label,
          meta: item.owner,
          status: item.priority
        })),
        rows: bundle.report.signals.map((signal) => ({
          primary: signal.label,
          secondary: signal.rationale,
          status: `${signal.score}%`,
          owner: signal.direction === "higher-better" ? "Up" : "Down"
        }))
      };
    case "decision-trace":
      return {
        title: "Decision Trace",
        subtitle: "أثر القرار من المهام إلى العوائق ثم التكييف ثم التقرير.",
        sectionLabel: "Trace",
        cta: { label: "افتح لوحة الاعتماد", href: "/portal/approval-panel" },
        metrics: [
          { label: "Task Fit", value: `${bundle.report.taskFit}%`, hint: "مساهمة المهام" },
          { label: "Barrier Coverage", value: `${bundle.plan.barrierCoverage}%`, hint: "تغطية الخطة", tone: "success" },
          { label: "Confidence", value: `${bundle.report.confidence}%`, hint: "ثقة القرار" }
        ],
        actions: bundle.report.decisionRationale.slice(0, 3).map((item) => ({
          title: item,
          meta: "trace step"
        })),
        rows: [
          ...bundle.report.topBarriers.map((item) => ({
            primary: item.title,
            secondary: item.summary,
            status: "Barrier",
            owner: "Trace"
          })),
          ...bundle.report.topActions.slice(0, 2).map((item) => ({
            primary: item.title,
            secondary: item.summary,
            status: "Action",
            owner: "Trace"
          }))
        ]
      };
    case "approval-panel":
      return {
        title: "Approval Panel",
        subtitle: "لوحة مختصرة للاعتماد أو الرفض أو طلب الاستكمال.",
        sectionLabel: "Approval",
        cta: { label: "افتح التقرير التنفيذي", href: "/readiness-report" },
        metrics: [
          { label: "قرار مقترح", value: bundle.report.recommendation, hint: "من المحرك" },
          { label: "Checklist مطلوب", value: `${bundle.report.checklist.filter((item) => item.priority === "required").length}`, hint: "قبل الاعتماد", tone: "warning" },
          { label: "جاهزية", value: `${bundle.report.finalReadiness}%`, hint: "الحالة الحالية", tone: "success" }
        ],
        actions: [
          { title: "اعتمد القرار", meta: "إذا اكتملت الشروط", status: "Approve" },
          { title: "اطلب استكمال", meta: "إذا بقيت فجوات" , status: "Request" },
          { title: "ارفض", meta: "إذا لم تتحقق الجاهزية", status: "Reject" }
        ],
        rows: bundle.report.checklist.map((item) => ({
          primary: item.label,
          secondary: item.rationale,
          status: item.priority,
          owner: item.owner
        }))
      };
    case "reports":
      return {
        title: "Reports",
        subtitle: "تقارير جاهزة للقراءة التنفيذية.",
        sectionLabel: "Reports",
        cta: { label: "اعرض التقرير التنفيذي", href: "/readiness-report" },
        metrics: [
          { label: "تقارير حديثة", value: "4", hint: "آخر دورة" },
          { label: "متوسط الجاهزية", value: "75%", hint: "محفظة نشطة", tone: "success" },
          { label: "متوسط التكلفة", value: midpoint(bundle), hint: "في الحالة الحالية" }
        ],
        actions: [
          { title: "تقرير جاهزية", meta: bundle.report.recommendation },
          { title: "ملخص قرارات", meta: "قراءة للإدارة" },
          { title: "تقرير محفظة", meta: "عرض أعلى مستوى" }
        ],
        rows: sharedRows()
      };
    case "trends":
      return {
        title: "Trends",
        subtitle: "اتجاهات خفيفة للجاهزية والقرار والتكلفة.",
        sectionLabel: "Trends",
        cta: { label: "افتح اللوحة التنفيذية", href: "/dashboard" },
        metrics: [
          { label: "اتجاه الجاهزية", value: "+4%", hint: "مقارنة سابقة", tone: "success" },
          { label: "اتجاه التكلفة", value: "-2%", hint: "تحسن طفيف", tone: "neutral" },
          { label: "حالات مستقرة", value: "3", hint: "بدون تصعيد", tone: "success" }
        ],
        actions: [
          { title: "الجاهزية تميل للارتفاع", meta: "بسبب خطط أسرع" },
          { title: "التكلفة مستقرة", meta: "ضمن أدوار MVP" },
          { title: "القرارات المعتمدة ترتفع", meta: "في الحالات المكتبية" }
        ],
        rows: sharedRows()
      };
    case "decisions-summary":
      return {
        title: "Decisions Summary",
        subtitle: "ملخص مختصر لحالة القرارات عبر المحفظة.",
        sectionLabel: "Summary",
        cta: { label: "اعرض التقارير", href: "/portal/reports" },
        metrics: [
          { label: "قرار معتمد", value: "4", hint: "آخر دورة", tone: "success" },
          { label: "بانتظار مراجعة", value: "2", hint: "في الطوابير", tone: "warning" },
          { label: "أعيد للتعديل", value: "1", hint: "يتطلب استكمالًا", tone: "neutral" }
        ],
        actions: [
          { title: "المحفظة تميل إلى مناسب بعد التهيئة", meta: "الأكثر تكرارًا" },
          { title: "تكلفة القرارات قابلة للضبط", meta: "ضمن النطاق" },
          { title: "الاستمرارية أعلى في الأدوار المكتبية", meta: "Saudi-first MVP" }
        ],
        rows: sharedRows()
      };
    case "templates":
      return {
        title: "Templates",
        subtitle: "إدارة قوالب الأدوار الجاهزة داخل النسخة الأولى.",
        sectionLabel: "Templates",
        cta: { label: "راجع القوالب الحالية", href: "/workspace" },
        metrics: [
          { label: "قوالب نشطة", value: `${bundle.roleCatalog.length}`, hint: "ضمن النظام" },
          { label: "جاهزة للاستخدام", value: "10", hint: "مكتبية / رقمية", tone: "success" },
          { label: "تحتاج تحديث", value: "2", hint: "بعد مراجعة", tone: "warning" }
        ],
        actions: bundle.roleCatalogPreviews.slice(0, 3).map((item) => ({
          title: item.title,
          meta: item.family,
          status: `${item.readiness}%`
        })),
        rows: bundle.roleCatalogPreviews.slice(0, 6).map((item) => ({
          primary: item.title,
          secondary: item.family,
          status: `${item.readiness}%`,
          owner: item.topSignal
        }))
      };
    case "standards":
      return {
        title: "Standards",
        subtitle: "إدارة المعايير والإشارات المعتمدة في القرار.",
        sectionLabel: "Standards",
        cta: { label: "افتح فحص المعايير", href: "/portal/standards-check" },
        metrics: [
          { label: "إشارات فعالة", value: `${bundle.report.signals.length}`, hint: "ضمن التقرير" },
          { label: "Checklist منشور", value: `${bundle.report.checklist.length}`, hint: "جاهز" },
          { label: "يتطلب تحديث", value: "1", hint: "مراجعة دورية", tone: "warning" }
        ],
        actions: bundle.report.signals.slice(0, 3).map((item) => ({
          title: item.label,
          meta: item.rationale
        })),
        rows: bundle.report.signals.map((item) => ({
          primary: item.label,
          secondary: item.rationale,
          status: `${item.score}%`,
          owner: item.tone
        }))
      };
    case "roles-permissions":
      return {
        title: "Roles & Permissions",
        subtitle: "طبقة الصلاحيات الحالية داخل الـ MVP.",
        sectionLabel: "Permissions",
        cta: { label: "ارجع إلى لوحة الدور", href: "/home" },
        metrics: [
          { label: "أدوار نشطة", value: "6", hint: "مفعلة الآن" },
          { label: "خرائط صلاحيات", value: "1", hint: "مركزية", tone: "success" },
          { label: "صفحات مقيدة", value: "مفعلة", hint: "Route gating", tone: "neutral" }
        ],
        actions: [
          { title: "Case Initiator", meta: "بدء الحالة والإرسال" },
          { title: "Assessor", meta: "الملف والعوائق والتكييف" },
          { title: "Platform Admin", meta: "إدارة النظام والقوالب" }
        ],
        rows: [
          { primary: "Case Initiator", secondary: "Create, Submit, Intake", status: "4 perms", owner: "MVP" },
          { primary: "Assessor", secondary: "Profile, Barriers, Matching", status: "5 perms", owner: "MVP" },
          { primary: "Hiring Manager", secondary: "Review, Validate, Recommend", status: "4 perms", owner: "MVP" },
          { primary: "Compliance Reviewer", secondary: "Trace, Check, Approve", status: "4 perms", owner: "MVP" },
          { primary: "Executive Viewer", secondary: "Dashboard, Reports, Trends", status: "4 perms", owner: "MVP" },
          { primary: "Platform Admin", secondary: "Full system access", status: "All perms", owner: "MVP" }
        ]
      };
    case "system-settings":
      return {
        title: "System Settings",
        subtitle: "إعدادات تشغيلية خفيفة تمهّد للتوسع لاحقًا.",
        sectionLabel: "System",
        cta: { label: "راجع سجل التدقيق", href: "/portal/audit-log" },
        metrics: [
          { label: "Role session", value: "Mock", hint: "بدون auth حقيقي" },
          { label: "Route gating", value: "On", hint: "مفعّل", tone: "success" },
          { label: "إعدادات قابلة للتوسعة", value: "Ready", hint: "للمرحلة التالية" }
        ],
        actions: [
          { title: "Session role", meta: "محلي داخل الـ MVP" },
          { title: "Page access", meta: "مبني على permission map" },
          { title: "Portal routes", meta: "قابلة للتوسعة" }
        ],
        rows: [
          { primary: "Role Session", secondary: "Local storage session", status: "Mock", owner: "UI" },
          { primary: "Permission Map", secondary: "Centralized", status: "Active", owner: "Core" },
          { primary: "Route Guard", secondary: "Access Restricted state", status: "Active", owner: "Core" }
        ]
      };
    case "audit-log":
      return {
        title: "Audit Log",
        subtitle: "أثر التغييرات والانتقال بين الأدوار داخل الـ MVP.",
        sectionLabel: "Audit",
        cta: { label: "ارجع إلى الإعدادات", href: "/portal/system-settings" },
        metrics: [
          { label: "أحداث حديثة", value: "12", hint: "آخر 7 أيام" },
          { label: "تبديلات دور", value: "6", hint: "داخل الديمو", tone: "neutral" },
          { label: "تغييرات قوالب", value: "2", hint: "مراجعة أخيرة", tone: "warning" }
        ],
        actions: [
          { title: "Role switched", meta: "Case Initiator → Assessor" },
          { title: "Template viewed", meta: bundle.job.title },
          { title: "Decision trace opened", meta: "Compliance Reviewer" }
        ],
        rows: [
          { primary: "09:15", secondary: "Role switched to Assessor", status: "Session", owner: "Demo" },
          { primary: "10:10", secondary: "Job analysis opened", status: "Page", owner: "Hiring Manager" },
          { primary: "11:05", secondary: "Readiness report reviewed", status: "Report", owner: "Compliance" },
          { primary: "12:20", secondary: "Templates list opened", status: "Admin", owner: "Platform" }
        ]
      };
  }
};
