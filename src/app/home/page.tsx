"use client";

import Link from "next/link";

import { ActionCard } from "@/components/action-card";
import { AppShell } from "@/components/app-shell";
import { DecisionTimeline } from "@/components/decision-timeline";
import { FinancialImpactCard } from "@/components/financial-impact-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { INTERNAL_ROLE_REFERENCE } from "@/lib/experience-roles";
import {
  estimatedDecisionROIBandLabel,
  retentionImpactLevelLabel
} from "@/lib/financial-model";
import { getRoleConfig } from "@/lib/role-model";
import { formatCurrency, statusTone } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

export default function RoleHomePage() {
  const {
    bundle,
    explainability,
    financialImpact,
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
  const roleZoneTitleMap = {
    assessor: "منطقة عمل المقيّم",
    "hiring-manager": "منطقة مراجعة المدير",
    "compliance-reviewer": "منطقة قرار الامتثال",
    "executive-viewer": "المنطقة التنفيذية",
    "case-initiator": "منطقة بدء الحالة",
    "platform-admin": "منطقة إدارة المنصة"
  } as const;
  const supportCards = [
    {
      title: "الأدلة",
      items:
        externalHandoff?.candidate.evidence.length
          ? externalHandoff.candidate.evidence.slice(0, 3)
          : ["لا توجد أدلة مرفقة بعد"]
    },
    {
      title: "التكييفات",
      items:
        bundle.plan.items.length > 0
          ? bundle.plan.items.slice(0, 3).map((item) => item.name)
          : ["لا توجد تكييفات حاسمة حتى الآن"]
    },
    {
      title: "الملخص",
      items: [bundle.report.executiveSummary]
    }
  ];

  return (
    <AppShell
      pageId="home"
      title={`مساحة ${roleDefinition.label}`}
      subtitle="مساحة قرار موحدة تركّز على المرحلة الحالية، المانع الأعلى، والإجراء التالي لهذا الدور فقط."
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
              <div className="mt-3 text-sm text-slate-400">
                {job.title || `الحالة #${caseRecord.id}`}
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[42px]">
                {bundle.report.recommendation}
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

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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

        <FinancialImpactCard
          title="الأثر المالي للقرار"
          summary="ليس فقط ماذا قررنا، بل لماذا يبدو القرار منطقيًا ماليًا مقارنة بالتأخير أو القرار غير المناسب."
          signalLabel={financialImpact.financialSignalLabel}
          signalTone={financialImpact.financialSignalTone}
          items={[
            {
              label: "تكلفة التكييف",
              value: formatCurrency(financialImpact.directAccommodationCost),
              hint: "الكلفة المباشرة قبل التنفيذ",
              tone: "neutral"
            },
            {
              label: "تكلفة القرار الخاطئ",
              value: formatCurrency(financialImpact.wrongDecisionCost),
              hint: "إعادة توظيف + فقدان إنتاجية + إعادة تقييم",
              tone: "risk"
            },
            {
              label: "تكلفة التأخير",
              value: formatCurrency(financialImpact.delayCost),
              hint: `${financialImpact.estimatedDelayDays} أيام تأخير تقديرية`,
              tone: "watch"
            },
            {
              label: "الهدر المتجنب",
              value: formatCurrency(financialImpact.avoidedGhostHiringCost),
              hint: "قيمة تجنب التوظيف الشكلي أو غير المنتج",
              tone: "positive"
            },
            {
              label: "العائد التقديري",
              value: `${estimatedDecisionROIBandLabel(financialImpact.estimatedDecisionROIBand)} • ${financialImpact.estimatedDecisionROI}%`,
              hint: "مقارنة بالقيمة المتجنبة مقابل تكلفة التنفيذ",
              tone:
                financialImpact.estimatedDecisionROIBand === "high"
                  ? "positive"
                  : financialImpact.estimatedDecisionROIBand === "medium"
                    ? "watch"
                    : "risk"
            },
            {
              label: "أثر الاستمرارية",
              value: retentionImpactLevelLabel(financialImpact.retentionImpactLevel),
              hint: "تقدير عملي بعد التكييف",
              tone:
                financialImpact.retentionImpactLevel === "high"
                  ? "positive"
                  : financialImpact.retentionImpactLevel === "medium"
                    ? "watch"
                    : "risk"
            }
          ]}
          conclusion={financialImpact.executiveConclusion}
          footnote={financialImpact.assumptionsNote}
        />

        <SectionCard
          eyebrow={isAdmin ? "مساحة الإدارة" : "منطقة العمل"}
          title={roleZoneTitleMap[role]}
          description={
            isAdmin
              ? "هذه المساحة تختلف عن الأدوار التشغيلية وتركّز على التحكم الداخلي."
              : "محتوى هذه المنطقة يتغير حسب الدور الحالي بوضوح."
          }
        >
          {isAdmin ? (
            <div className="space-y-4">
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

              <div className="grid gap-3 md:grid-cols-3">
                {adminZoneCards.map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="state-card block px-4 py-4 transition hover:bg-white/[0.05]"
                  >
                    <div className="text-sm font-semibold text-white">{card.title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">{card.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ActionCard
                eyebrow="الإجراء التالي"
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

              <div className="grid gap-3 md:grid-cols-3">
                <div className="blocker-card px-4 py-4">
                  <div className="text-xs text-amber-100">المانع الحالي</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {primaryBlock?.title ?? "لا يوجد مانع مباشر"}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">
                    {primaryBlock?.requiredAction ?? "المسار جاهز للتحرك الآن."}
                  </div>
                </div>

                {roleZoneCards.map((card) => (
                  <div key={card.title} className="state-card px-4 py-4">
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
            </div>
          )}
        </SectionCard>

        <DecisionTimeline />

        <SectionCard
          eyebrow="سياق داعم"
          title="ما الذي يدعم القرار؟"
          description="تفاصيل مختصرة تظهر فقط عند الحاجة بعد القرار والإجراء."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {supportCards.map((card) => (
              <div key={card.title} className="summary-card px-4 py-4">
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
        </SectionCard>
      </div>
    </AppShell>
  );
}
