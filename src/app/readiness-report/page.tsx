"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ReportActions } from "@/components/report-actions";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { formatCurrencyRange, statusLabel, statusTone } from "@/lib/scoring";
import {
  DecisionDriver,
  DecisionNextAction,
  DecisionRecommendationMode
} from "@/models/types";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

const driverTone = (level: DecisionDriver["level"]) => {
  if (level === "blocker") return "danger";
  if (level === "major") return "warning";
  return "neutral";
};

const driverLevelLabel = (level: DecisionDriver["level"]) => {
  if (level === "blocker") return "Blocker";
  if (level === "major") return "Major";
  return "Minor";
};

const urgencyTone = (urgency: DecisionNextAction["urgency"]) => {
  if (urgency === "now") return "danger";
  if (urgency === "next") return "warning";
  return "neutral";
};

const urgencyLabel = (urgency: DecisionNextAction["urgency"]) => {
  if (urgency === "now") return "فوري";
  if (urgency === "next") return "التالي";
  return "مجدول";
};

const riskTone = (risk: "low" | "medium" | "high") => {
  if (risk === "low") return "success";
  if (risk === "medium") return "warning";
  return "danger";
};

const roleDriverFilter = (driver: DecisionDriver) =>
  ["task", "environment", "barrier", "accommodation"].includes(driver.domain);

const roleActionFilter = (action: DecisionNextAction) =>
  action.ownerRole === "hiring-manager" || action.source === "accommodation";

