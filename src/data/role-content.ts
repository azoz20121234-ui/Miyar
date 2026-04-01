import { pipelineCases } from "@/data/dashboard";
import { ExternalHandoffPayload } from "@/lib/external-handoff";
import { CaseStandardsEvaluation } from "@/lib/standards-types";
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

const ownedChecks = (
  standards: CaseStandardsEvaluation,
  ownerRole: "assessor" | "hiring-manager" | "compliance-reviewer" | "platform-admin"
) => standards.checks.filter((check) => check.ownerRole === ownerRole);

const openOwnedChecks = (
  standards: CaseStandardsEvaluation,
  ownerRole: "assessor" | "hiring-manager" | "compliance-reviewer" | "platform-admin"
) => ownedChecks(standards, ownerRole).filter((check) => check.status !== "passed");

export const getRoleHomeContent = (
  role: AppRole,
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation
): RoleHomeContent => {
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
          { title: "أكمل تحليل الوظيفة", meta: bundle.job.title, status: "نشطة" },
          { title: "أرسل الحالة للمراجعة", meta: "بعد اكتمال المتطلبات", status: "التالي" }
        ],
        rows: sharedRows()
      };
    case "assessor":
      return {
        title: "لوحة التقييم",
        subtitle: "قدرات، عوائق، وتكييف مع فحوصات تشغيلية على مسؤوليتك.",
        cta: config.primaryAction,
        metrics: [
          { label: "حالات معيّنة", value: "3", hint: "قيد العمل", tone: "neutral" },
          {
            label: "فحوصات عليك",
            value: `${standards.ownerCounts.assessor}`,
            hint: "مطلوبة من المقيّم",
            tone: standards.ownerCounts.assessor > 0 ? "warning" : "success"
          },
          {
            label: "أدلة ناقصة",
            value: `${standards.evidenceRequirements.filter((item) => item.ownerRole === "assessor").length}`,
            hint: "قبل الإغلاق",
            tone: "warning"
          }
        ],
        actions: [
          { title: "حدّث ملف القدرات", meta: bundle.profile.candidateAlias, status: "بانتظارك" },
          { title: "أغلق فحوصات القدرات والعوائق", meta: `${standards.ownerCounts.assessor} فحص`, status: "مفتوح" },
          { title: "أكمل خطة التكييف", meta: midpoint(bundle), status: "جاهز" }
        ],
        rows: openOwnedChecks(standards, "assessor").slice(0, 4).map((item) => ({
          primary: item.label,
          secondary: item.rationale,
          status: item.status,
          owner: "المقيّم"
        }))
      };
    case "hiring-manager":
      return {
        title: "لوحة مدير التوظيف",
        subtitle: "أكد واقعية المهام واحسم الواقعية التشغيلية قبل الرفع للاعتماد.",
        cta: config.primaryAction,
        metrics: [
          { label: "بانتظار مراجعتك", value: "2", hint: "حالات الفريق", tone: "warning" },
          {
            label: "فحوصات واقعية المهام",
            value: `${standards.ownerCounts["hiring-manager"]}`,
            hint: "على مدير التوظيف",
            tone: standards.ownerCounts["hiring-manager"] > 0 ? "warning" : "success"
          },
          { label: "مهام أساسية", value: `${bundle.job.tasks.filter((task) => task.essential).length}`, hint: "في الحالة الحالية", tone: "neutral" }
        ],
        actions: [
          { title: "راجع واقعية المهام", meta: bundle.job.title, status: "نشطة" },
          { title: "أكّد الأساسية مقابل القابلة للتعديل", meta: `${openOwnedChecks(standards, "hiring-manager").length} فحص مفتوح`, status: "مفتوح" },
          { title: "اعتمد أو أعد للتعديل", meta: bundle.report.recommendation, status: "قرار" }
        ],
        rows: openOwnedChecks(standards, "hiring-manager").slice(0, 4).map((item) => ({
          primary: item.label,
          secondary: item.rationale,
          status: item.status,
          owner: "مدير التوظيف"
        }))
      };
    case "compliance-reviewer":
      return {
        title: "لوحة الامتثال",
        subtitle: "راجع الموانع وأثر القرار قبل الاعتماد أو طلب الاستكمال.",
        cta: config.primaryAction,
        metrics: [
          { label: "طابور الامتثال", value: "3", hint: "جاهز للمراجعة", tone: "neutral" },
          { label: "الموانع", value: `${standards.blockers.length}`, hint: "قبل الاعتماد", tone: "danger" },
          { label: "بانتظار مراجعة", value: `${standards.counts["needs-review"]}`, hint: "على مسار المراجعة", tone: "warning" }
        ],
        actions: [
          { title: "افتح أثر القرار", meta: "تحقق من مبررات القرار", status: "الآن" },
          { title: "راجع الموانع", meta: `${standards.blockers.length} مانع`, status: "مفتوح" },
          { title: "اعتمد أو ارفض", meta: bundle.report.recommendation, status: "قرار" }
        ],
        rows: standards.blockers.slice(0, 4).map((item) => ({
          primary: item.title,
          secondary: item.rationale,
          status: "مانع",
          owner: "الامتثال"
        }))
      };
    case "executive-viewer":
      return {
        title: "لوحة تنفيذية",
        subtitle: "رؤية مختصرة للقرار، المعايير، وما بقي قبل الاعتماد.",
        cta: config.primaryAction,
        metrics: [
          { label: "قرارات نشطة", value: `${pipelineCases.length}`, hint: "في المحفظة", tone: "neutral" },
          { label: "اكتمال المعايير", value: `${standards.overview.completionRate}%`, hint: "للحالة الحالية", tone: "success" },
          { label: "الموانع", value: `${standards.blockers.length}`, hint: "قبل الاعتماد", tone: standards.blockers.length > 0 ? "warning" : "success" }
        ],
        actions: [
          { title: "راجع لوحة المحفظة", meta: "عرض المحفظة الحالية", status: "جاهز" },
          { title: "افتح التقارير", meta: `${standards.overview.blockers} مانع`, status: "مفتوح" },
          { title: "راجع الاتجاهات", meta: "التكلفة والجاهزية", status: "ملخص" }
        ],
        rows: [
          ...standards.blockers.slice(0, 2).map((item) => ({
            primary: item.title,
            secondary: item.rationale,
            status: "مانع",
            owner: item.ownerRole
          })),
          ...sharedRows().slice(0, 2)
        ]
      };
    case "platform-admin":
      return {
        title: "لوحة إدارة المنصة",
        subtitle: "إدارة كتالوج المعايير، والقوالب، وسجل التشغيل الداخلي.",
        cta: config.primaryAction,
        metrics: [
          { label: "قوالب نشطة", value: `${bundle.roleCatalog.length}`, hint: "ضمن النظام", tone: "neutral" },
          { label: "معايير منشورة", value: `${standards.overview.totalStandards}`, hint: "داخل الكتالوج", tone: "success" },
          { label: "أدلة معلّقة", value: `${standards.counts["missing-evidence"] + standards.counts["needs-review"]}`, hint: "على مستوى المعايير", tone: "warning" }
        ],
        actions: [
          { title: "حدّث مكتبة المعايير", meta: `${standards.overview.totalChecks} فحص`, status: "مفتوح" },
          { title: "راجع الصلاحيات", meta: "6 أدوار مفعلة", status: "جاهز" },
          { title: "تحقق من سجل التدقيق", meta: "أثر التغييرات", status: "مراقبة" }
        ],
        rows: standards.libraryRows.slice(0, 4).map((item) => ({
          primary: item.title,
          secondary: `${item.category} • ${item.level}`,
          status: item.status,
          owner: item.ownerRole
        }))
      };
  }
};

