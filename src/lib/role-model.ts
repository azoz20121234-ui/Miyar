export const APP_ROLES = [
  "case-initiator",
  "assessor",
  "hiring-manager",
  "compliance-reviewer",
  "executive-viewer",
  "platform-admin"
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const APP_PERMISSIONS = [
  "cases:create",
  "cases:submit",
  "cases:view:initiated",
  "cases:view:assigned",
  "job:intake",
  "job:review",
  "profile:edit",
  "barriers:review",
  "matching:view",
  "accommodations:edit",
  "recommendation:review",
  "compliance:review",
  "compliance:approve",
  "reports:view",
  "portfolio:view",
  "trends:view",
  "decisions:view",
  "templates:manage",
  "standards:manage",
  "roles:manage",
  "settings:manage",
  "audit:view"
] as const;

export type AppPermission = (typeof APP_PERMISSIONS)[number];

export const APP_PAGE_IDS = [
  "home",
  "workspace",
  "job-analysis",
  "candidate-profile",
  "matching",
  "accommodation-plan",
  "readiness-report",
  "dashboard",
  "portal:candidates",
  "portal:cases",
  "portal:new-case",
  "portal:submission-status",
  "portal:assigned-cases",
  "portal:barriers",
  "portal:team-queue",
  "portal:task-validation",
  "portal:recommendation-review",
  "portal:compliance-queue",
  "portal:standards-check",
  "portal:decision-trace",
  "portal:approval-panel",
  "portal:reports",
  "portal:trends",
  "portal:decisions-summary",
  "portal:templates",
  "portal:standards",
  "portal:roles-permissions",
  "portal:system-settings",
  "portal:audit-log"
] as const;

export type AppPageId = (typeof APP_PAGE_IDS)[number];

export type PortalSlug =
  | "cases"
  | "new-case"
  | "submission-status"
  | "assigned-cases"
  | "barriers"
  | "team-queue"
  | "task-validation"
  | "recommendation-review"
  | "compliance-queue"
  | "standards-check"
  | "decision-trace"
  | "approval-panel"
  | "reports"
  | "trends"
  | "decisions-summary"
  | "templates"
  | "standards"
  | "roles-permissions"
  | "system-settings"
  | "audit-log";

export interface RoleNavItem {
  label: string;
  href: string;
  pageId: AppPageId;
}

interface RoleConfig {
  label: string;
  shortLabel: string;
  description: string;
  defaultHref: string;
  primaryAction: {
    label: string;
    href: string;
  };
  navItems: RoleNavItem[];
}

export const ROLE_PERMISSIONS: Record<AppRole, AppPermission[]> = {
  "case-initiator": [
    "cases:create",
    "cases:submit",
    "cases:view:initiated",
    "job:intake"
  ],
  assessor: [
    "cases:view:assigned",
    "profile:edit",
    "barriers:review",
    "matching:view",
    "accommodations:edit"
  ],
  "hiring-manager": [
    "cases:view:assigned",
    "job:review",
    "recommendation:review",
    "matching:view"
  ],
  "compliance-reviewer": [
    "compliance:review",
    "compliance:approve",
    "reports:view",
    "decisions:view"
  ],
  "executive-viewer": [
    "portfolio:view",
    "reports:view",
    "trends:view",
    "decisions:view"
  ],
  "platform-admin": [...APP_PERMISSIONS]
};

export const PAGE_PERMISSION_MAP: Record<
  AppPageId,
  {
    label: string;
    requiredAny: AppPermission[];
  }
> = {
  home: {
    label: "لوحة الدور",
    requiredAny: [...APP_PERMISSIONS]
  },
  workspace: {
    label: "الحالات",
    requiredAny: ["cases:view:initiated", "cases:view:assigned", "portfolio:view", "audit:view"]
  },
  "job-analysis": {
    label: "تحليل الوظيفة",
    requiredAny: ["job:intake", "job:review", "templates:manage"]
  },
  "candidate-profile": {
    label: "ملف القدرات",
    requiredAny: ["profile:edit", "templates:manage"]
  },
  matching: {
    label: "المطابقة",
    requiredAny: ["matching:view", "compliance:review", "templates:manage"]
  },
  "accommodation-plan": {
    label: "التكييف",
    requiredAny: ["accommodations:edit", "compliance:review", "templates:manage"]
  },
  "readiness-report": {
    label: "التقرير التنفيذي",
    requiredAny: [
      "cases:view:initiated",
      "cases:view:assigned",
      "job:review",
      "profile:edit",
      "recommendation:review",
      "compliance:review",
      "reports:view",
      "templates:manage"
    ]
  },
  dashboard: {
    label: "اللوحة التنفيذية",
    requiredAny: ["portfolio:view", "templates:manage"]
  },
  "portal:candidates": {
    label: "الملفات",
    requiredAny: ["cases:view:assigned"]
  },
  "portal:cases": {
    label: "الحالات",
    requiredAny: ["cases:view:initiated", "portfolio:view", "audit:view"]
  },
  "portal:new-case": {
    label: "حالة جديدة",
    requiredAny: ["cases:create"]
  },
  "portal:submission-status": {
    label: "حالة الإرسال",
    requiredAny: ["cases:submit"]
  },
  "portal:assigned-cases": {
    label: "الحالات المعيّنة",
    requiredAny: ["cases:view:assigned"]
  },
  "portal:barriers": {
    label: "العوائق",
    requiredAny: ["barriers:review"]
  },
  "portal:team-queue": {
    label: "طابور الفريق",
    requiredAny: ["job:review"]
  },
  "portal:task-validation": {
    label: "اعتماد المهام",
    requiredAny: ["job:review"]
  },
  "portal:recommendation-review": {
    label: "مراجعة التوصية",
    requiredAny: ["recommendation:review"]
  },
  "portal:compliance-queue": {
    label: "طابور الامتثال",
    requiredAny: ["compliance:review"]
  },
  "portal:standards-check": {
    label: "فحص المعايير",
    requiredAny: ["compliance:review"]
  },
  "portal:decision-trace": {
    label: "أثر القرار",
    requiredAny: ["compliance:review"]
  },
  "portal:approval-panel": {
    label: "لوحة الاعتماد",
    requiredAny: ["compliance:approve"]
  },
  "portal:reports": {
    label: "التقارير",
    requiredAny: ["reports:view"]
  },
  "portal:trends": {
    label: "الاتجاهات",
    requiredAny: ["trends:view"]
  },
  "portal:decisions-summary": {
    label: "ملخص القرارات",
    requiredAny: ["decisions:view"]
  },
  "portal:templates": {
    label: "القوالب",
    requiredAny: ["templates:manage"]
  },
  "portal:standards": {
    label: "المعايير",
    requiredAny: ["standards:manage"]
  },
  "portal:roles-permissions": {
    label: "الأدوار والصلاحيات",
    requiredAny: ["roles:manage"]
  },
  "portal:system-settings": {
    label: "إعدادات النظام",
    requiredAny: ["settings:manage"]
  },
  "portal:audit-log": {
    label: "سجل التدقيق",
    requiredAny: ["audit:view"]
  }
};

export const PORTAL_PAGE_KEYS: Record<PortalSlug, AppPageId> = {
  cases: "portal:cases",
  "new-case": "portal:new-case",
  "submission-status": "portal:submission-status",
  "assigned-cases": "portal:assigned-cases",
  barriers: "portal:barriers",
  "team-queue": "portal:team-queue",
  "task-validation": "portal:task-validation",
  "recommendation-review": "portal:recommendation-review",
  "compliance-queue": "portal:compliance-queue",
  "standards-check": "portal:standards-check",
  "decision-trace": "portal:decision-trace",
  "approval-panel": "portal:approval-panel",
  reports: "portal:reports",
  trends: "portal:trends",
  "decisions-summary": "portal:decisions-summary",
  templates: "portal:templates",
  standards: "portal:standards",
  "roles-permissions": "portal:roles-permissions",
  "system-settings": "portal:system-settings",
  "audit-log": "portal:audit-log"
};

export const ROLE_CONFIGS: Record<AppRole, RoleConfig> = {
  "case-initiator": {
    label: "مبادر الحالة",
    shortLabel: "المبادر",
    description: "يبدأ الحالة ويدفعها إلى مسار المراجعة.",
    defaultHref: "/home",
    primaryAction: {
      label: "ابدأ حالة جديدة",
      href: "/portal/new-case"
    },
    navItems: [
      { label: "نظرة عامة", href: "/home", pageId: "home" },
      { label: "الحالات", href: "/portal/cases", pageId: "portal:cases" },
      { label: "حالة جديدة", href: "/portal/new-case", pageId: "portal:new-case" },
      { label: "إدخال الوظيفة", href: "/job-analysis", pageId: "job-analysis" },
      {
        label: "حالة الإرسال",
        href: "/portal/submission-status",
        pageId: "portal:submission-status"
      }
    ]
  },
  assessor: {
    label: "المقيّم",
    shortLabel: "المقيّم",
    description: "يبني الملف التشغيلي ويقترح التكييف.",
    defaultHref: "/home",
    primaryAction: {
      label: "راجع المطابقة",
      href: "/matching"
    },
    navItems: [
      { label: "نظرة عامة", href: "/home", pageId: "home" },
      {
        label: "الحالات المعيّنة",
        href: "/portal/assigned-cases",
        pageId: "portal:assigned-cases"
      },
      {
        label: "ملف القدرات",
        href: "/candidate-profile",
        pageId: "candidate-profile"
      },
      { label: "العوائق", href: "/portal/barriers", pageId: "portal:barriers" },
      { label: "المطابقة", href: "/matching", pageId: "matching" },
      {
        label: "التكييفات",
        href: "/accommodation-plan",
        pageId: "accommodation-plan"
      }
    ]
  },
  "hiring-manager": {
    label: "مدير التوظيف",
    shortLabel: "مدير التوظيف",
    description: "يراجع واقعية الدور ويؤكد المهام الحاسمة.",
    defaultHref: "/home",
    primaryAction: {
      label: "راجع التوصية",
      href: "/portal/recommendation-review"
    },
    navItems: [
      { label: "نظرة عامة", href: "/home", pageId: "home" },
      { label: "طابور الفريق", href: "/portal/team-queue", pageId: "portal:team-queue" },
      {
        label: "مراجعة واقعية الوظيفة",
        href: "/job-analysis",
        pageId: "job-analysis"
      },
      {
        label: "اعتماد المهام",
        href: "/portal/task-validation",
        pageId: "portal:task-validation"
      },
      {
        label: "مراجعة التوصية",
        href: "/portal/recommendation-review",
        pageId: "portal:recommendation-review"
      }
    ]
  },
  "compliance-reviewer": {
    label: "مراجع الامتثال",
    shortLabel: "الامتثال",
    description: "يراجع الأثر والمعايير ويعتمد القرار.",
    defaultHref: "/home",
    primaryAction: {
      label: "افتح لوحة الاعتماد",
      href: "/portal/approval-panel"
    },
    navItems: [
      { label: "نظرة عامة", href: "/home", pageId: "home" },
      {
        label: "طابور الامتثال",
        href: "/portal/compliance-queue",
        pageId: "portal:compliance-queue"
      },
      {
        label: "فحص المعايير",
        href: "/portal/standards-check",
        pageId: "portal:standards-check"
      },
      {
        label: "أثر القرار",
        href: "/portal/decision-trace",
        pageId: "portal:decision-trace"
      },
      {
        label: "لوحة الاعتماد",
        href: "/portal/approval-panel",
        pageId: "portal:approval-panel"
      }
    ]
  },
  "executive-viewer": {
    label: "المشاهد التنفيذي",
    shortLabel: "تنفيذي",
    description: "يرى المحفظة والتقارير والاتجاهات فقط.",
    defaultHref: "/home",
    primaryAction: {
      label: "اعرض التقرير",
      href: "/portal/reports"
    },
    navItems: [
      { label: "نظرة عامة", href: "/home", pageId: "home" },
      {
        label: "لوحة المحفظة",
        href: "/dashboard",
        pageId: "dashboard"
      },
      { label: "التقارير", href: "/portal/reports", pageId: "portal:reports" },
      { label: "الاتجاهات", href: "/portal/trends", pageId: "portal:trends" },
      {
        label: "ملخص القرارات",
        href: "/portal/decisions-summary",
        pageId: "portal:decisions-summary"
      }
    ]
  },
  "platform-admin": {
    label: "مدير المنصة",
    shortLabel: "المدير",
    description: "يدير القوالب والمعايير والصلاحيات.",
    defaultHref: "/home",
    primaryAction: {
      label: "أدر القوالب",
      href: "/portal/templates"
    },
    navItems: [
      { label: "نظرة عامة", href: "/home", pageId: "home" },
      { label: "القوالب", href: "/portal/templates", pageId: "portal:templates" },
      { label: "المعايير", href: "/portal/standards", pageId: "portal:standards" },
      {
        label: "الأدوار والصلاحيات",
        href: "/portal/roles-permissions",
        pageId: "portal:roles-permissions"
      },
      {
        label: "إعدادات النظام",
        href: "/portal/system-settings",
        pageId: "portal:system-settings"
      },
      { label: "سجل التدقيق", href: "/portal/audit-log", pageId: "portal:audit-log" }
    ]
  }
};

export const portalSlugs = Object.keys(PORTAL_PAGE_KEYS) as PortalSlug[];

export const hasPermission = (role: AppRole, permission: AppPermission) =>
  ROLE_PERMISSIONS[role].includes(permission);

export const canAccessPage = (role: AppRole, pageId: AppPageId) =>
  PAGE_PERMISSION_MAP[pageId].requiredAny.some((permission) => hasPermission(role, permission));

export const getRoleConfig = (role: AppRole) => ROLE_CONFIGS[role];

export const getFirstAllowedHref = (role: AppRole) => {
  const config = getRoleConfig(role);
  const firstAllowed = config.navItems.find((item) => canAccessPage(role, item.pageId));
  return firstAllowed?.href ?? "/home";
};