const DriverCard = ({ driver }: { driver: DecisionDriver }) => {
  const impact = Math.abs(driver.impact);

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-white">{driver.title}</div>
          <div className="mt-2 text-sm leading-7 text-slate-300">{driver.summary}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusPill label={driverLevelLabel(driver.level)} tone={driverTone(driver.level)} />
          <div
            className={`text-lg font-semibold ${
              driver.direction === "positive" ? "text-emerald-300" : "text-rose-200"
            }`}
          >
            {driver.direction === "positive" ? "+" : "-"}
            {impact}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-white/8">
          <div
            className={`h-2 rounded-full ${
              driver.direction === "positive"
                ? "bg-gradient-to-r from-emerald-300 to-accent"
                : "bg-gradient-to-r from-rose-300 to-amber-300"
            }`}
            style={{ width: `${Math.min(100, impact * 5.5)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function ReadinessReportPage() {
  const { bundle, explainability, caseRecord, caseWorkflow } = useAssessment();
  const { role } = useRoleSession();
  const [mode, setMode] = useState<DecisionRecommendationMode>("balanced");

  const isExecutive = role === "executive-viewer";
  const isManager = role === "hiring-manager";
  const isCompliance = role === "compliance-reviewer";
  const isAdmin = role === "platform-admin";
  const showFullExplainability = isCompliance || isAdmin;

  const visiblePositiveDrivers = useMemo(() => {
    if (!isManager) return explainability.topPositiveDrivers;

    const filtered = explainability.topPositiveDrivers.filter(roleDriverFilter);
    return filtered.length ? filtered : explainability.topPositiveDrivers.slice(0, 3);
  }, [explainability.topPositiveDrivers, isManager]);

  const visibleNegativeDrivers = useMemo(() => {
    if (!isManager) return explainability.topNegativeDrivers;

    const filtered = explainability.topNegativeDrivers.filter(roleDriverFilter);
    return filtered.length ? filtered : explainability.topNegativeDrivers.slice(0, 3);
  }, [explainability.topNegativeDrivers, isManager]);

  const visibleActions = useMemo(() => {
    if (!isManager) return explainability.nextActions;

    const filtered = explainability.nextActions.filter(roleActionFilter);
    return filtered.length ? filtered : explainability.nextActions.slice(0, 3);
  }, [explainability.nextActions, isManager]);

  const activeRecommendation =
    explainability.recommendationModes.find((item) => item.mode === mode) ??
    explainability.recommendationModes[0];

  const leadScenario =
    explainability.scenarios.find((scenario) => scenario.closableNow) ??
    [...explainability.scenarios].sort(
      (left, right) => right.projectedReadiness - left.projectedReadiness
    )[0];

  return (
    <AppShell
      pageId="readiness-report"
      title="Executive Report v2"
      subtitle="Artifact تنفيذي يوضح لماذا صدر القرار الحالي، ما الذي يمنع الاعتماد، وما الذي يغيّره فعليًا."
      actions={<ReportActions />}
    >
      <div className="space-y-6">
        <SectionCard
          eyebrow="Executive Summary"
          title="ملخص القرار الحالي"
          description="ملخص سريع يوضح وضع الحالة الآن وما الذي يمنع الاعتماد أو يدفعه."
        >
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-white">
                  {statusLabel(bundle.report.status)}
                </h2>
                <StatusPill
                  label={bundle.report.recommendation}
                  tone={statusTone(bundle.report.status)}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  { label: "المرحلة الحالية", value: caseWorkflow.currentStateLabel },
                  { label: "المالك الحالي", value: caseWorkflow.currentOwnerLabel },
                  { label: "Approval readiness", value: `${bundle.report.finalReadiness}%` },
                  { label: "Blockers المفتوحة", value: String(explainability.approvalBlocks.length) },
                  { label: "التكلفة التقديرية", value: formatCurrencyRange(bundle.report.totalCostRangeSar) },
                  { label: "زمن التهيئة", value: `${bundle.report.maxImplementationDays} يوم` }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="text-xs text-slate-500">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Top Blockers
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    ما الذي يوقف الاعتماد الآن؟
                  </div>
                </div>
                <StatusPill
                  label={
                    explainability.approvalBlocks.length > 0
                      ? `${explainability.approvalBlocks.length} مفتوحة`
                      : "لا توجد"
                  }
                  tone={explainability.approvalBlocks.length > 0 ? "danger" : "success"}
                />
              </div>

              <div className="space-y-3">
                {explainability.approvalBlocks.slice(0, 3).map((block) => (
                  <div
                    key={block.id}
                    className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-white">{block.title}</div>
                      <StatusPill
                        label={block.blocker ? "Blocker" : "Review"}
                        tone={block.blocker ? "danger" : "warning"}
                      />
                    </div>
                    <div className="mt-2 text-xs leading-6 text-slate-400">
                      {block.ownerLabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {!isExecutive ? (
          <SectionCard
            eyebrow="Why This Decision"
            title="لماذا صدر هذا القرار؟"
            description="العوامل الثلاثة التي رفعت القرار والعوامل الثلاثة التي خفضته."
          >
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-white">عوامل رفعت القرار</div>
                  <StatusPill label="Positive" tone="success" />
                </div>
                <div className="space-y-4">
                  {visiblePositiveDrivers.map((driver) => (
                    <DriverCard key={driver.id} driver={driver} />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-white">عوامل خفضت القرار</div>
                  <StatusPill label="Negative" tone="danger" />
                </div>
                <div className="space-y-4">
                  {visibleNegativeDrivers.map((driver) => (
                    <DriverCard key={driver.id} driver={driver} />
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {showFullExplainability ? (
          <SectionCard
            eyebrow="What Blocks Approval?"
            title="ما الذي يمنع Approved الآن؟"
            description="الموانع المفتوحة حاليًا مع المالك المطلوب والإجراء اللازم لإغلاقها."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {explainability.approvalBlocks.map((block) => (
                <div
                  key={block.id}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold text-white">{block.title}</div>
                    <StatusPill
                      label={block.status === "missing-evidence" ? "Missing evidence" : "Blocker"}
                      tone={block.status === "missing-evidence" ? "warning" : "danger"}
                    />
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-300">{block.reason}</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="text-xs text-slate-500">المسؤول</div>
                      <div className="mt-1 text-sm font-medium text-white">{block.ownerLabel}</div>
                    </div>
                    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="text-xs text-slate-500">الإجراء المطلوب</div>
                      <div className="mt-1 text-sm font-medium text-white">{block.requiredAction}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {!isExecutive ? (
          <SectionCard
            eyebrow="What Must Happen Next"
            title="ما الذي يجب أن يحدث الآن؟"
            description="3 إجراءات فقط تدفع الحالة نحو الاعتماد أو الإغلاق الواضح."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {visibleActions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-white">{action.title}</div>
                    <StatusPill label={urgencyLabel(action.urgency)} tone={urgencyTone(action.urgency)} />
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-300">{action.requiredAction}</div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>{action.ownerLabel}</span>
                    <span>{action.expectedImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <SectionCard
            eyebrow="Threshold View"
            title="فجوة الاعتماد"
            description="قياس سريع بين الجاهزية الحالية وحد الاعتماد، وهل يمكن إغلاق الفجوة الآن."
          >
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: "Current readiness",
                    value: `${explainability.threshold.currentReadiness}%`
                  },
                  {
                    label: "Approval threshold",
                    value: `${explainability.threshold.approvalThreshold}%`
                  },
                  {
                    label: "Current gap",
                    value: `${explainability.threshold.currentGap}%`
                  }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="text-xs text-slate-500">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">Threshold meter</div>
                  <StatusPill
                    label={explainability.threshold.closableNow ? "قابلة للإغلاق" : "ليست مغلقة"}
                    tone={explainability.threshold.closableNow ? "success" : "warning"}
                  />
                </div>
                <div className="mt-4 h-3 rounded-full bg-white/8">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-accent via-gold to-emerald-300"
                    style={{ width: `${Math.min(100, explainability.threshold.currentReadiness)}%` }}
                  />
                </div>
                <div className="mt-4 text-sm leading-7 text-slate-300">
                  {explainability.threshold.gapSummary}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Decision Shift Scenarios"
            title="ما الذي يغيّر القرار؟"
            description="3 سيناريوهات فقط توضّح كيف قد تنتقل الحالة نحو الاعتماد."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {explainability.scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-white">{scenario.title}</div>
                    <StatusPill
                      label={scenario.closableNow ? "Shifts decision" : "Partial shift"}
                      tone={scenario.closableNow ? "success" : "warning"}
                    />
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-300">{scenario.summary}</div>

                  <div className="mt-4 grid gap-3">
                    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="text-xs text-slate-500">القرار المتوقع</div>
                      <div className="mt-1 text-sm font-medium text-white">{scenario.projectedDecision}</div>
                    </div>
                    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="text-xs text-slate-500">Projected readiness</div>
                      <div className="mt-1 text-sm font-medium text-white">{scenario.projectedReadiness}%</div>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-500">
                        +{scenario.confidenceDelta}% confidence
                      </span>
                      <StatusPill
                        label={`Residual ${scenario.residualRisk}`}
                        tone={riskTone(scenario.residualRisk)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        <SectionCard
          eyebrow="If We Act Now"
          title="إذا تحركنا الآن"
          description="أفضل سيناريو متاح من الحالة الحالية دون تغيير منطق القرار."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs text-slate-500">Readiness after action</div>
              <div className="mt-2 text-3xl font-semibold text-white">
                {leadScenario.projectedReadiness}%
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs text-slate-500">Expected decision state</div>
              <div className="mt-2 text-lg font-semibold text-white">{leadScenario.projectedDecision}</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs text-slate-500">Residual risk</div>
              <div className="mt-2">
                <StatusPill
                  label={leadScenario.residualRisk}
                  tone={riskTone(leadScenario.residualRisk)}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Printable Recommendation"
          title="التوصية التنفيذية القابلة للطباعة"
          description="نفس البيانات، مع 3 أساليب framing مختلفة للعرض على الإدارة."
        >
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              {(["conservative", "balanced", "enablement-first"] as DecisionRecommendationMode[]).map(
                (value) => {
                  const frame = explainability.recommendationModes.find((item) => item.mode === value);
                  const active = frame?.mode === activeRecommendation.mode;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMode(value)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "border-accent/40 bg-accent/15 text-accent"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {frame?.title ?? value}
                    </button>
                  );
                }
              )}
            </div>

            <div className="rounded-[30px] border border-gold/20 bg-gradient-to-br from-gold/12 via-transparent to-transparent p-6">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <div className="text-lg font-semibold text-white">{activeRecommendation.title}</div>
                <StatusPill label={activeRecommendation.summary} tone="neutral" />
              </div>
              <div className="text-lg leading-9 text-white">{activeRecommendation.printableText}</div>
            </div>
          </div>
        </SectionCard>

        {isAdmin ? (
          <SectionCard
            eyebrow="Trace / Debug"
            title="Approval requirements trace"
            description="عرض كامل للشروط التي تحكم انتقال الحالة إلى Approved."
          >
            <div className="overflow-hidden rounded-[24px] border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-right">
                <thead className="bg-white/[0.04]">
                  <tr className="text-xs text-slate-500">
                    <th className="px-4 py-3 font-medium">Requirement</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-white/[0.02]">
                  {explainability.approvalRequirements.map((requirement) => (
                    <tr key={requirement.id} className="align-top text-sm text-slate-200">
                      <td className="px-4 py-4 font-medium text-white">{requirement.label}</td>
                      <td className="px-4 py-4">
                        <StatusPill
                          label={requirement.passed ? "Passed" : "Blocked"}
                          tone={requirement.passed ? "success" : "danger"}
                        />
                      </td>
                      <td className="px-4 py-4">{requirement.ownerLabel}</td>
                      <td className="px-4 py-4 text-slate-300">{requirement.reason}</td>
                      <td className="px-4 py-4 text-slate-300">{requirement.requiredAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ) : null}

        <div className="text-xs text-slate-500">
          Case ID {caseRecord.id} • Updated {new Date(caseRecord.updatedAt).toLocaleDateString("ar-SA")}
        </div>
      </div>
    </AppShell>
  );
}
