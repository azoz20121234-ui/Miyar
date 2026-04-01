"use client";

import Link from "next/link";

import { ActionCard } from "@/components/action-card";
import { AppShell } from "@/components/app-shell";
import { DecisionTimeline } from "@/components/decision-timeline";
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
    caseRecord,
    externalHandoff,
    job,
    transitionCase,
    completeStageAction
  } = useAssessment();
  const { role } = useRoleSession();
  const roleConfig = getRoleConfig(role);
  const roleDefinition = INTERNAL_ROLE_REFERENCE[role];
  const primaryAction = caseWorkflow.primaryAction;
  const isAdmin = role === "platform-admin";

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
  const primaryBlock = visibleBlocks[0];

  const handlePrimaryAction = () => {
    if (primaryAction.kind === "transition") {
      transitionCase(primaryAction.id);
      return;
    }

    if (primaryAction.kind === "stage-action") {
      completeStageAction(primaryAction.id);
    }
  };

  const adminZoneCards = [
    {
      title: "المعايير",
      description: "راجع مكتبة المعايير والحالة الحالية لها.",
      href: "/portal/standards"
    },
    {
      title: "الصلاحيات",
      description: "تحقق من توزيع الأدوار والصلاحيات داخل المنصة.",
      href: "/portal/roles-permissions"
    },
    {
      title: "السجل",
      description: "راجع أثر التغييرات والتنقلات الأخيرة.",
      href: "/portal/audit-log"
    }
  ];

  const roleZoneCards = [
    {
      title: "ما الذي تراه الآن",
      items: roleDefinition.sees.slice(0, 4)
    },
    {
      title: "ما الذي تحركه",
      items: [...roleDefinition.edits.slice(0, 2), ...roleDefinition.submits.slice(0, 2)].slice(0, 4)
    }
  ];

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
              <div className="portal-label">الحالة الحالية</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[40px]">
                {job.title || `الحالة #${caseRecord.id}`}
              </div>
              <div className="mt-3 text-sm leading-7 body-muted">
                الحالة #{caseRecord.id} • المرحلة الحالية {caseWorkflow.currentStateLabel} • المالك الحالي{" "}
                {caseWorkflow.currentOwnerLabel}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill label={bundle.report.recommendation} tone={statusTone(bundle.report.status)} />
              <StatusPill
                label={`${explainability.approvalBlocks.length} موانع`}
                tone={explainability.approvalBlocks.length > 0 ? "warning" : "success"}
              />
              <StatusPill label={`المرحلة التالية ${caseWorkflow.nextStageLabel}`} tone="neutral" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="surface-card-muted px-4 py-3">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">القرار الحالي</div>
              <div className="mt-2 text-lg font-semibold text-white">{bundle.report.recommendation}</div>
              <div className="mt-1 text-xs body-muted">جاهزية {bundle.report.finalReadiness}%</div>
            </div>
            <div className="surface-card-muted px-4 py-3">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">أعلى مانع</div>
              <div className="mt-2 text-lg font-semibold text-white">
                {primaryBlock?.title ?? "لا يوجد"}
              </div>
              <div className="mt-1 text-xs body-muted">
                {primaryBlock?.ownerLabel ?? "المسار جاهز دون مانع مباشر"}
              </div>
            </div>
            <div className="surface-card-muted px-4 py-3">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">الإجراء التالي</div>
              <div className="mt-2 text-lg font-semibold text-white">{primaryAction.label}</div>
              <div className="mt-1 text-xs body-muted">{caseWorkflow.currentOwnerLabel}</div>
            </div>
            <div className="surface-card-muted px-4 py-3">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">المرحلة التالية</div>
              <div className="mt-2 text-lg font-semibold text-white">{caseWorkflow.nextStageLabel}</div>
              <div className="mt-1 text-xs body-muted">
                فجوة {explainability.threshold.currentGap}% إلى حد الاعتماد
              </div>
            </div>
          </div>
        </section>

        {isAdmin ? (
          <ActionCard
            eyebrow="الإجراء الرئيسي"
            title={roleConfig.primaryAction.label}
            problem="هذه المساحة للإعدادات والمعايير والسجل."
            reason="هذا الدور لا يدير التقييم التشغيلي المباشر، بل يضبط النظام الذي يعتمد عليه القرار."
            impact="التحرك من هنا يرفع اتساق القوالب والمعايير والصلاحيات داخل المنصة."
            meta="مساحة الإدارة"
            status={<StatusPill label="إدارة" tone="neutral" />}
            cta={{
              label: roleConfig.primaryAction.label,
              href: roleConfig.primaryAction.href
            }}
            variant="primary"
          />
        ) : (
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
        )}

        <SectionCard
          eyebrow={isAdmin ? "مساحة الإدارة" : "منطقة العمل"}
          title={isAdmin ? "ماذا تدير الآن؟" : `ما الذي يخص ${roleDefinition.label}؟`}
          description={
            isAdmin
              ? "هذه المساحة تختلف عن الأدوار التشغيلية وتركّز على التحكم الداخلي."
              : "محتوى هذه المنطقة يتغير حسب الدور الحالي بوضوح."
          }
        >
          {isAdmin ? (
            <div className="grid gap-3 md:grid-cols-3">
              {adminZoneCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="surface-card-muted block px-4 py-4 transition hover:bg-white/[0.05]"
                >
                  <div className="text-sm font-semibold text-white">{card.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">{card.description}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {roleZoneCards.map((card) => (
                <div key={card.title} className="surface-card-muted px-4 py-4">
                  <div className="text-sm font-semibold text-white">{card.title}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {card.items.map((item) => (
                      <span
                        key={`${card.title}-${item}`}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {!isAdmin ? (
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
        ) : null}

        <DecisionTimeline />

        <SectionCard
          eyebrow="الموانع"
          title="ملخص سريع"
          description="عرض مختصر للموانع المفتوحة فقط."
        >
          <div className="space-y-3">
            {explainability.approvalBlocks.slice(0, 3).map((block) => (
              <div key={block.id} className="surface-card-muted flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{block.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-400">{block.reason}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill
                    label={block.blocker ? "مانع" : "مراجعة"}
                    tone={block.blocker ? "danger" : "warning"}
                  />
                  <StatusPill label={block.ownerLabel} tone="neutral" />
                </div>
              </div>
            ))}
            {explainability.approvalBlocks.length === 0 ? (
              <div className="surface-card-muted px-4 py-4 text-sm text-slate-300">
                لا توجد موانع مفتوحة في هذه اللحظة.
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
