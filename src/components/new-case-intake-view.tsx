"use client";

import Link from "next/link";

import { AIInsightCard } from "@/components/ai-insight-card";
import { generateNextActionReason } from "@/lib/ai-insights";
import { stripInternalCodePrefix } from "@/lib/display-copy";
import { accommodationLevelLabelMap, complexityLabelMap } from "@/lib/external-handoff";
import { coreMicrocopy } from "@/lib/microcopy";
import { useAssessment } from "@/store/assessment-context";

import { AppShell } from "./app-shell";

export const NewCaseIntakeView = () => {
  const { bundle, profile, caseWorkflow, caseRecord, externalHandoff, explainability, financialImpact } =
    useAssessment();
  const topBlocker = explainability.approvalBlocks[0];
  const receivedAccommodations = bundle.plan.items.slice(0, 3);
  const nextActionReason = generateNextActionReason({
    bundle,
    explainability,
    caseWorkflow,
    financialImpact
  });

  return (
    <AppShell
      pageId="portal:new-case"
      title="بوابة الاستلام الداخلي"
      subtitle={coreMicrocopy.newCase.subtitle}
    >
      <div className="mx-auto max-w-[1040px] space-y-8">
        <section className="decision-surface mx-auto max-w-[920px]">
          <div className="decision-surface-inner px-6 py-7 sm:px-8 sm:py-10">
            <div className="executive-stack">
              <div className="portal-label">بوابة الاستلام الداخلي</div>
              <div className="text-sm text-slate-300">
                {externalHandoff?.job.title || `الحالة #${caseRecord.id}`}
              </div>
              <div className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[52px] sm:leading-[1.04]">
                جاهزة للتقييم
              </div>
              <div className="executive-note">{coreMicrocopy.newCase.purpose}</div>
              <div className="text-sm leading-7 text-slate-400">{coreMicrocopy.newCase.next}</div>
              <div className="executive-meta">
                <div className="executive-chip">المرحلة الحالية {caseWorkflow.currentStateLabel}</div>
                <div className="executive-chip">المالك الحالي {caseWorkflow.currentOwnerLabel}</div>
                <div className="executive-chip">المرحلة التالية {caseWorkflow.nextStageLabel}</div>
                {externalHandoff ? <div className="executive-chip">تم الإنشاء من بوابة خارجية</div> : null}
              </div>
            </div>

            <div className="executive-panel-stack mt-10">
              <div className="decision-panel px-6 py-6 text-center">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">الإجراء التالي</div>
                <div className="mt-3 text-sm leading-7 text-slate-300">{nextActionReason}</div>
                <div className="mt-6 flex justify-center">
                  <Link href="/home" className="decision-cta min-w-[220px] px-5 py-3 text-sm font-semibold">
                    ابدأ التقييم
                  </Link>
                </div>
              </div>

              <AIInsightCard
                title="ما الذي سيحدث الآن؟"
                lines={[nextActionReason]}
                className="mx-auto w-full max-w-[760px]"
              />

              <div className="summary-card px-6 py-6">
                <div className="portal-label">القراءة التمهيدية</div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
                    <div>
                      <div className="text-sm font-semibold text-white">الجاهزية الأولية</div>
                      <div className="mt-1 text-sm text-slate-400">قبل التقييم الداخلي الكامل</div>
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {externalHandoff?.candidate.capabilityScore ?? bundle.report.baselineReadiness}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
                    <div>
                      <div className="text-sm font-semibold text-white">الثقة الأولية</div>
                      <div className="mt-1 text-sm text-slate-400">قراءة تمهيدية للملف الحالي</div>
                    </div>
                    <div className="text-2xl font-semibold text-white">{profile.assessmentConfidence}%</div>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">أعلى مانع</div>
                      <div className="mt-2 text-sm leading-7 text-slate-300">
                        {topBlocker?.requiredAction ?? "المسار واضح حتى الآن."}
                      </div>
                    </div>
                    <div className="max-w-[240px] text-left text-lg font-semibold text-white">
                      {stripInternalCodePrefix(topBlocker?.title) || "لا يوجد مانع مباشر"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <details id="received" className="surface-card-soft mx-auto max-w-[920px] p-6">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="portal-label">ما الذي تم استلامه؟</div>
                <div className="mt-2 text-lg font-semibold text-white">افتح الملخص التمهيدي</div>
              </div>
              <div className="text-sm text-slate-300">عرض التفاصيل</div>
            </div>
          </summary>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="summary-card px-5 py-5">
              <div className="text-xs text-slate-500">ملف المرشح</div>
              <div className="mt-3 text-sm font-medium text-white">
                جاهزية {externalHandoff?.candidate.capabilityScore ?? 0}% •{" "}
                {externalHandoff?.candidate.strengths.slice(0, 2).join(" • ") || "لا توجد بيانات"}
              </div>
            </div>

            <div className="summary-card px-5 py-5">
              <div className="text-xs text-slate-500">ملخص الوظيفة</div>
              <div className="mt-3 text-sm font-medium text-white">
                {externalHandoff?.job.title ?? bundle.job.title} • تعقيد{" "}
                {externalHandoff ? complexityLabelMap[externalHandoff.job.complexity] : "متوسط"}
              </div>
            </div>

            <div className="summary-card px-5 py-5">
              <div className="text-xs text-slate-500">التكييفات المقترحة</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {receivedAccommodations.length > 0 ? (
                  receivedAccommodations.map((item) => (
                    <span
                      key={item.accommodationId}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                    >
                      {item.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-300">
                    مستوى متوقع{" "}
                    {externalHandoff ? accommodationLevelLabelMap[externalHandoff.expectedAccommodationLevel] : "متوسط"}
                  </span>
                )}
              </div>
            </div>

            <div className="summary-card px-5 py-5">
              <div className="text-xs text-slate-500">الأدلة المرفقة</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(externalHandoff?.candidate.evidence.length
                  ? externalHandoff.candidate.evidence
                  : ["لا توجد أدلة مرفقة"]).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>
    </AppShell>
  );
};