export const getPortalPageContent = (
  slug: PortalSlug,
  role: AppRole,
  bundle: AssessmentBundle,
  standards: CaseStandardsEvaluation,
  externalHandoff?: ExternalHandoffPayload | null
): PortalPageContent => {
  const roleLabel = getRoleConfig(role).shortLabel;

  switch (slug) {
    case "cases":
      return {
        title: "الحالات",
        subtitle: "الحالات التي بدأتَها ضمن هذا الدور.",
        sectionLabel: "طابور الحالات",
        cta: { label: "ابدأ حالة جديدة", href: "/portal/new-case" },
        metrics: [
          { label: "نشطة", value: "4", hint: "قيد المتابعة" },
          { label: "بانتظار إرسال", value: "1", hint: "جاهزة" , tone: "success"},
          { label: "أعيدت للتعديل", value: "2", hint: "من المراجعة", tone: "warning" }
        ],
        actions: [
          { title: "راجع الحالات المفتوحة", meta: `دور ${roleLabel}` },
          { title: "حدّث تحليل الوظيفة", meta: bundle.job.title },
          { title: "أرسل ما هو جاهز", meta: "بعد اكتمال المتطلبات" }
        ],
        rows: sharedRows()
      };
    case "new-case":
      return {
        title: "حالة جديدة",
        subtitle: externalHandoff
          ? "تم استلام حزمة خارجية تمهيدية. راجعها ثم حرّك الحالة إلى تحليل الوظيفة."
          : "إدخال أولي سريع قبل الانتقال إلى تحليل الوظيفة.",
        sectionLabel: "حالة جديدة",
        cta: { label: "انتقل إلى تحليل الوظيفة", href: "/job-analysis" },
        metrics: externalHandoff
          ? [
              { label: "جاهزية أولية", value: `${externalHandoff.initialReadiness}%`, hint: externalHandoff.initialReadinessLabel, tone: "success" },
              { label: "أدلة مكتملة", value: `${externalHandoff.completedEvidence.length}`, hint: "وصلت من الطبقة الخارجية" },
              { label: "تكييفات مقترحة", value: `${externalHandoff.proposedAccommodations.length}`, hint: "جاهزة للمراجعة", tone: "warning" }
            ]
          : [
              { label: "قوالب الوظائف", value: `${bundle.roleCatalog.length}`, hint: "متاحة" },
              { label: "حقول أساسية", value: "4", hint: "مطلوبة للبدء" },
              { label: "مسودة حالية", value: "1", hint: "قابلة للإكمال", tone: "warning" }
            ],
        actions: externalHandoff
          ? [
              { title: "راجع الحزمة المستلمة", meta: `${externalHandoff.candidateName} • ${externalHandoff.jobTitle}`, status: "تم الاستلام" },
              { title: "تحقق من الوظيفة والمرشح", meta: `${externalHandoff.completedEvidence.length} أدلة • ${externalHandoff.coreTasks.length} مهام`, status: "قبل التحليل" },
              { title: "انتقل إلى تحليل الوظيفة", meta: "الخطوة التالية داخل Meyar Core", status: "التالي" }
            ]
          : [
              { title: "اختر الوظيفة", meta: bundle.job.title },
              { title: "أدخل المتطلبات الأساسية", meta: "الجهة + المالك + النطاق" },
              { title: "احفظ كمسودة أو انتقل للتحليل", meta: "الخطوة التالية" }
            ],
        rows: externalHandoff
          ? [
              {
                primary: "المرشح",
                secondary: `${externalHandoff.candidateName} • ${externalHandoff.candidateTargetRole}`,
                status: "مدخل خارجي",
                owner: "الطبقة الخارجية"
              },
              {
                primary: "الوظيفة",
                secondary: `${externalHandoff.jobTitle} • ${externalHandoff.employerName}`,
                status: "مدخل خارجي",
                owner: "الطبقة الخارجية"
              },
              {
                primary: "الأدلة",
                secondary: externalHandoff.completedEvidence.join(" • "),
                status: "مكتملة",
                owner: "المرشح"
              },
              {
                primary: "التكييفات",
                secondary: externalHandoff.proposedAccommodations.join(" • "),
                status: "تمهيدية",
                owner: "جهة العمل"
              }
            ]
          : sharedRows().slice(0, 3)
      };
    case "submission-status":
      return {
        title: "حالة الإرسال",
        subtitle: "تتبع ما أُرسل وما يحتاج استكمالًا.",
        sectionLabel: "حالة الإرسال",
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
        subtitle: "حالات التقييم وما يرتبط بها من فحوصات القدرات.",
        sectionLabel: "الحالات المعيّنة",
        cta: { label: "افتح ملف القدرات", href: "/candidate-profile" },
        metrics: [
          { label: "معيّنة لك", value: "3", hint: "قيد العمل" },
          { label: "فحوصات عليك", value: `${standards.ownerCounts.assessor}`, hint: "طابور المقيّم", tone: "warning" },
          { label: "جاهزة للمطابقة", value: "2", hint: "بعد الملف", tone: "success" }
        ],
        actions: [
          { title: "حدّث ملف القدرات", meta: bundle.profile.candidateAlias },
          { title: "راجع العوائق", meta: `${bundle.barriers.length} عناصر` },
          { title: "أكمل خطة التكييف", meta: midpoint(bundle) }
        ],
        rows: openOwnedChecks(standards, "assessor").slice(0, 4).map((item) => ({
          primary: item.label,
          secondary: item.rationale,
          status: item.status,
          owner: "المقيّم"
        }))
      };
    case "barriers":
      return {
        title: "العوائق",
        subtitle: "العوائق التشغيلية التي تحتاج معالجة قبل القرار.",
        sectionLabel: "مراجعة العوائق",
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
          owner: "المقيّم"
        }))
      };
    case "team-queue":
      return {
        title: "طابور الفريق",
        subtitle: "حالات واقعية المهام التي تنتظر تأكيدك.",
        sectionLabel: "طابور التوظيف",
        cta: { label: "افتح تحليل الوظيفة", href: "/job-analysis" },
        metrics: [
          { label: "بانتظارك", value: "2", hint: "حالات حالية", tone: "warning" },
          { label: "فحوصات المهام", value: `${standards.ownerCounts["hiring-manager"]}`, hint: "على مدير التوظيف" },
          { label: "جاهز للتوصية", value: "1", hint: "بعد التحقق", tone: "success" }
        ],
        actions: [
          { title: "راجع واقعية الوظيفة", meta: bundle.job.title },
          { title: "اعتمد المهام الأساسية والقابلة للتعديل", meta: "أساسية مقابل قابلة للتعديل" },
          { title: "أعد للتعديل عند الحاجة", meta: "قبل التقرير النهائي" }
        ],
        rows: openOwnedChecks(standards, "hiring-manager").slice(0, 4).map((item) => ({
          primary: item.label,
          secondary: item.rationale,
          status: item.status,
          owner: "مدير التوظيف"
        }))
      };
    case "task-validation":
      return {
        title: "اعتماد المهام",
        subtitle: "التحقق من المهام الأساسية والقابلة للتعديل.",
        sectionLabel: "اعتماد المهام",
        cta: { label: "افتح تحليل الوظيفة", href: "/job-analysis" },
        metrics: [
          { label: "أساسية", value: `${bundle.job.tasks.filter((item) => item.essential).length}`, hint: "جوهر الدور" },
          { label: "قابلة للتعديل", value: `${bundle.job.tasks.filter((item) => item.adaptable).length}`, hint: "يمكن ضبطها", tone: "success" },
          { label: "تحتاج حسم", value: "2", hint: "قبل التوصية", tone: "warning" }
        ],
        actions: bundle.job.tasks.slice(0, 3).map((task) => ({
          title: task.title,
          meta: task.taskTier === "essential" ? "أساسية" : "ثانوية",
          status: task.adaptable ? "قابلة للتعديل" : "ثابتة"
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
        title: "مراجعة التوصية",
        subtitle: "مراجعة التوصية قبل تحويلها إلى قرار نهائي.",
        sectionLabel: "التوصية",
        cta: { label: "اعرض التقرير التنفيذي", href: "/readiness-report" },
        metrics: [
          { label: "القرار الحالي", value: bundle.report.recommendation, hint: "الناتج الحالي" },
          { label: "الجاهزية", value: `${bundle.report.finalReadiness}%`, hint: "بعد التهيئة", tone: "success" },
          { label: "الموانع", value: `${standards.blockers.length}`, hint: "قبل الاعتماد", tone: "warning" }
        ],
        actions: bundle.report.decisionRationale.slice(0, 3).map((item) => ({
          title: item,
          meta: "مبرر القرار",
          status: "مراجعة"
        })),
        rows: [
          ...openOwnedChecks(standards, "hiring-manager").slice(0, 2).map((item) => ({
            primary: item.label,
            secondary: item.rationale,
            status: item.status,
            owner: "مدير التوظيف"
          })),
          ...bundle.report.topActions.slice(0, 3).map((item) => ({
            primary: item.title,
            secondary: item.summary,
            status: "إجراء",
            owner: "مدير التوظيف"
          }))
        ]
      };
    case "compliance-queue":
      return {
        title: "طابور الامتثال",
        subtitle: "الحالات الداخلة إلى مسار الاعتماد والامتثال.",
        sectionLabel: "طابور الامتثال",
        cta: { label: "افتح أثر القرار", href: "/portal/decision-trace" },
        metrics: [
          { label: "جاهز للمراجعة", value: "3", hint: "حالات نشطة" },
          { label: "الموانع", value: `${standards.blockers.length}`, hint: "قبل القرار", tone: "danger" },
          { label: "أدلة معلّقة", value: `${standards.counts["missing-evidence"]}`, hint: "تحتاج استكمال", tone: "warning" }
        ],
        actions: [
          { title: "افتح فحص المعايير", meta: "راجع الإشارات" },
          { title: "تحقق من أثر القرار", meta: "مبررات القرار" },
          { title: "اصدر اعتمادًا أو طلب استكمال", meta: "ضمن لوحة الاعتماد" }
        ],
        rows: standards.blockers.slice(0, 4).map((item) => ({
          primary: item.title,
          secondary: item.rationale,
          status: "مانع",
          owner: item.ownerRole
        }))
      };
    case "standards-check":
      return {
        title: "فحص المعايير",
        subtitle: "قراءة سريعة للمعايير والإشارات قبل الاعتماد.",
        sectionLabel: "المعايير",
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
          owner: signal.direction === "higher-better" ? "تصاعدي" : "نزولي"
        }))
      };
    case "decision-trace":
      return {
        title: "أثر القرار",
        subtitle: "أثر القرار من المهام إلى العوائق ثم التكييف ثم التقرير.",
        sectionLabel: "الأثر",
        cta: { label: "افتح لوحة الاعتماد", href: "/portal/approval-panel" },
        metrics: [
          { label: "ملاءمة المهام", value: `${bundle.report.taskFit}%`, hint: "مساهمة المهام" },
          { label: "تغطية العوائق", value: `${bundle.plan.barrierCoverage}%`, hint: "تغطية الخطة", tone: "success" },
          { label: "المعايير", value: `${standards.overview.completionRate}%`, hint: "اكتمال الفحوصات" }
        ],
        actions: bundle.report.decisionRationale.slice(0, 3).map((item) => ({
          title: item,
          meta: "خطوة أثر"
        })),
        rows: [
          ...standards.blockers.slice(0, 2).map((item) => ({
            primary: item.title,
            secondary: item.rationale,
            status: "مانع",
            owner: item.ownerRole
          })),
          ...bundle.report.topBarriers.map((item) => ({
            primary: item.title,
            secondary: item.summary,
            status: "عائق",
            owner: "الأثر"
          })),
          ...bundle.report.topActions.slice(0, 2).map((item) => ({
            primary: item.title,
            secondary: item.summary,
            status: "إجراء",
            owner: "الأثر"
          }))
        ]
      };
    case "approval-panel":
      return {
        title: "لوحة الاعتماد",
        subtitle: "لوحة مختصرة للاعتماد أو الرفض أو طلب الاستكمال.",
        sectionLabel: "الاعتماد",
        cta: { label: "افتح التقرير التنفيذي", href: "/readiness-report" },
        metrics: [
          { label: "قرار مقترح", value: bundle.report.recommendation, hint: "من المحرك" },
          { label: "الموانع", value: `${standards.blockers.length}`, hint: "يمنع الاعتماد", tone: "warning" },
          { label: "جاهزية", value: `${bundle.report.finalReadiness}%`, hint: "الحالة الحالية", tone: "success" }
        ],
        actions: [
          { title: "اعتمد القرار", meta: "إذا اكتملت الشروط", status: "اعتماد" },
          { title: "اطلب استكمال", meta: "إذا بقيت فجوات" , status: "طلب استكمال" },
          { title: "ارفض", meta: "إذا لم تتحقق الجاهزية", status: "رفض" }
        ],
        rows: [
          ...standards.blockers.slice(0, 3).map((item) => ({
            primary: item.title,
            secondary: item.rationale,
            status: "مانع",
            owner: item.ownerRole
          })),
          ...bundle.report.checklist.slice(0, 3).map((item) => ({
            primary: item.label,
            secondary: item.rationale,
            status: item.priority,
            owner: item.owner
          }))
        ]
      };
    case "reports":
      return {
        title: "التقارير",
        subtitle: "تقارير جاهزة للقراءة التنفيذية.",
        sectionLabel: "التقارير",
        cta: { label: "اعرض التقرير التنفيذي", href: "/readiness-report" },
        metrics: [
          { label: "تقارير حديثة", value: "4", hint: "آخر دورة" },
          { label: "متوسط الجاهزية", value: "75%", hint: "محفظة نشطة", tone: "success" },
          { label: "اكتمال المعايير", value: `${standards.overview.completionRate}%`, hint: "للحالة الحالية" }
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
        title: "الاتجاهات",
        subtitle: "اتجاهات خفيفة للجاهزية والقرار والتكلفة.",
        sectionLabel: "الاتجاهات",
        cta: { label: "افتح اللوحة التنفيذية", href: "/dashboard" },
        metrics: [
          { label: "اتجاه الجاهزية", value: "+4%", hint: "مقارنة سابقة", tone: "success" },
          { label: "اتجاه التكلفة", value: "-2%", hint: "تحسن طفيف", tone: "neutral" },
          { label: "حالات مستقرة", value: "3", hint: "بدون تصعيد", tone: "success" }
        ],
        actions: [
          { title: "الجاهزية تميل للارتفاع", meta: "بسبب خطط أسرع" },
          { title: "التكلفة مستقرة", meta: "ضمن أدوار النسخة الحالية" },
          { title: "القرارات المعتمدة ترتفع", meta: "في الحالات المكتبية" }
        ],
        rows: sharedRows()
      };
    case "decisions-summary":
      return {
        title: "ملخص القرارات",
        subtitle: "ملخص مختصر لحالة القرارات عبر المحفظة.",
        sectionLabel: "الملخص",
        cta: { label: "اعرض التقارير", href: "/portal/reports" },
        metrics: [
          { label: "قرار معتمد", value: "4", hint: "آخر دورة", tone: "success" },
          { label: "بانتظار مراجعة", value: "2", hint: "في الطوابير", tone: "warning" },
          { label: "أعيد للتعديل", value: "1", hint: "يتطلب استكمالًا", tone: "neutral" }
        ],
        actions: [
          { title: "المحفظة تميل إلى مناسب بعد التهيئة", meta: "الأكثر تكرارًا" },
          { title: "تكلفة القرارات قابلة للضبط", meta: "ضمن النطاق" },
          { title: "الاستمرارية أعلى في الأدوار المكتبية", meta: "ضمن النسخة السعودية الأولى" }
        ],
        rows: sharedRows()
      };
    case "templates":
      return {
        title: "القوالب",
        subtitle: "إدارة قوالب الأدوار الجاهزة داخل النسخة الأولى.",
        sectionLabel: "القوالب",
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
        title: "المعايير",
        subtitle: "كتالوج منظّم للمعايير والفحوصات داخل Meyar — محرك القرار والامتثال المعياري.",
        sectionLabel: "المعايير",
        cta: { label: "افتح فحص المعايير", href: "/portal/standards-check" },
        metrics: [
          { label: "معايير", value: `${standards.overview.totalStandards}`, hint: "في المكتبة" },
          { label: "فحوصات", value: `${standards.overview.totalChecks}`, hint: "إجمالي الفحوصات" },
          { label: "أدلة معلّقة", value: `${standards.counts["missing-evidence"]}`, hint: "بحاجة متابعة", tone: "warning" }
        ],
        actions: standards.libraryRows.slice(0, 3).map((item) => ({
          title: item.title,
          meta: `${item.type} • ${item.checksCount} فحوصات`
        })),
        rows: standards.libraryRows.slice(0, 6).map((item) => ({
          primary: item.title,
          secondary: `${item.category} • ${item.level}`,
          status: item.status,
          owner: item.ownerRole
        }))
      };
    case "roles-permissions":
      return {
        title: "الأدوار والصلاحيات",
        subtitle: "طبقة الصلاحيات الحالية داخل النسخة التجريبية.",
        sectionLabel: "الصلاحيات",
        cta: { label: "ارجع إلى لوحة الدور", href: "/home" },
        metrics: [
          { label: "أدوار نشطة", value: "6", hint: "مفعلة الآن" },
          { label: "خرائط صلاحيات", value: "1", hint: "مركزية", tone: "success" },
          { label: "صفحات مقيدة", value: "مفعلة", hint: "Route gating", tone: "neutral" }
        ],
        actions: [
          { title: "مبادر الحالة", meta: "بدء الحالة والإرسال" },
          { title: "المقيّم", meta: "الملف والعوائق والتكييف" },
          { title: "مدير المنصة", meta: "إدارة النظام والقوالب" }
        ],
        rows: [
          { primary: "مبادر الحالة", secondary: "إنشاء، إرسال، إدخال", status: "4 صلاحيات", owner: "النسخة الحالية" },
          { primary: "المقيّم", secondary: "ملف القدرات، العوائق، المطابقة", status: "5 صلاحيات", owner: "النسخة الحالية" },
          { primary: "مدير التوظيف", secondary: "مراجعة، اعتماد، توصية", status: "4 صلاحيات", owner: "النسخة الحالية" },
          { primary: "مراجع الامتثال", secondary: "أثر القرار، الفحص، الاعتماد", status: "4 صلاحيات", owner: "النسخة الحالية" },
          { primary: "المشاهد التنفيذي", secondary: "اللوحة، التقارير، الاتجاهات", status: "4 صلاحيات", owner: "النسخة الحالية" },
          { primary: "مدير المنصة", secondary: "وصول كامل للنظام", status: "كل الصلاحيات", owner: "النسخة الحالية" }
        ]
      };
    case "system-settings":
      return {
        title: "إعدادات النظام",
        subtitle: "إعدادات تشغيلية خفيفة تمهّد للتوسع لاحقًا.",
        sectionLabel: "النظام",
        cta: { label: "راجع سجل التدقيق", href: "/portal/audit-log" },
        metrics: [
          { label: "جلسة الدور", value: "تجريبية", hint: "بدون توثيق حقيقي" },
          { label: "حماية المسارات", value: "مفعّل", hint: "مفعّل", tone: "success" },
          { label: "إعدادات قابلة للتوسعة", value: "جاهزة", hint: "للمرحلة التالية" }
        ],
        actions: [
          { title: "جلسة الدور", meta: "محلية داخل النسخة الحالية" },
          { title: "وصول الصفحات", meta: "مبني على خريطة الصلاحيات" },
          { title: "مسارات البوابات", meta: "قابلة للتوسعة" }
        ],
        rows: [
          { primary: "جلسة الدور", secondary: "محفوظة محليًا", status: "تجريبية", owner: "الواجهة" },
          { primary: "خريطة الصلاحيات", secondary: "مركزية", status: "نشطة", owner: "الأساس" },
          { primary: "حارس المسار", secondary: "حالة الوصول المقيّد", status: "نشط", owner: "الأساس" }
        ]
      };
    case "audit-log":
      return {
        title: "سجل التدقيق",
        subtitle: "أثر التغييرات والانتقال بين الأدوار داخل النسخة التجريبية.",
        sectionLabel: "التدقيق",
        cta: { label: "ارجع إلى الإعدادات", href: "/portal/system-settings" },
        metrics: [
          { label: "أحداث حديثة", value: "12", hint: "آخر 7 أيام" },
          { label: "تبديلات دور", value: "6", hint: "داخل الديمو", tone: "neutral" },
          { label: "تغييرات قوالب", value: "2", hint: "مراجعة أخيرة", tone: "warning" }
        ],
        actions: [
          { title: "تم تبديل الدور", meta: "مبادر الحالة ← المقيّم" },
          { title: "تمت مراجعة قالب", meta: bundle.job.title },
          { title: "تم فتح أثر القرار", meta: "مراجع الامتثال" }
        ],
        rows: [
          { primary: "09:15", secondary: "تم التبديل إلى دور المقيّم", status: "جلسة", owner: "الديمو" },
          { primary: "10:10", secondary: "تم فتح تحليل الوظيفة", status: "صفحة", owner: "مدير التوظيف" },
          { primary: "11:05", secondary: "تمت مراجعة التقرير التنفيذي", status: "تقرير", owner: "الامتثال" },
          { primary: "12:20", secondary: "تم فتح قائمة القوالب", status: "إدارة", owner: "المنصة" }
        ]
      };
  }
};
