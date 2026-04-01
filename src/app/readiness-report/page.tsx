"use client";

import { useMemo, useState } from "react";

import { ActionCard } from "@/components/action-card";
import { AIInsightCard } from "@/components/ai-insight-card";
import { AppShell } from "@/components/app-shell";
import { FinancialImpactCard } from "@/components/financial-impact-card";
import { ReportActions } from "@/components/report-actions";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import {
  generateDecisionExplanation,
  generateRiskNarrative
} from "@/lib/ai-insights";
import { stripInternalCodePrefix } from "@/lib/display-copy";
import {
  estimatedDecisionROIBandLabel,
  retentionImpactLevelLabel
} from "@/lib/financial-model";
import { formatCurrency, formatCurrencyRange, statusTone } from "@/lib/scoring";
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

const riskLabel = (risk: "low" | "medium" | "high") => {
  if (risk === "low") return "منخفضة";
  if (risk === "medium") return "متوسطة";
  return "مرتفعة";
};

const ScenarioCard = ({ scenario }: { scenario: DecisionShiftScenario }) => (
  <ActionCard
    eyebrow="سيناريو"
    title={scenario.projectedDecision}
    problem={scenario.title}
    context={scenario.summary}
    impact={`جاهزية ${scenario.projectedReadiness}% • ثقة +${scenario.confidenceDelta}%`}
    meta={`المخاطر المتبقية ${riskLabel(scenario.residualRisk)}`}
    status={
      <StatusPill
        label={scenario.closableNow ? "تحول القرار" : "تحول جزئي"}
        tone={scenario.closableNow ? "success" : "warning"}
      />
    }
  />
);

