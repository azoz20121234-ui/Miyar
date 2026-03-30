"use client";

import Link from "next/link";

import { AppPageId } from "@/lib/role-model";
import { statusTone } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

import { ActionCard } from "./action-card";
import { AppShell } from "./app-shell";
import { DecisionCard } from "./decision-card";
import { InfoCard } from "./info-card";
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
    status.includes("Approve")
  ) {
    return "success";
  }

  if (
    status.includes("مطلوب") ||
    status.includes("warning") ||
    status.includes("Review") ||
    status.includes("Request") ||
    status.includes("مفتوح")
  ) {
    return "warning";
  }

  if (status.includes("Reject") || status.includes("رفض") || status.includes("blocker")) {
    return "danger";
  }

  return "neutral";
};

const portalVariantLabel = {
  "case-initiator": "Decision Intake",
  assessor: "Assessment Flow",
  "hiring-manager": "Reality Review",
  "compliance-reviewer": "Compliance Decision",
  "executive-viewer": "Executive View",
  "platform-admin": "Platform Control"
} as const;

const RowsTable = ({
  rows,
  sectionLabel
}: {
  rows: RoleHubViewProps["rows"];
  sectionLabel: string;
}) => (
  <SectionCard
    eyebrow={sectionLabel}
    title="Recent Items"
    description="قائمة تشغيلية مختصرة مرتبطة بالبوابة الحالية."
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
          {rows.map((row) => (
            <tr key={`${row.primary}-${row.status}`}>
              <td className="px-4 py-4 text-white">{row.primary}</td>
              <td className="px-4 py-4 text-slate-300">{row.secondary}</td>
              <td className="px-4 py-4">
                <StatusPill label={row.status} tone={toneForStatus(row.status)} />
              </td>
              <td className="px-4 py-4 text-slate-400">{row.owner ?? "-"}</td>
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
  const blockers = explainability.approvalBlocks.slice(0, 2);

  const actionCards = actions.slice(0, 3).map((item, index) => (
    <ActionCard
      key={`${item.title}-${index}`}
      eyebrow={index === 0 ? "Primary Work" : "Action"}
      title={item.title}
      description={item.meta}
      meta={item.status}
      status={item.status ? <StatusPill label={item.status} tone={toneForStatus(item.status)} /> : null}
    />
  ));

  const metricsCards = metrics.slice(0, 3).map((item) => (
    <InfoCard
      key={item.label}
      label={item.label}
      value={item.value}
      hint={item.hint}
    />
  ));

  const decisionSummary = (
    <DecisionCard
      eyebrow={portalLabel}
      title={title}
      summary={subtitle}
      value={`${bundle.report.finalReadiness}%`}
      badge={<StatusPill label={bundle.report.recommendation} tone={statusTone(bundle.report.status)} />}
      footer={
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="surface-card-muted px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Decision</div>
            <div className="mt-2 text-sm font-medium text-white">{bundle.report.recommendation}</div>
          </div>
          <div className="surface-card-muted px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Stage</div>
            <div className="mt-2 text-sm font-medium text-white">{caseWorkflow.currentStateLabel}</div>
          </div>
          <div className="surface-card-muted px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Open blockers</div>
            <div className="mt-2 text-sm font-medium text-white">{explainability.approvalBlocks.length}</div>
          </div>
        </div>
      }
    />
  );

  const blockerRail = (
    <div className="space-y-4">
      {blockers.map((block) => (
        <ActionCard
          key={block.id}
          eyebrow="Decision Blocker"
          title={block.title}
          description={block.requiredAction}
          meta={block.ownerLabel}
          status={<StatusPill label={block.blocker ? "Blocker" : "Review"} tone={block.blocker ? "danger" : "warning"} />}
        />
      ))}
    </div>
  );

  const portalBody = (() => {
    switch (role) {
      case "executive-viewer":
        return (
          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
              {decisionSummary}
              <div className="grid gap-4">{metricsCards}</div>
            </section>
            <section className="grid gap-4 xl:grid-cols-3">{actionCards}</section>
            <RowsTable rows={rows} sectionLabel={sectionLabel} />
          </div>
        );
      case "compliance-reviewer":
        return (
          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              {decisionSummary}
              {blockerRail}
            </section>
            <section className="grid gap-4 xl:grid-cols-3">{metricsCards}</section>
            <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="space-y-4">{actionCards}</div>
              <RowsTable rows={rows} sectionLabel={sectionLabel} />
            </section>
          </div>
        );
      case "platform-admin":
        return (
          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              {decisionSummary}
              <SectionCard
                eyebrow="Control Surface"
                title="Admin snapshot"
                description="مؤشرات سريعة للقوالب والمعايير والحالة الحالية."
              >
                <div className="grid gap-4 sm:grid-cols-3">{metricsCards}</div>
              </SectionCard>
            </section>
            <section className="grid gap-4 xl:grid-cols-3">{actionCards}</section>
            <RowsTable rows={rows} sectionLabel={sectionLabel} />
          </div>
        );
      case "hiring-manager":
        return (
          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
              {decisionSummary}
              <div className="grid gap-4">{actionCards.slice(0, 2)}</div>
            </section>
            <section className="grid gap-4 xl:grid-cols-3">{metricsCards}</section>
            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <RowsTable rows={rows} sectionLabel={sectionLabel} />
              <div className="space-y-4">{actionCards.slice(2)}</div>
            </section>
          </div>
        );
      case "assessor":
        return (
          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              {decisionSummary}
              <div className="grid gap-4">{metricsCards}</div>
            </section>
            <section className="grid gap-4 xl:grid-cols-3">{actionCards}</section>
            <RowsTable rows={rows} sectionLabel={sectionLabel} />
          </div>
        );
      case "case-initiator":
      default:
        return (
          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
              {decisionSummary}
              <div className="grid gap-4">{actionCards.slice(0, 2)}</div>
            </section>
            <section className="grid gap-4 xl:grid-cols-3">{metricsCards}</section>
            <section className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
              <div className="space-y-4">{actionCards.slice(2)}</div>
              <RowsTable rows={rows} sectionLabel={sectionLabel} />
            </section>
          </div>
        );
    }
  })();

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
      {portalBody}
    </AppShell>
  );
};
