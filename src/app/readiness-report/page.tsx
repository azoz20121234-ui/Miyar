"use client";

import { useMemo, useState } from "react";

import { ActionCard } from "@/components/action-card";
import { AppShell } from "@/components/app-shell";
import { DecisionCard } from "@/components/decision-card";
import { InfoCard } from "@/components/info-card";
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
    title={scenario.title}
    description={scenario.summary}
    meta={`Readiness ${scenario.projectedReadiness}% • Confidence +${scenario.confidenceDelta}%`}
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
  const showFullBlocks = role === "compliance-reviewer" || isAdmin;

  const positiveDrivers = useMemo(() => {
    if (!isManager) return explainability.topPositiveDrivers;
    const filtered = explainability.topPositiveDrivers.filter(roleDriverFilter);
    return filtered.length ? filtered : explainability.topPositiveDrivers.slice(0, 3);
  }, [explainability.topPositiveDrivers, isManager]);

  const negativeDrivers = useMemo(() => {
    if (!isManager) return explainability.topNegativeDrivers;
    const filtered = explainability.topNegativeDrivers.filter(roleDriverFilter);
    return filtered.length ? filtered : explainability.topNegativeDrivers.slice(0, 3);
  }, [explainability.topNegativeDrivers, isManager]);

  const blocks = useMemo(() => {
    if (!isManager) return explainability.approvalBlocks.slice(0, 3);
    const filtered = explainability.approvalBlocks.filter((block) => block.ownerRole === "hiring-manager");
    return (filtered.length ? filtered : explainability.approvalBlocks).slice(0, 3);
  }, [explainability.approvalBlocks, isManager]);

  const activeRecommendation =
    explainability.recommendationModes.find((item) => item.mode === mode) ??
    explainability.recommendationModes[0];

  const leadScenario =
    explainability.scenarios.find((item) => item.closableNow) ??
    [...explainability.scenarios].sort((left, right) => right.projectedReadiness - left.projectedReadiness)[0];

  return (
    <AppShell
      pageId="readiness-report"
      title="Executive Decision Brief"
      subtitle="Brief تنفيذي مضغوط يوضح القرار، سببه، ما يمنع اعتماده، وما الذي يغيّره."
      actions={<ReportActions />}
    >
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <DecisionCard
            eyebrow="Decision"
            title={bundle.report.recommendation}
            summary={`الحالة في ${caseWorkflow.currentStateLabel} ويقودها ${caseWorkflow.currentOwnerLabel}.`}
            value={`${bundle.report.finalReadiness}%`}
            badge={<StatusPill label={bundle.report.recommendation} tone={statusTone(bundle.report.status)} />}
            footer={
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="surface-card-muted px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Why</div>
                  <div className="mt-2 text-sm font-medium text-white">
                    {blocks.length > 0 ? "توجد موانع قابلة للإغلاق" : "لا يوجد مانع مباشر"}
                  </div>
                </div>
                <div className="surface-card-muted px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Blockers</div>
                  <div className="mt-2 text-sm font-medium text-white">{explainability.approvalBlocks.length}</div>
                </div>
                <div className="surface-card-muted px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Confidence</div>
                  <div className="mt-2 text-sm font-medium text-white">{bundle.report.confidence}%</div>
                </div>
              </div>
            }
          />

          <div className="grid gap-4">
            <InfoCard
              label="Current stage"
              value={caseWorkflow.currentStateLabel}
              hint={`Owner ${caseWorkflow.currentOwnerLabel}`}
            />
            <InfoCard
              label="Threshold gap"
              value={`${explainability.threshold.currentGap}%`}
              hint={explainability.threshold.gapSummary}
            />
            <InfoCard
              label="Estimated cost"
              value={formatCurrencyRange(bundle.report.totalCostRangeSar)}
              hint={`${bundle.report.maxImplementationDays} يوم للتنفيذ المتوقع`}
            />
          </div>
        </section>

        {!isExecutive ? (
          <SectionCard
            eyebrow="Why"
            title="Why this decision"
            description="أقوى الأسباب التي رفعت القرار وخفضته."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-4">
                {positiveDrivers.map((driver) => (
                  <ActionCard
                    key={driver.id}
                    eyebrow="Positive driver"
                    title={driver.title}
                    description={driver.summary}
                    meta={`+${Math.abs(driver.impact)} impact`}
                    status={<StatusPill label={driver.level} tone={driverTone(driver.level)} />}
                  />
                ))}
              </div>
              <div className="space-y-4">
                {negativeDrivers.map((driver) => (
                  <ActionCard
                    key={driver.id}
                    eyebrow="Negative driver"
                    title={driver.title}
                    description={driver.summary}
                    meta={`-${Math.abs(driver.impact)} impact`}
                    status={<StatusPill label={driver.level} tone={driverTone(driver.level)} />}
                  />
                ))}
              </div>
            </div>
          </SectionCard>
        ) : null}

        {showFullBlocks || isExecutive ? (
          <SectionCard
            eyebrow="Blockers"
            title="What blocks approval"
            description="العناصر التي تمنع Approved أو تؤخره الآن."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              {blocks.map((block) => (
                <ActionCard
                  key={block.id}
                  eyebrow="Approval block"
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
            </div>
          </SectionCard>
        ) : null}

        {!isExecutive ? (
          <SectionCard
            eyebrow="Actions"
            title="What must happen next"
            description="3 إجراءات فقط قبل تحريك القرار."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              {explainability.nextActions.slice(0, 3).map((action) => (
                <ActionCard
                  key={action.id}
                  eyebrow="Next"
                  title={action.title}
                  description={action.requiredAction}
                  meta={`${action.ownerLabel} • ${action.expectedImpact}`}
                  status={<StatusPill label={action.urgency} tone={action.urgency === "now" ? "danger" : action.urgency === "next" ? "warning" : "neutral"} />}
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          eyebrow="Scenario"
          title="If we act now"
          description="السيناريوهات الأقرب لتحريك القرار من الوضع الحالي."
        >
          <div className="grid gap-4 xl:grid-cols-3">
            {explainability.scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InfoCard
              label="Expected decision"
              value={leadScenario.projectedDecision}
              hint="أفضل سيناريو متاح من الحالة الحالية"
            />
            <InfoCard
              label="Residual risk"
              value={leadScenario.residualRisk}
              hint="بعد تنفيذ السيناريو الأقرب"
              badge={<StatusPill label={leadScenario.residualRisk} tone={riskTone(leadScenario.residualRisk)} />}
            />
            <InfoCard
              label="Decision threshold"
              value={`${explainability.threshold.approvalThreshold}%`}
              hint={`Current ${explainability.threshold.currentReadiness}%`}
            />
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Final Statement"
          title="Final statement"
          description="صياغة تنفيذية جاهزة للعرض أو المحضر."
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

          <div className="mt-5 surface-card-soft p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-lg font-semibold text-white">{activeRecommendation.title}</div>
              <StatusPill label={activeRecommendation.summary} tone="neutral" />
            </div>
            <div className="mt-4 text-lg leading-9 text-white">
              {activeRecommendation.printableText}
            </div>
          </div>
        </SectionCard>

        {isAdmin ? (
          <SectionCard
            eyebrow="Trace"
            title="Approval trace"
            description="عرض مختصر لمسار المتطلبات قبل الاعتماد."
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