export default function ReadinessReportPage() {
  const { bundle, explainability, financialImpact, caseWorkflow } = useAssessment();
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
  const decisionExplanation = generateDecisionExplanation({
    bundle,
    explainability,
    caseWorkflow,
    financialImpact
  });
  const riskNarrative = generateRiskNarrative({
    bundle,
    explainability,
    caseWorkflow,
    financialImpact
  });
  const evidencePendingCount = explainability.approvalBlocks.filter(
    (block) => block.status === "missing-evidence"
  ).length;
  const evidenceStrengthLabel =
    evidencePendingCount > 0 ? "يحتاج استكمال" : "قيد البناء";
  const financialSignalPillTone =
    financialImpact.financialSignalTone === "positive"
      ? "success"
      : financialImpact.financialSignalTone === "watch"
        ? "warning"
        : financialImpact.financialSignalTone === "risk"
          ? "danger"
          : "neutral";

  return (
    <AppShell
      pageId="readiness-report"
      title="الموجز التنفيذي للقرار"
      subtitle="موجز سريع القراءة يبرز القرار الحالي، أسبابه، موانعه، وما الذي يغيّره."
      actions={<ReportActions />}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="decision-surface">
          <div className="border-b border-white/8 px-6 py-4 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="portal-label">الموجز التنفيذي</div>
                <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[56px] sm:leading-[1.02]">
                  {bundle.report.recommendation}
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-300">
                  الحالة في {caseWorkflow.currentStateLabel} ويقودها {caseWorkflow.currentOwnerLabel}.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill label={bundle.report.recommendation} tone={statusTone(bundle.report.status)} />
                <StatusPill label={`جاهزية ${bundle.report.finalReadiness}%`} tone="neutral" />
                <StatusPill
                  label={
                    bundle.report.residualRiskLevel === "low"
                      ? "مخاطر منخفضة"
                      : bundle.report.residualRiskLevel === "medium"
                        ? "مخاطر متوسطة"
                        : "مخاطر مرتفعة"
                  }
                  tone={riskTone(bundle.report.residualRiskLevel)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8 xl:grid-cols-[minmax(0,1.12fr)_320px]">
            <div className="space-y-4">
              <AIInsightCard title="لماذا القرار؟" lines={decisionExplanation} />
            </div>

            <div className="space-y-3">
              <div className="decision-panel px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">الإشارة المالية</div>
                <div className="mt-3 text-xl font-semibold text-white">{financialImpact.financialSignalLabel}</div>
                <div className="mt-2 text-sm text-slate-300">تفسير اقتصادي للقرار الحالي فقط.</div>
              </div>
              <div className="decision-panel px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">قوة الدليل</div>
                <div className="mt-3 text-xl font-semibold text-white">{evidenceStrengthLabel}</div>
                <div className="mt-2 text-sm text-slate-300">
                  {evidencePendingCount > 0
                    ? `${evidencePendingCount} عنصر يحتاج استكمالًا قبل الاكتمال.`
                    : "طبقة قوة الدليل ما زالت في وضع تمهيدي."}
                </div>
              </div>
              <div className="decision-panel px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">التكلفة التقديرية</div>
                <div className="mt-3 text-xl font-semibold text-white">
                  {formatCurrencyRange(bundle.report.totalCostRangeSar)}
                </div>
                <div className="mt-2 text-sm text-slate-300">
                  نطاق تنفيذي مختصر قبل اعتماد التنفيذ.
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionCard
          eyebrow="الأسباب"
          title="لماذا القرار؟"
          description="أكثر ما يدعم القرار وما يحدّه الآن."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="summary-card px-5 py-5">
              <div className="portal-label">يدعم القرار</div>
              <div className="mt-4 space-y-3">
                {positiveDrivers.map((driver) => (
                  <div key={driver.id} className="surface-card-muted px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">{stripInternalCodePrefix(driver.title)}</div>
                      <StatusPill label={`+${Math.abs(driver.impact)}`} tone="success" />
                    </div>
                    <div className="mt-2 text-sm leading-7 text-slate-300">{driver.summary}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-card px-5 py-5">
              <div className="portal-label">يخفض الجاهزية</div>
              <div className="mt-4 space-y-3">
                {negativeDrivers.map((driver) => (
                  <div key={driver.id} className="surface-card-muted px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">{stripInternalCodePrefix(driver.title)}</div>
                      <StatusPill
                        label={driver.level === "blocker" ? "مانع" : `-${Math.abs(driver.impact)}`}
                        tone={driverTone(driver.level)}
                      />
                    </div>
                    <div className="mt-2 text-sm leading-7 text-slate-300">{driver.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="الأثر المالي"
          title="الأثر المالي للقرار"
          description="قراءة تنفيذية مختصرة توضح تكلفة التنفيذ مقابل كلفة التأخير أو القرار الخاطئ."
        >
          <div className="space-y-4">
            <FinancialImpactCard
              title="ملخص مالي تنفيذي"
              summary={financialImpact.summary}
              signalLabel={financialImpact.financialSignalLabel}
              signalTone={financialImpact.financialSignalTone}
              items={[
                {
                  label: "تكلفة التكييف",
                  value: formatCurrency(financialImpact.directAccommodationCost),
                  hint: "الكلفة المباشرة الحالية للتنفيذ",
                  tone: "neutral"
                },
                {
                  label: "تكلفة التأخير",
                  value: formatCurrency(financialImpact.delayCost),
                  hint: `${financialImpact.estimatedDelayDays} أيام تأخير تقديرية`,
                  tone: "watch"
                },
                {
                  label: "تكلفة القرار الخاطئ",
                  value: formatCurrency(financialImpact.wrongDecisionCost),
                  hint: "رفض أو تعيين غير منضبط",
                  tone: "risk"
                },
                {
                  label: "وفرة المخاطر",
                  value: formatCurrency(financialImpact.estimatedRiskAvoidanceValue),
                  hint: "قيمة متجنبة تقديريًا من القرار",
                  tone: "positive"
                },
                {
                  label: "العائد التقديري",
                  value: estimatedDecisionROIBandLabel(financialImpact.estimatedDecisionROIBand),
                  hint: `أثر الاستمرارية ${retentionImpactLevelLabel(financialImpact.retentionImpactLevel)}`,
                  tone:
                    financialImpact.estimatedDecisionROIBand === "high"
                      ? "positive"
                      : financialImpact.estimatedDecisionROIBand === "medium"
                        ? "watch"
                        : "risk"
                }
              ]}
              conclusion={financialImpact.executiveConclusion}
              footnote={financialImpact.assumptionsNote}
            />

            <div className="grid gap-3 lg:grid-cols-3">
              <div className="summary-card px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">إذا تم التنفيذ</div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {formatCurrency(financialImpact.directAccommodationCost)}
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-300">
                  {financialImpact.executionScenario}
                </div>
              </div>
              <div className="summary-card px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">إذا تأخر القرار</div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {formatCurrency(financialImpact.delayCost)}
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-300">
                  {financialImpact.delayScenario}
                </div>
              </div>
              <div className="summary-card px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">إذا كان القرار خاطئًا</div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {formatCurrency(financialImpact.wrongDecisionCost)}
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-300">
                  {financialImpact.wrongDecisionScenario}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="الموانع"
          title="المخاطر"
          description="الموانع والمخاطر التي تحتاج متابعة قبل الاعتماد."
        >
          <div className="space-y-4">
            <AIInsightCard title="قراءة المخاطر" lines={riskNarrative} tone="amber" />
            {blocks.map((block) => (
              <ActionCard
                key={block.id}
                eyebrow="مانع"
                title={stripInternalCodePrefix(block.title)}
                problem={stripInternalCodePrefix(block.title)}
                context={block.requiredAction}
                impact={`المسؤول ${block.ownerLabel}`}
                status={
                  <StatusPill
                    label={block.blocker ? "مانع" : "مراجعة"}
                    tone={block.blocker ? "danger" : "warning"}
                  />
                }
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="التوصية"
          title="التوصية النهائية"
          description="صياغة تنفيذية قصيرة، مع الإجراءات والسيناريوهات الأقرب."
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
                    {value === "conservative"
                      ? "محافظ"
                      : value === "balanced"
                        ? "متوازن"
                        : "تمكيني"}
                  </button>
                );
              }
            )}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
            <div className="decision-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-lg font-semibold text-white">{activeRecommendation.title}</div>
                <StatusPill label={activeRecommendation.summary} tone="neutral" />
                <StatusPill label={`ثقة ${bundle.report.confidence}%`} tone="neutral" />
                <StatusPill label={financialImpact.financialSignalLabel} tone={financialSignalPillTone} />
              </div>
              <div className="mt-5 text-xl leading-10 text-white">{activeRecommendation.printableText}</div>
            </div>

            <div className="space-y-3">
              {explainability.nextActions.slice(0, 3).map((action) => (
                <ActionCard
                  key={action.id}
                  eyebrow="إجراء"
                  title={action.title}
                  problem={action.title}
                  context={action.requiredAction}
                  impact={action.expectedImpact}
                  meta={action.ownerLabel}
                  status={
                    <StatusPill
                      label={
                        action.urgency === "now"
                          ? "فوري"
                          : action.urgency === "next"
                            ? "التالي"
                            : "مخطط"
                      }
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
          </div>

          <div className="mt-5 space-y-4">
            {explainability.scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>

          {isAdmin ? (
            <div className="mt-5 space-y-3">
              {explainability.approvalRequirements.slice(0, 4).map((requirement) => (
                <div key={requirement.id} className="summary-card px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{requirement.label}</div>
                    <StatusPill
                      label={requirement.passed ? "مستوفى" : "معلّق"}
                      tone={requirement.passed ? "success" : "danger"}
                    />
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">{requirement.requiredAction}</div>
                  <div className="mt-2 text-xs text-slate-500">{requirement.ownerLabel}</div>
                </div>
              ))}
            </div>
          ) : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
