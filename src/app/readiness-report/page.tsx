"use client";

import { useMemo, useState } from "react";

import { ActionCard } from "@/components/action-card";
import { AppShell } from "@/components/app-shell";
import { DecisionCard } from "@/components/decision-card";
import { ReportActions } from "@/components/report-actions";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { formatCurrencyRange, statusTone } from "@/lib/scoring";
import {
  DecisionDriver,
  DecisionRecommendationMode,
  DecisionShiftScenario
} from "@/models/types";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

const roleDriverFilter = (driver: DecisionDriver) =>
  ["task", "environment", "barrier", "accommodation"].includes(driver.domain);

const driverTone = (level: DecisionDriver["level"]) => {
  if (level === "blocker") return "danger";
  if (level === "major") return "warning";
  return "neutral";
};

const riskTone = (risk: "low" | "medium" | "high") => {
  if (risk === "low") return "success";
  if (risk === "medium") return "warning";
  return "danger";
};

const ScenarioCard = ({ scenario }: { scenario: DecisionShiftScenario }) => (
  <ActionCard
    eyebrow="Scenario"
    title={scenario.projectedDecision}
    problem={scenario.title}
    reason={scenario.summary}
    impact={`Readiness ${scenario.projectedReadiness}% • Confidence +${scenario.confidenceDelta}%`}
    meta={`Residual ${scenario.residualRisk}`}
    status={
      <StatusPill
        label={scenario.closableNow ? "Decision shift" : "Partial shift"}
        tone={scenario.closableNow ? "success" : "warning"}
      />
    }
  />
);

