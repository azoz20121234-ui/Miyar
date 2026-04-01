"use client";

import Link from "next/link";

import { AIInsightCard } from "@/components/ai-insight-card";
import { generateNextActionReason } from "@/lib/ai-insights";
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

const RowsList = ({
  rows,
  sectionLabel
}: {
  rows: RoleHubViewProps["rows"];
  sectionLabel: string;
}) => (
  <SectionCard
    eyebrow={sectionLabel}
    title="القائمة المختصرة"
    description="القائمة الوحيدة داخل هذه المساحة."
    className="scroll-mt-24"
  >
    <div className="space-y-3">
      {rows.slice(0, 4).map((row) => (
        <div
          key={`${row.primary}-${row.status}`}
          className="summary-card flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">{row.primary}</div>
            <div className="mt-1 text-sm leading-6 text-slate-400">{row.secondary}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label={statusLabel(row.status)} tone={toneForStatus(statusLabel(row.status))} />
            <div className="text-xs text-slate-500">{ownerLabel(row.owner)}</div>
          </div>
        </div>
      ))}
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
  const { bundle, explainability, caseWorkflow, financialImpact } = useAssessment();
  const { role } = useRoleSession();
  const portalLabel = portalVariantLabel[role];
  const supportingActions = actions.slice(1, 3);
  const heroMetrics = metrics.slice(0, 3);
  const topBlocker = explainability.approvalBlocks[0];
  const nextActionReason = generateNextActionReason({
    bundle,
    explainability,
    caseWorkflow,
    financialImpact
  });

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
        <section className="decision-surface">
          <div className="border-b border-white/8 px-6 py-4 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="portal-label">{portalLabel}</div>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[40px]">
                  {title}
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-300">{subtitle}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill label={bundle.report.recommendation} tone={statusTone(bundle.report.status)} />
                <StatusPill label={caseWorkflow.currentStateLabel} tone="neutral" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8 xl:grid-cols-[minmax(0,1.1fr)_300px]">
            <div className="space-y-4">
              <div className="decision-panel px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">الإجراء الرئيسي</div>
                <div className="mt-3 text-2xl font-semibold text-white">{cta.label}</div>
                <div className="mt-3 text-sm leading-7 text-slate-300">{nextActionReason}</div>
                <div className="mt-5">
                  <Link href={cta.href} className="decision-cta px-5 py-3 text-sm font-semibold">
                    {cta.label}
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroMetrics.map((item) => (
                  <div key={item.label} className="decision-stat px-4 py-4">
                    <div className="text-[11px] tracking-[0.16em] text-slate-500">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                    <div className="mt-1 text-xs body-muted">{item.hint}</div>
                  </div>
                ))}
              </div>

              <AIInsightCard
                title="ما الذي يجب أن يحدث الآن؟"
                lines={[
                  nextActionReason,
                  topBlocker
                    ? `المانع الأكثر حضورًا الآن لدى ${topBlocker.ownerLabel}.`
                    : `المسار جاهز للتحرك نحو ${caseWorkflow.nextStageLabel}.`
                ]}
              />
            </div>

            <div className="space-y-4">
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
                />
              ))}
            </div>
          </div>
        </section>

        <div id="portal-list">
          <RowsList rows={rows} sectionLabel={sectionLabel} />
        </div>
      </div>
    </AppShell>
  );
};
