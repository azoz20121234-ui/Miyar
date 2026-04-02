"use client";

import Link from "next/link";

import { AIInsightCard } from "@/components/ai-insight-card";
import { generateNextActionReason } from "@/lib/ai-insights";
import { stripInternalCodePrefix } from "@/lib/display-copy";
import { accommodationLevelLabelMap, complexityLabelMap } from "@/lib/external-handoff";
import { coreMicrocopy } from "@/lib/microcopy";
import { useAssessment } from "@/store/assessment-context";

import { AppShell } from "./app-shell";
import { StatusPill } from "./status-pill";

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
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="decision-surface">
          <div className="border-b border-white/8 px-6 py-4 sm:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="portal-label">بوابة الاستلام الداخلي</div>
                <div className="mt-2 text-sm text-slate-300">
                  {externalHandoff?.job.title || `الحالة #${caseRecord.id}`}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill label={`المرحلة الحالية ${caseWorkflow.currentStateLabel}`} tone="neutral" />
                <StatusPill label={`المالك الحالي ${caseWorkflow.currentOwnerLabel}`} tone="neutral" />
                {externalHandoff ? (
                  <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    تم الإنشاء من بوابة خارجية
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8 xl:grid-cols-[minmax(0,1.15fr)_320px]">
            <div className="space-y-5">
              <div className="max-w-2xl">
                <div className="portal-label">الحالة</div>
                <div className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[52px] sm:leading-[1.04]">
                  جاهزة للتقييم
                </div>
                <div className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                  {coreMicrocopy.newCase.purpose}
                </div>
                <div className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                  {coreMicrocopy.newCase.next}
                </div>
              </div>

              <AIInsightCard title="ما الذي سيحدث الآن؟" lines={[nextActionReason]} />

              <div className="decision-panel px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">الإجراء التالي</div>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link href="/home" className="decision-cta px-5 py-3 text-sm font-semibold">
                    ابدأ التقييم
                  </Link>
                  <div className="text-sm text-slate-300">المرحلة التالية {caseWorkflow.nextStageLabel}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="decision-panel px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">الجاهزية الأولية</div>
                <div className="mt-3 text-2xl font-semibold text-white">
                  {externalHandoff?.candidate.capabilityScore ?? bundle.report.baselineReadiness}%
                </div>
                <div className="mt-2 text-sm text-slate-300">قبل التقييم الداخلي الكامل</div>
              </div>
              <div className="decision-panel px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">الثقة الأولية</div>
                <div className="mt-3 text-2xl font-semibold text-white">{profile.assessmentConfidence}%</div>
                <div className="mt-2 text-sm text-slate-300">قراءة تمهيدية للملف الحالي</div>
              </div>
              <div className="decision-panel px-5 py-5">
                <div className="text-[11px] tracking-[0.16em] text-slate-500">أعلى مانع</div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {stripInternalCodePrefix(topBlocker?.title) || "لا يوجد مانع مباشر"}
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-300">
                  {topBlocker?.requiredAction ?? "المسار واضح حتى الآن."}
                </div>
              </div>
            </div>
          </div>
        </section>

        <details id="received" className="surface-card-soft p-6">
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
