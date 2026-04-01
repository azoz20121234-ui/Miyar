"use client";

import Link from "next/link";

import { APP_ROLES, AppPageId, getRoleConfig } from "@/lib/role-model";
import { statusTone } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

import { ActionCard } from "./action-card";
import { AppShell } from "./app-shell";
import { SectionCard } from "./section-card";
import { StatusPill } from "./status-pill";

interface RoleHubViewProps {
  pageId: AppPageId;
  title: string;
  subtitle: string;
  cta: {
    label: string;
    href: string;
  };
  metrics: Array<{
    label: string;
    value: string;
    hint: string;
    tone?: "neutral" | "success" | "warning" | "danger";
  }>;
  actions: Array<{
    title: string;
    meta?: string;
    status?: string;
  }>;
  rows: Array<{
    primary: string;
    secondary: string;
    status: string;
    owner?: string;
  }>;
  sectionLabel: string;
}

const toneForStatus = (status?: string) => {
  if (!status) return "neutral";
  if (
    status.includes("جاهز") ||
    status.includes("معتمد") ||
    status.includes("success") ||
    status.includes("اعتماد") ||
    status.includes("مستوفى")
  ) {
    return "success";
  }

  if (
    status.includes("مطلوب") ||
    status.includes("warning") ||
    status.includes("مراجعة") ||
    status.includes("طلب") ||
    status.includes("مفتوح") ||
    status.includes("متوسط")
  ) {
    return "warning";
  }

  if (
    status.includes("رفض") ||
    status.includes("مانع") ||
    status.includes("خطر") ||
    status.includes("مرتفع")
  ) {
    return "danger";
  }

  return "neutral";
};

const statusLabel = (status: string) => {
  if (status === "passed") return "مستوفى";
  if (status === "needs-review") return "بانتظار مراجعة";
  if (status === "missing-evidence") return "دليل ناقص";
  if (status === "blocker") return "مانع";
  if (status === "high") return "مرتفع";
  if (status === "medium") return "متوسط";
  if (status === "low") return "منخفض";
  if (status === "critical") return "حرج";
  if (status === "next") return "التالي";
  if (status === "planned") return "مخطط";
  if (status === "active") return "نشط";
  return status;
};

const ownerLabel = (owner?: string) => {
  if (!owner) return "-";
  if ((APP_ROLES as readonly string[]).includes(owner)) {
    return getRoleConfig(owner as (typeof APP_ROLES)[number]).label;
  }
  return owner;
};

const portalVariantLabel = {
  "case-initiator": "إدخال القرار",
  assessor: "مسار التقييم",
  "hiring-manager": "مراجعة الواقعية",
  "compliance-reviewer": "قرار الامتثال",
  "executive-viewer": "الرؤية التنفيذية",
  "platform-admin": "التحكم بالمنصة"
} as const;

const impactForAction = (index: number, nextStageLabel: string, recommendation: string) => {
  if (index === 0) return `يحرك الحالة مباشرة نحو ${nextStageLabel}.`;
  if (index === 1) return "يخفض العوائق المفتوحة ويعطي المراجع التالي صورة أوضح.";
  if (index === 2) return `يدعم قرار ${recommendation} بحزمة تشغيلية أكثر وضوحًا.`;
  return "يرفع وضوح القرار داخل هذا المسار.";
};

