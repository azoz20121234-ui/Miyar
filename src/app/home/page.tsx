"use client";

import Link from "next/link";

import { ActionCard } from "@/components/action-card";
import { AppShell } from "@/components/app-shell";
import { DecisionCard } from "@/components/decision-card";
import { InfoCard } from "@/components/info-card";
import { StatusPill } from "@/components/status-pill";
import { getRoleConfig } from "@/lib/role-model";
import { statusTone } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

const portalNameMap = {
  "case-initiator": "Case Initiation Portal",
  assessor: "Assessment Portal",
  "hiring-manager": "Manager Portal",
  "compliance-reviewer": "Compliance Portal",
  "executive-viewer": "Executive Portal",
  "platform-admin": "Admin Portal"
} as const;

export default function RoleHomePage() {
  const {
    bundle,
    explainability,
    caseWorkflow,
    transitionCase,
    completeStageAction
  } = useAssessment();
  const { role } = useRoleSession();
  const roleConfig = getRoleConfig(role);
  const primaryAction = caseWorkflow.primaryAction;

  const visibleBlocks = (() => {
    const preferred =
      role === "assessor" ||
      role === "hiring-manager" ||
      role === "compliance-reviewer" ||
      role === "platform-admin"
        ? explainability.approvalBlocks.filter((block) => block.ownerRole === role)
        : explainability.approvalBlocks;

    return (preferred.length ? preferred : explainability.approvalBlocks).slice(0, 3);
  })();

  const metrics = [
    {
      label: "Decision readiness",
      value: `${bundle.report.finalReadiness}%`,
      hint: `Gap ${explainability.threshold.currentGap}% إلى حد الاعتماد`
    },
    {
      label: "Open blockers",
      value: `${explainability.approvalBlocks.length}`,
      hint: explainability.approvalBlocks.length > 0 ? "تمنع الاعتماد الآن" : "لا يوجد مانع مفتوح"
    },
    {
      label: "Current owner",
      value: caseWorkflow.currentOwnerLabel,
      hint: `التالي ${caseWorkflow.nextStageLabel}`
    }
  ];

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
      title={portalNameMap[role]}
      subtitle="Decision Entry تركّز على الحالة الحالية فقط: أين نحن، ما الذي يمنع القرار، وما الإجراء التالي."
      actions={
        <Link
          href={roleConfig.primaryAction.href}
          className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          {roleConfig.primaryAction.label}
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <DecisionCard
            eyebrow="Decision Status"
            title={bundle.report.recommendation}
            summary={`الحالة الآن في ${caseWorkflow.currentStateLabel} ويقودها ${caseWorkflow.currentOwnerLabel}.`}
            value={`${bundle.report.finalReadiness}%`}
            badge={
              <StatusPill
                label={bundle.report.recommendation}
                tone={statusTone(bundle.report.status)}
              />
            }
            footer={
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="surface-card-muted px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Decision</div>
                  <div className="mt-2 text-sm font-medium text-white">{bundle.report.recommendation}</div>
                </div>
                <div className="surface-card-muted px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Why now</div>
                  <div className="mt-2 text-sm font-medium text-white">
                    {visibleBlocks.length > 0 ? "بانتظار إغلاق blockers" : "جاهزة للمضي"}
                  </div>
                </div>
                <div className="surface-card-muted px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Portal</div>
                  <div className="mt-2 text-sm font-medium text-white">{roleConfig.label}</div>
                </div>
              </div>
            }
          />

          <ActionCard
            eyebrow="Next Action"
            title={primaryAction.label}
            description={primaryAction.description}
            meta={`المسار الحالي ${caseWorkflow.currentStateLabel}`}
            status={
              <StatusPill
                label={primaryAction.disabled ? "Blocked" : "Ready"}
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
            className="h-full"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {metrics.map((item) => (
            <InfoCard key={item.label} label={item.label} value={item.value} hint={item.hint} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {visibleBlocks.map((block) => (
            <ActionCard
              key={block.id}
              eyebrow="Top Blocker"
              title={block.title}
              description={block.requiredAction}
              meta={block.ownerLabel}
              status={
                <StatusPill
                  label={block.blocker ? "Blocker" : "Review"}
                  tone={block.blocker ? "danger" : "warning"}
                />
              }
            />
          ))}
        </section>
      </div>
    </AppShell>
  );
}
