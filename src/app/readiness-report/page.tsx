"use client";

import { useMemo, useState } from "react";

import { ActionCard } from "@/components/action-card";
import { AppShell } from "@/components/app-shell";
import { DecisionCard } from "@/components/decision-card";
import { FinancialImpactCard } from "@/components/financial-impact-card";
import { ReportActions } from "@/components/report-actions";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
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

  return (
    <AppShell
      pageId="readiness-report"
      title="الموجز التنفيذي للقرار"
      subtitle="موجز سريع القراءة يبرز القرار الحالي، أسبابه، موانعه، وما الذي يغيّره."
      actions={<ReportActions />}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <DecisionCard
          eyebrow="القرار"
          title={bundle.report.recommendation}
          summary={`الحالة في ${caseWorkflow.currentStateLabel} ويقودها ${caseWorkflow.currentOwnerLabel}.`}
          value={`${bundle.report.finalReadiness}%`}
          badge={<StatusPill label={bundle.report.recommendation} tone={statusTone(bundle.report.status)} />}
          className="p-7 sm:p-9"
          footer={
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="surface-card-muted px-4 py-3">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">المرحلة</div>
                <div className="mt-2 text-sm font-medium text-white">{caseWorkflow.currentStateLabel}</div>
              </div>
              <div className="surface-card-muted px-4 py-3">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">الموانع</div>
                <div className="mt-2 text-sm font-medium text-white">{explainability.approvalBlocks.length}</div>
              </div>
              <div className="surface-card-muted px-4 py-3">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">فجوة الحد</div>
                <div className="mt-2 text-sm font-medium text-white">{explainability.threshold.currentGap}%</div>
              </div>
              <div className="surface-card-muted px-4 py-3">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">التكلفة التقديرية</div>
                <div className="mt-2 text-sm font-medium text-white">{formatCurrencyRange(bundle.report.totalCostRangeSar)}</div>
              </div>
            </div>
          }
        />

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
                  label: "الهدر المتجنب",
                  value: formatCurrency(financialImpact.avoidedGhostHiringCost),
                  hint: "هدر تشغيلي يمكن تقليصه",
                  tone: "positive"
                },
                {
                  label: "وفرة المخاطر",
                  value: formatCurrency(financialImpact.estimatedRiskAvoidanceValue),
                  hint: "قيمة متجنبة تقديريًا من القرار",
                  tone: "positive"
                },
                {
                  label: "العائد التقديري",
                  value: `${estimatedDecisionROIBandLabel(financialImpact.estimatedDecisionROIBand)} • ${financialImpact.estimatedDecisionROI}%`,
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

        {!isExecutive ? (
          <SectionCard
            eyebrow="لماذا"
            title="لماذا صدر هذا القرار"
            description="أقوى ما رفع القرار وأقوى ما خفضه."
          >
            <div className="space-y-4">
              {[...positiveDrivers, ...negativeDrivers].map((driver) => (
                <ActionCard
                  key={driver.id}
                  eyebrow={driver.direction === "positive" ? "عامل رافع" : "عامل خافض"}
                  title={driver.title}
                  problem={driver.title}
                  context={driver.summary}
                  impact={`${driver.direction === "positive" ? "+" : "-"}${Math.abs(driver.impact)} نقطة تأثير`}
                  status={
                    <StatusPill
                      label={
                        driver.level === "blocker"
                          ? "مانع"
                          : driver.level === "major"
                            ? "رئيسي"
                            : "ثانوي"
                      }
                      tone={driverTone(driver.level)}
                    />
                  }
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          eyebrow="الموانع"
          title="ما الذي يمنع الاعتماد"
          description="العناصر الأوضح التي تمنع القرار أو تؤخره الآن."
        >
          <div className="space-y-4">
            {blocks.map((block) => (
              <ActionCard
                key={block.id}
                eyebrow="مانع"
                title={block.title}
                problem={block.title}
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
          eyebrow="الإجراءات"
          title="ما الذي يجب أن يحدث الآن"
          description="أهم 3 إجراءات قبل تحريك القرار."
        >
          <div className="space-y-4">
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
        </SectionCard>

        <SectionCard
          eyebrow="السيناريوهات"
          title="إذا تحركنا الآن"
          description="السيناريوهات الأقرب لتغيير القرار من الوضع الحالي."
        >
          <div className="space-y-4">
            {explainability.scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="البيان التنفيذي"
          title="التوصية النهائية"
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

            <div className="mt-5 surface-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-lg font-semibold text-white">{activeRecommendation.title}</div>
                <StatusPill label={activeRecommendation.summary} tone="neutral" />
                <StatusPill label={`ثقة ${bundle.report.confidence}%`} tone="neutral" />
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
            <div className="mt-5 text-xl leading-10 text-white">
              {activeRecommendation.printableText}
            </div>
          </div>
        </SectionCard>

        {isAdmin ? (
          <SectionCard
            eyebrow="الأثر"
            title="أثر الاعتماد"
            description="مسار مختصر لشروط الاعتماد."
          >
            <div className="table-shell">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/[0.03] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-right">المتطلب</th>
                    <th className="px-4 py-3 text-right">الحالة</th>
                    <th className="px-4 py-3 text-right">المالك</th>
                    <th className="px-4 py-3 text-right">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {explainability.approvalRequirements.map((requirement) => (
                    <tr key={requirement.id}>
                      <td className="px-4 py-4 text-white">{requirement.label}</td>
                      <td className="px-4 py-4">
                        <StatusPill
                          label={requirement.passed ? "مستوفى" : "معلّق"}
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
