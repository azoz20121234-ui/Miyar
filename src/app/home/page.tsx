"use client";

import Link from "next/link";

import { ActionCard } from "@/components/action-card";
import { AIInsightCard } from "@/components/ai-insight-card";
import { AppShell } from "@/components/app-shell";
import { DecisionTimeline } from "@/components/decision-timeline";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import {
  generateDecisionExplanation,
  generateNextActionReason
} from "@/lib/ai-insights";
import { stripInternalCodePrefix } from "@/lib/display-copy";
import { INTERNAL_ROLE_REFERENCE } from "@/lib/experience-roles";
import { estimatedDecisionROIBandLabel } from "@/lib/financial-model";
import { getRoleConfig } from "@/lib/role-model";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

export default function RoleHomePage() {
  const {
    bundle,
    explainability,
    financialImpact,
    caseWorkflow,
    caseRecord,
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
  const displayTitle = job.title || `الحالة #${caseRecord.id}`;
  const decisionExplanation = generateDecisionExplanation({
    bundle,
    explainability,
    caseWorkflow,
    financialImpact
  }).slice(0, 2);
  const nextActionReason = generateNextActionReason({
    bundle,
    explainability,
    caseWorkflow,
    financialImpact
  });

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
      items: roleDefinition.edits.slice(0, 3)
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

  return (
    <AppShell
      pageId="home"
      title={`مساحة ${roleDefinition.label}`}
      subtitle="مساحة قرار موحدة تركّز على المرحلة الحالية، المانع الأعلى، والإجراء التالي لهذا الدور فقط."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="decision-surface">
          <div className="border-b border-white/8 px-6 py-4 sm:px-8">
            <div className="min-w-0">
              <div className="portal-label">سطح القرار</div>
              <div className="mt-2 text-sm text-slate-300">{displayTitle}</div>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
            <div className="max-w-3xl">
              <div className="portal-label">القرار الحالي</div>
              <div className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[58px] sm:leading-[1.02]">
                {bundle.report.recommendation}
              </div>
            </div>

            <AIInsightCard title="لماذا هذا القرار؟" lines={decisionExplanation} />

            <div className="decision-panel px-5 py-5">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">أعلى مانع</div>
              <div className="mt-3 text-xl font-semibold text-white">
                {stripInternalCodePrefix(primaryBlock?.title) || "لا يوجد مانع مباشر"}
              </div>
              <div className="mt-2 text-sm leading-7 text-slate-300">
                {primaryBlock?.requiredAction ?? "المسار جاهز للتحرك الآن."}
              </div>
            </div>

            <div className="decision-panel px-5 py-5">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">الإجراء التالي</div>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {primaryAction.kind === "link" && primaryAction.href ? (
                  <Link
                    href={primaryAction.href}
                    className={`decision-cta px-5 py-3 text-sm font-semibold ${
                      primaryAction.disabled ? "pointer-events-none cursor-not-allowed opacity-45" : ""
                    }`}
                    aria-disabled={primaryAction.disabled}
                  >
                    {primaryAction.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    disabled={primaryAction.disabled}
                    className={`decision-cta px-5 py-3 text-sm font-semibold ${
                      primaryAction.disabled ? "pointer-events-none cursor-not-allowed opacity-45" : ""
                    }`}
                  >
                    {primaryAction.label}
                  </button>
                )}
              </div>
              <div className="mt-3 text-sm leading-7 text-slate-300">{nextActionReason}</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="decision-stat px-4 py-4">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">المرحلة التالية</div>
                <div className="mt-2 text-lg font-semibold text-white">{caseWorkflow.nextStageLabel}</div>
              </div>
              <div className="decision-stat px-4 py-4">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">الأثر المالي</div>
                <div className="mt-2 text-lg font-semibold text-white">{financialImpact.financialSignalLabel}</div>
                <div className="mt-1 text-xs text-slate-400">
                  {estimatedDecisionROIBandLabel(financialImpact.estimatedDecisionROIBand)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionCard
          eyebrow={isAdmin ? "مساحة الإدارة" : "منطقة العمل"}
          title={roleZoneTitleMap[role]}
          description={
            isAdmin
              ? "هذه المساحة تختلف عن الأدوار التشغيلية وتركّز على التحكم الداخلي."
              : "هذه المنطقة توضّح ما يخص هذا الدور فقط بعد معرفة القرار والمانع والإجراء."
          }
          className="scroll-mt-28"
        >
          <div id="role-zone" />
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
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="state-card px-5 py-5">
                <div className="portal-label">نطاق الدور</div>
                <div className="mt-3 text-xl font-semibold text-white">{roleDefinition.label}</div>
                <div className="mt-4 space-y-4">
                  {roleZoneCards.map((card) => (
                    <div key={card.title}>
                      <div className="text-sm font-medium text-white">{card.title}</div>
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

              <div className="summary-card px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="portal-label">ما يخص هذا الدور الآن</div>
                    <div className="mt-3 text-xl font-semibold text-white">{roleDefinition.description}</div>
                  </div>
                  <StatusPill label={roleDefinition.label} tone="neutral" />
                </div>

                <div className="mt-5 space-y-4">
                  <div className="surface-card-muted px-4 py-4">
                    <div className="text-[11px] tracking-[0.16em] text-slate-500">يراجع الآن</div>
                    <div className="mt-2 text-sm leading-7 text-white">
                      {roleDefinition.sees.slice(0, 2).join(" • ")}
                    </div>
                  </div>

                  <div className="surface-card-muted px-4 py-4">
                    <div className="text-[11px] tracking-[0.16em] text-slate-500">ما الذي سيحرك المرحلة</div>
                    <div className="mt-2 text-sm leading-7 text-white">
                      إغلاق متطلبات هذه المرحلة ضمن صلاحيات هذا الدور فقط.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        <DecisionTimeline />
      </div>
    </AppShell>
  );
}