export default function ReadinessReportPage() {
  const { bundle, explainability, caseWorkflow } = useAssessment();
  const { role } = useRoleSession();
  const [mode, setMode] = useState<DecisionRecommendationMode>("balanced");

  const isExecutive = role === "executive-viewer";
  const isManager = role === "hiring-manager";
  const isAdmin = role === "platform-admin";

  const positiveDrivers = useMemo(() => {
    if (!isManager) return explainability.topPositiveDrivers.slice(0, 2);
    const filtered = explainability.topPositiveDrivers.filter(roleDriverFilter);
    return (filtered.length ? filtered : explainability.topPositiveDrivers).slice(0, 2);
  }, [explainability.topPositiveDrivers, isManager]);

  const negativeDrivers = useMemo(() => {
    if (!isManager) return explainability.topNegativeDrivers.slice(0, 2);
    const filtered = explainability.topNegativeDrivers.filter(roleDriverFilter);
    return (filtered.length ? filtered : explainability.topNegativeDrivers).slice(0, 2);
  }, [explainability.topNegativeDrivers, isManager]);

  const blocks = useMemo(() => {
    if (!isManager) return explainability.approvalBlocks.slice(0, 3);
    const filtered = explainability.approvalBlocks.filter((block) => block.ownerRole === "hiring-manager");
    return (filtered.length ? filtered : explainability.approvalBlocks).slice(0, 3);
  }, [explainability.approvalBlocks, isManager]);

  const activeRecommendation =
    explainability.recommendationModes.find((item) => item.mode === mode) ??
    explainability.recommendationModes[0];

  return (
    <AppShell
      pageId="readiness-report"
      title="Executive Decision Brief"
      subtitle="Brief تنفيذي سريع القراءة يبرز القرار الحالي، أسبابِه، موانعه، وخطوات تغييره."
      actions={<ReportActions />}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <DecisionCard
          eyebrow="Decision"
          title={bundle.report.recommendation}
          summary={`الحالة في ${caseWorkflow.currentStateLabel} ويقودها ${caseWorkflow.currentOwnerLabel}.`}
          value={`${bundle.report.finalReadiness}%`}
          badge={<StatusPill label={bundle.report.recommendation} tone={statusTone(bundle.report.status)} />}
          className="p-7 sm:p-9"
          footer={
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="surface-card-muted px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Stage</div>
                <div className="mt-2 text-sm font-medium text-white">{caseWorkflow.currentStateLabel}</div>
              </div>
              <div className="surface-card-muted px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Blockers</div>
                <div className="mt-2 text-sm font-medium text-white">{explainability.approvalBlocks.length}</div>
              </div>
              <div className="surface-card-muted px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Threshold gap</div>
                <div className="mt-2 text-sm font-medium text-white">{explainability.threshold.currentGap}%</div>
              </div>
              <div className="surface-card-muted px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Estimated cost</div>
                <div className="mt-2 text-sm font-medium text-white">{formatCurrencyRange(bundle.report.totalCostRangeSar)}</div>
              </div>
            </div>
          }
        />

        {!isExecutive ? (
          <SectionCard
            eyebrow="Why"
            title="Why this decision"
            description="أقوى ما رفع القرار وأقوى ما خفضه."
          >
            <div className="space-y-4">
              {[...positiveDrivers, ...negativeDrivers].map((driver) => (
                <ActionCard
                  key={driver.id}
                  eyebrow={driver.direction === "positive" ? "Positive" : "Negative"}
                  title={driver.title}
                  problem={driver.title}
                  reason={driver.summary}
                  impact={`${driver.direction === "positive" ? "+" : "-"}${Math.abs(driver.impact)} impact`}
                  status={<StatusPill label={driver.level} tone={driverTone(driver.level)} />}
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          eyebrow="Blockers"
          title="What blocks approval"
          description="العناصر الأوضح التي تمنع القرار أو تؤخره الآن."
        >
          <div className="space-y-4">
            {blocks.map((block) => (
              <ActionCard
                key={block.id}
                eyebrow="Blocker"
                title={block.title}
                problem={block.title}
                reason={block.requiredAction}
                impact={`المسؤول ${block.ownerLabel}`}
                status={
                  <StatusPill
                    label={block.blocker ? "Blocker" : "Review"}
                    tone={block.blocker ? "danger" : "warning"}
                  />
                }
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Actions"
          title="What must happen next"
          description="أهم 3 إجراءات قبل تحريك القرار."
        >
          <div className="space-y-4">
            {explainability.nextActions.slice(0, 3).map((action) => (
              <ActionCard
                key={action.id}
                eyebrow="Action"
                title={action.title}
                problem={action.title}
                reason={action.requiredAction}
                impact={action.expectedImpact}
                meta={action.ownerLabel}
                status={
                  <StatusPill
                    label={action.urgency}
                    tone={
                      action.urgency === "now"
                        ? "danger"
                        : action.urgency === "next"
                          ? "warning"
                          : "neutral"
                    }
                  />
                }
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Scenario"
          title="If we act now"
          description="السيناريوهات الأقرب لتغيير القرار من الوضع الحالي."
        >
          <div className="space-y-4">
            {explainability.scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Final Statement"
          title="Final statement"
          description="صياغة تنفيذية قصيرة قابلة للعرض."
        >
          <div className="flex flex-wrap gap-3">
            {(["conservative", "balanced", "enablement-first"] as DecisionRecommendationMode[]).map(
              (value) => {
                const active = activeRecommendation.mode === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-white bg-white text-slate-950"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    {value}
                  </button>
                );
              }
            )}
          </div>

          <div className="mt-5 surface-card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-lg font-semibold text-white">{activeRecommendation.title}</div>
              <StatusPill label={activeRecommendation.summary} tone="neutral" />
              <StatusPill label={`${bundle.report.confidence}% confidence`} tone="neutral" />
              <StatusPill label={bundle.report.residualRiskLevel} tone={riskTone(bundle.report.residualRiskLevel)} />
            </div>
            <div className="mt-5 text-xl leading-10 text-white">
              {activeRecommendation.printableText}
            </div>
          </div>
        </SectionCard>

        {isAdmin ? (
          <SectionCard
            eyebrow="Trace"
            title="Approval trace"
            description="مسار مختصر لشروط الاعتماد."
          >
            <div className="table-shell">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/[0.03] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-right">Requirement</th>
                    <th className="px-4 py-3 text-right">Status</th>
                    <th className="px-4 py-3 text-right">Owner</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {explainability.approvalRequirements.map((requirement) => (
                    <tr key={requirement.id}>
                      <td className="px-4 py-4 text-white">{requirement.label}</td>
                      <td className="px-4 py-4">
                        <StatusPill
                          label={requirement.passed ? "Passed" : "Blocked"}
                          tone={requirement.passed ? "success" : "danger"}
                        />
                      </td>
                      <td className="px-4 py-4 text-slate-300">{requirement.ownerLabel}</td>
                      <td className="px-4 py-4 text-slate-300">{requirement.requiredAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  );
}
