"use client";

import Link from "next/link";

import { ActionCard } from "@/components/action-card";
import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { INTERNAL_ROLE_REFERENCE } from "@/lib/experience-roles";
import { getRoleConfig } from "@/lib/role-model";
import { statusTone } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

export default function RoleHomePage() {
  const {
    bundle,
    explainability,
    caseWorkflow,
    externalHandoff,
    transitionCase,
    completeStageAction
  } = useAssessment();
  const { role } = useRoleSession();
  const roleConfig = getRoleConfig(role);
  const roleDefinition = INTERNAL_ROLE_REFERENCE[role];
  const primaryAction = caseWorkflow.primaryAction;

  const visibleBlocks = (() => {
    const preferred =
      role === "assessor" ||
      role === "hiring-manager" ||
      role === "compliance-reviewer" ||
      role === "platform-admin"
        ? explainability.approvalBlocks.filter((block) => block.ownerRole === role)
        : explainability.approvalBlocks;

    return (preferred.length ? preferred : explainability.approvalBlocks).slice(0, 2);
  })();

  const handlePrimaryAction = () => {
    if (primaryAction.kind === "transition") {
      transitionCase(primaryAction.id);
      return;
    }

    if (primaryAction.kind === "stage-action") {
      completeStageAction(primaryAction.id);
    }
  };

  return (
    <AppShell
      pageId="home"
      title={`مساحة ${roleDefinition.label}`}
      subtitle="مساحة قرار موحدة تركّز على المرحلة الحالية، المانع الأعلى، والإجراء التالي لهذا الدور فقط."
      actions={
        <Link
          href={roleConfig.primaryAction.href}
          className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          {roleConfig.primaryAction.label}
        </Link>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="surface-card-soft p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              {externalHandoff ? (
                <div className="mb-3 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  📥 تم إنشاء الحالة من بوابة خارجية
                </div>
              ) : null}
              <div className="portal-label">حالة القرار</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[40px]">
                {bundle.report.recommendation}
              </div>
              <div className="mt-3 text-sm leading-7 body-muted">
                الحالة الآن في {caseWorkflow.currentStateLabel} ويقودها {caseWorkflow.currentOwnerLabel}.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill label={`جاهزية ${bundle.report.finalReadiness}%`} tone={statusTone(bundle.report.status)} />
              <StatusPill label={`${explainability.approvalBlocks.length} موانع`} tone={explainability.approvalBlocks.length > 0 ? "warning" : "success"} />
              <StatusPill label={`التالي ${caseWorkflow.nextStageLabel}`} tone="neutral" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="surface-card-muted px-4 py-3">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">جاهزية القرار</div>
              <div className="mt-2 text-lg font-semibold text-white">{bundle.report.finalReadiness}%</div>
              <div className="mt-1 text-xs body-muted">فجوة {explainability.threshold.currentGap}% إلى حد الاعتماد</div>
            </div>
            <div className="surface-card-muted px-4 py-3">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">المالك الحالي</div>
              <div className="mt-2 text-lg font-semibold text-white">{caseWorkflow.currentOwnerLabel}</div>
              <div className="mt-1 text-xs body-muted">المسؤول عن التحريك الآن</div>
            </div>
            <div className="surface-card-muted px-4 py-3">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">أهم مانع</div>
              <div className="mt-2 text-lg font-semibold text-white">
                {visibleBlocks[0]?.ownerLabel ?? "لا يوجد"}
              </div>
              <div className="mt-1 text-xs body-muted">
                {visibleBlocks[0]?.title ?? "المسار جاهز دون مانع مباشر"}
              </div>
            </div>
          </div>
        </section>

        <ActionCard
          eyebrow="الإجراء الرئيسي"
          title={primaryAction.label}
          problem={primaryAction.label}
          reason={primaryAction.description}
          impact={`إذا أُنجز هذا الإجراء ستتحرك الحالة نحو ${caseWorkflow.nextStageLabel}.`}
          meta={`المرحلة الحالية ${caseWorkflow.currentStateLabel}`}
          status={
            <StatusPill
              label={primaryAction.disabled ? "معلّق" : "جاهز"}
              tone={primaryAction.disabled ? "warning" : "success"}
            />
          }
          cta={
            primaryAction.kind === "link"
              ? {
                  label: primaryAction.label,
                  href: primaryAction.href,
                  disabled: primaryAction.disabled
                }
              : {
                  label: primaryAction.label,
                  onClick: handlePrimaryAction,
                  disabled: primaryAction.disabled
                }
          }
          variant="primary"
        />

        <section className="space-y-4">
          {visibleBlocks.map((block, index) => (
            <ActionCard
              key={block.id}
              eyebrow="إجراء مساند"
              title={block.title}
              problem={block.title}
              reason={block.requiredAction}
              impact={
                index === 0
                  ? "إغلاقه يزيل مانع القرار الأول."
                  : "إغلاقه يرفع وضوح الحزمة قبل الاعتماد."
              }
              meta={block.ownerLabel}
              status={
                <StatusPill
                  label={block.blocker ? "مانع" : "مراجعة"}
                  tone={block.blocker ? "danger" : "warning"}
                />
              }
              cta={{ label: "راجع التقرير", href: "/readiness-report" }}
            />
          ))}
        </section>

        <SectionCard
          eyebrow="قائمة مختصرة"
          title="موانع القرار"
          description="القائمة الوحيدة داخل الصفحة الرئيسية."
        >
          <div className="table-shell">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/[0.03] text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-right">المانع</th>
                  <th className="px-4 py-3 text-right">السبب</th>
                  <th className="px-4 py-3 text-right">المالك</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-transparent">
                {explainability.approvalBlocks.slice(0, 4).map((block) => (
                  <tr key={block.id}>
                    <td className="px-4 py-4 text-white">{block.title}</td>
                    <td className="px-4 py-4 text-slate-300">{block.reason}</td>
                    <td className="px-4 py-4 text-slate-300">{block.ownerLabel}</td>
                    <td className="px-4 py-4">
                      <StatusPill
                        label={block.blocker ? "مانع" : "مراجعة"}
                        tone={block.blocker ? "danger" : "warning"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