const RowsTable = ({
  rows,
  sectionLabel
}: {
  rows: RoleHubViewProps["rows"];
  sectionLabel: string;
}) => (
  <SectionCard
    eyebrow={sectionLabel}
    title="القائمة المختصرة"
    description="القائمة الوحيدة داخل هذه البوابة."
    className="scroll-mt-24"
  >
    <div className="table-shell">
      <table className="min-w-full divide-y divide-white/10 text-sm">
        <thead className="bg-white/[0.03] text-slate-500">
          <tr>
            <th className="px-4 py-3 text-right">العنصر</th>
            <th className="px-4 py-3 text-right">التفصيل</th>
            <th className="px-4 py-3 text-right">الحالة</th>
            <th className="px-4 py-3 text-right">المالك</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-transparent">
          {rows.slice(0, 4).map((row) => (
            <tr key={`${row.primary}-${row.status}`}>
              <td className="px-4 py-4 text-white">{row.primary}</td>
              <td className="px-4 py-4 text-slate-300">{row.secondary}</td>
              <td className="px-4 py-4">
                <StatusPill label={statusLabel(row.status)} tone={toneForStatus(statusLabel(row.status))} />
              </td>
              <td className="px-4 py-4 text-slate-400">{ownerLabel(row.owner)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionCard>
);

export const RoleHubView = ({
  pageId,
  title,
  subtitle,
  cta,
  metrics,
  actions,
  rows,
  sectionLabel
}: RoleHubViewProps) => {
  const { bundle, explainability, caseWorkflow } = useAssessment();
  const { role } = useRoleSession();
  const portalLabel = portalVariantLabel[role];
  const primaryAction = actions[0];
  const supportingActions = actions.slice(1, 3);
  const heroMetrics = metrics.slice(0, 3);
  const topBlocker = explainability.approvalBlocks[0];

  return (
    <AppShell
      pageId={pageId}
      title={title}
      subtitle={subtitle}
      actions={
        <Link
          href={cta.href}
          className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          {cta.label}
        </Link>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="surface-card-soft p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="portal-label">{portalLabel}</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[40px]">
                {bundle.report.recommendation}
              </div>
              <div className="mt-3 text-sm leading-7 body-muted">
                {subtitle}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill label={bundle.report.recommendation} tone={statusTone(bundle.report.status)} />
              <StatusPill label={caseWorkflow.currentStateLabel} tone="neutral" />
              {topBlocker ? <StatusPill label={`مانع: ${topBlocker.ownerLabel}`} tone="warning" /> : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {heroMetrics.map((item) => (
              <div key={item.label} className="surface-card-muted px-4 py-3">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">{item.label}</div>
                <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                <div className="mt-1 text-xs body-muted">{item.hint}</div>
              </div>
            ))}
          </div>
        </section>

        {primaryAction ? (
          <ActionCard
            eyebrow="الإجراء الرئيسي"
            title={primaryAction.title}
            problem={primaryAction.title}
            reason={primaryAction.meta ?? "هذا الإجراء هو المدخل الرئيسي لتحريك القرار الآن."}
            impact={impactForAction(0, caseWorkflow.nextStageLabel, bundle.report.recommendation)}
            meta={primaryAction.status}
            status={
              primaryAction.status ? (
                <StatusPill label={primaryAction.status} tone={toneForStatus(primaryAction.status)} />
              ) : (
                <StatusPill label="الآن" tone="success" />
              )
            }
            cta={{ label: cta.label, href: cta.href }}
            variant="primary"
          />
        ) : null}

        <section className="space-y-4">
          {supportingActions.map((item, index) => (
            <ActionCard
              key={`${item.title}-${index}`}
              eyebrow="إجراء مساند"
              title={item.title}
              problem={item.title}
              reason={item.meta ?? "جزء داعم لتقليل التعليق داخل المسار الحالي."}
              impact={impactForAction(index + 1, caseWorkflow.nextStageLabel, bundle.report.recommendation)}
              meta={item.status}
              status={
                item.status ? (
                  <StatusPill label={item.status} tone={toneForStatus(item.status)} />
                ) : null
              }
              cta={{
                label: index === 0 ? "افتح المسار" : "راجع القائمة",
                href: index === 0 ? cta.href : "#portal-list"
              }}
            />
          ))}
        </section>

        <div id="portal-list">
          <RowsTable rows={rows} sectionLabel={sectionLabel} />
        </div>
      </div>
    </AppShell>
  );
};
