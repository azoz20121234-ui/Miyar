"use client";

import { useMemo, useState } from "react";

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
import { formatCurrency, statusTone } from "@/lib/scoring";
import {
  DecisionDriver,
  DecisionRecommendationMode
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

export default function ReadinessReportPage() {
  const { bundle, explainability, financialImpact, evidenceStrength, caseWorkflow } =
    useAssessment();
  const { role } = useRoleSession();
  const [mode, setMode] = useState<DecisionRecommendationMode>("balanced");

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
  const financialSignalPillTone =
    financialImpact.financialSignalTone === "positive"
      ? "success"
      : financialImpact.financialSignalTone === "watch"
        ? "warning"
        : financialImpact.financialSignalTone === "risk"
          ? "danger"
          : "neutral";
  const evidenceTone =
    evidenceStrength.level === "strong"
      ? "success"
      : evidenceStrength.level === "moderate"
        ? "warning"
        : "danger";

  return (
    <AppShell
      pageId="readiness-report"
      title="تقرير القرار التنفيذي"
      subtitle="وثيقة عربية موجزة للعرض على لجنة أو إدارة دون ضوضاء تشغيلية."
      actions={<ReportActions />}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="decision-surface">
          <div className="border-b border-white/8 px-6 py-4 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="portal-label">تقرير القرار التنفيذي</div>
                <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[56px] sm:leading-[1.02]">
                  {bundle.report.recommendation}
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-300">
                  الحالة في {caseWorkflow.currentStateLabel} ويقودها {caseWorkflow.currentOwnerLabel}.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill label={bundle.report.recommendation} tone={statusTone(bundle.report.status)} />
                <StatusPill label={financialImpact.financialSignalLabel} tone={financialSignalPillTone} />
                <StatusPill label={evidenceStrength.defenseLabel} tone={evidenceTone} />
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
                <div className="mt-3 text-xl font-semibold text-white">{evidenceStrength.defenseLabel}</div>
                <div className="mt-2 text-sm text-slate-300">
                  {evidenceStrength.pendingCount > 0
                    ? `${evidenceStrength.pendingCount} عنصرًا ما زال يحتاج استكمالًا أو مراجعة.`
                    : "الحزمة الحالية تبدو متماسكة في حدود الأدلة المتاحة."}
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionCard
          eyebrow="الأسباب"
          title="لماذا القرار؟"
          description="قراءة تنفيذية سريعة تجمع ما يدعم القرار وما يحدّه الآن."
        >
          <div className="space-y-4">
            <AIInsightCard title="المخاطر المتبقية" lines={riskNarrative} tone="amber" />
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
              <div className="portal-label">ما يحدّه الآن</div>
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
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="قوة الأدلة"
          title="قوة الأدلة"
          description="ما الذي ثبت داخل الحالة، وما الذي ما زال يحتاج استكمالًا قبل إغلاق القرار دفاعيًا."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="summary-card px-5 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xl font-semibold text-white">{evidenceStrength.defenseLabel}</div>
                <StatusPill label={`قوة ${evidenceStrength.label}`} tone={evidenceTone} />
              </div>
              <div className="mt-4 text-sm leading-7 text-slate-300">{evidenceStrength.summary}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="decision-stat px-4 py-4">
                  <div className="text-[11px] tracking-[0.16em] text-slate-500">المثبت</div>
                  <div className="mt-2 text-lg font-semibold text-white">{evidenceStrength.verifiedCount}</div>
                </div>
                <div className="decision-stat px-4 py-4">
                  <div className="text-[11px] tracking-[0.16em] text-slate-500">المعلّق</div>
                  <div className="mt-2 text-lg font-semibold text-white">{evidenceStrength.pendingCount}</div>
                </div>
                <div className="decision-stat px-4 py-4">
                  <div className="text-[11px] tracking-[0.16em] text-slate-500">الموانع</div>
                  <div className="mt-2 text-lg font-semibold text-white">{evidenceStrength.blockerCount}</div>
                </div>
              </div>
              <div className="mt-4 text-xs leading-6 text-slate-500">{evidenceStrength.assumptionsNote}</div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="summary-card px-5 py-5">
                <div className="portal-label">ما ثبت</div>
                <div className="mt-4 space-y-3">
                  {evidenceStrength.verifiedItems.length > 0 ? (
                    evidenceStrength.verifiedItems.map((item) => (
                      <div key={item.id} className="surface-card-muted px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white">{item.title}</div>
                          <StatusPill label={item.statusLabel} tone="success" />
                        </div>
                        <div className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</div>
                        <div className="mt-2 text-xs text-slate-500">{item.ownerLabel}</div>
                      </div>
                    ))
                  ) : (
                    <div className="surface-card-muted px-4 py-4 text-sm text-slate-300">
                      لا توجد عناصر مثبتة كافية بعد لرفع قوة الدليل.
                    </div>
                  )}
                </div>
              </div>

              <div className="summary-card px-5 py-5">
                <div className="portal-label">ما زال يحتاج استكمالًا</div>
                <div className="mt-4 space-y-3">
                  {evidenceStrength.pendingItems.length > 0 ? (
                    evidenceStrength.pendingItems.map((item) => (
                      <div key={item.id} className="surface-card-muted px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white">{item.title}</div>
                          <StatusPill label={item.statusLabel} tone={item.blocker ? "danger" : "warning"} />
                        </div>
                        <div className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</div>
                        <div className="mt-2 text-xs text-slate-500">{item.ownerLabel}</div>
                      </div>
                    ))
                  ) : (
                    <div className="surface-card-muted px-4 py-4 text-sm text-slate-300">
                      لا يوجد نقص مباشر في حزمة الأدلة الحالية.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="الأثر المالي"
          title="الأثر المالي للقرار"
          description="تفسير اقتصادي مختصر للقرار الحالي دون تحويل المال إلى محرك قرار بديل."
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
          eyebrow="التوصية"
          title="التوصية التنفيذية"
          description="الصياغة التي يمكن عرضها مباشرة على لجنة أو إدارة، مع إجراءات الإغلاق الأقرب."
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

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
            <div className="decision-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-lg font-semibold text-white">{activeRecommendation.title}</div>
                <StatusPill label={activeRecommendation.summary} tone="neutral" />
                <StatusPill label={financialImpact.financialSignalLabel} tone={financialSignalPillTone} />
                <StatusPill label={evidenceStrength.defenseLabel} tone={evidenceTone} />
              </div>
              <div className="mt-5 text-xl leading-10 text-white">{activeRecommendation.printableText}</div>
              <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-slate-300">
                {bundle.report.whyThisDecision}
              </div>
            </div>

            <div className="space-y-3">
              {explainability.nextActions.slice(0, 3).map((action) => (
                <div key={action.id} className="summary-card px-5 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{action.title}</div>
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
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">{action.requiredAction}</div>
                  <div className="mt-3 text-xs text-slate-500">
                    {action.ownerLabel} • {action.expectedImpact}
                  </div>
                </div>
              ))}
            </div>
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
