"use client";

import { useMemo } from "react";

import { AIInsightCard } from "@/components/ai-insight-card";
import { AppShell } from "@/components/app-shell";
import { DecisionLogicBlock } from "@/components/decision-logic-block";
import { ReportActions } from "@/components/report-actions";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import {
  generateDecisionExplanation
} from "@/lib/ai-insights";
import { stripInternalCodePrefix } from "@/lib/display-copy";
import {
  estimatedDecisionROIBandLabel,
  retentionImpactLevelLabel
} from "@/lib/financial-model";
import { coreMicrocopy } from "@/lib/microcopy";
import { formatCurrency } from "@/lib/scoring";
import { DecisionDriver } from "@/models/types";
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
  const { bundle, explainability, financialImpact, evidenceStrength, decisionLogic, caseWorkflow } =
    useAssessment();
  const { role } = useRoleSession();

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
    explainability.recommendationModes.find((item) => item.mode === "balanced") ??
    explainability.recommendationModes[0];
  const decisionExplanation = generateDecisionExplanation({
    bundle,
    explainability,
    caseWorkflow,
    financialImpact
  }).slice(0, 2);
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
  const evidenceLabel =
    evidenceStrength.level === "strong"
      ? "قوي"
      : evidenceStrength.level === "moderate"
        ? "متوسط"
        : "ضعيف";
  const executiveLine =
    bundle.report.status === "fit"
      ? "المضي مناسب ضمن الضوابط الحالية."
      : bundle.report.status === "conditional"
        ? "المضي ممكن بعد تثبيت التهيئة المقترحة."
        : bundle.report.status === "needs-preparation"
          ? "أوقف الاعتماد الآن وراجع متطلبات التهيئة."
          : "أوقف القرار الحالي إلى حين معالجة الفجوات الأساسية.";
  const whyDecisionPoints = [
    ...positiveDrivers.map((driver) => ({
      id: driver.id,
      label: stripInternalCodePrefix(driver.title),
      summary: driver.summary
    })),
    ...negativeDrivers.map((driver) => ({
      id: driver.id,
      label: stripInternalCodePrefix(driver.title),
      summary: driver.summary
    }))
  ].slice(0, 4);
  const nextConditions = explainability.nextActions.slice(0, 2);

  return (
    <AppShell
      pageId="readiness-report"
      title="تقرير القرار التنفيذي"
      subtitle="وثيقة عربية موجزة للعرض على لجنة أو إدارة دون ضوضاء تشغيلية."
      actions={<ReportActions />}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="decision-surface">
          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <div className="max-w-3xl">
              <div className="portal-label">القرار النهائي</div>
              <div className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[58px] sm:leading-[1.02]">
                {bundle.report.recommendation}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="decision-stat px-4 py-4">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">الإشارة المالية</div>
                <div className="mt-2 text-lg font-semibold text-white">{financialImpact.financialSignalLabel}</div>
              </div>
              <div className="decision-stat px-4 py-4">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">قوة الدليل</div>
                <div className="mt-2 text-lg font-semibold text-white">{evidenceLabel}</div>
              </div>
              <div className="decision-stat px-4 py-4">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">التوصية التنفيذية</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {bundle.report.status === "fit"
                    ? "امضِ"
                    : bundle.report.status === "conditional"
                      ? "امضِ بشروط"
                      : bundle.report.status === "needs-preparation"
                        ? "راجع قبل الاعتماد"
                        : "أوقف الآن"}
                </div>
              </div>
            </div>

            <div className="decision-panel px-5 py-5">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">التوصية التنفيذية</div>
              <div className="mt-3 text-lg font-semibold text-white">{executiveLine}</div>
              <div className="mt-2 text-sm text-slate-300">
                {coreMicrocopy.report.summary}
              </div>
            </div>
          </div>
        </section>

        <SectionCard
          eyebrow="الأسباب"
          title="لماذا القرار؟"
          description="قراءة تشغيلية مختصرة تشرح الحكم الحالي دون تفصيل زائد."
        >
          <div className="space-y-3">
            <AIInsightCard title="لماذا هذا القرار؟" lines={decisionExplanation} tone="amber" />
            <div className="grid gap-3 sm:grid-cols-2">
              {whyDecisionPoints.map((item) => (
                <div key={item.id} className="summary-card px-5 py-4">
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="المنطق"
          title="منطق القرار"
          description="قراءة قصيرة تشرح كيف اجتمعت عناصر الحالة لإنتاج الحكم الحالي."
        >
          <DecisionLogicBlock
            title="كيف وصلنا إلى هذا القرار؟"
            upliftTitle="ما الذي يرفع القرار؟"
            summary={decisionLogic}
            variant="report"
          />
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
              <div className="mt-4 text-xs leading-6 text-slate-500">
                {coreMicrocopy.report.evidence} {evidenceStrength.assumptionsNote}
              </div>
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
          description="تقدير مالي أولي يشرح أثر القرار اقتصاديًا فقط."
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="summary-card px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">تكلفة التكييف</div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {formatCurrency(financialImpact.directAccommodationCost)}
                </div>
              </div>
              <div className="summary-card px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">تكلفة القرار الخاطئ</div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {formatCurrency(financialImpact.wrongDecisionCost)}
                </div>
              </div>
              <div className="summary-card px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">وفرة المخاطر</div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {formatCurrency(financialImpact.estimatedRiskAvoidanceValue)}
                </div>
              </div>
              <div className="summary-card px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">العائد التقديري</div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {estimatedDecisionROIBandLabel(financialImpact.estimatedDecisionROIBand)}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  أثر الاستمرارية {retentionImpactLevelLabel(financialImpact.retentionImpactLevel)}
                </div>
              </div>
            </div>

            <div className="summary-card px-5 py-5 text-sm leading-7 text-slate-300">
              {coreMicrocopy.report.financial} {financialImpact.executiveConclusion}
              <div className="mt-3 text-xs leading-6 text-slate-500">{financialImpact.assumptionsNote}</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="التوصية"
          title="التوصية التنفيذية"
          description="الصياغة التي يمكن عرضها مباشرة على لجنة أو إدارة، مع إجراءات الإغلاق الأقرب."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
            <div className="decision-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-lg font-semibold text-white">التوصية المقترحة</div>
                <StatusPill label={financialImpact.financialSignalLabel} tone={financialSignalPillTone} />
                <StatusPill label={evidenceStrength.defenseLabel} tone={evidenceTone} />
              </div>
              <div className="mt-5 text-xl leading-10 text-white">{activeRecommendation.printableText}</div>
              <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-slate-300">
                {coreMicrocopy.report.recommendation} {executiveLine}
              </div>
            </div>

            <div className="space-y-3">
              {nextConditions.map((action) => (
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
