"use client";

import Link from "next/link";

import { stripInternalCodePrefix } from "@/lib/display-copy";
import { accommodationLevelLabelMap, complexityLabelMap } from "@/lib/external-handoff";
import { CASE_STATE_META } from "@/lib/case-state";
import { useAssessment } from "@/store/assessment-context";

import { AppShell } from "./app-shell";
import { StatusPill } from "./status-pill";

const trackingToneMap = {
  "تم الاستلام": "success" as const,
  "قيد المراجعة": "warning" as const,
  "يحتاج استكمال": "warning" as const,
  "جاهزة للانتقال": "neutral" as const
};

export const SubmissionStatusView = () => {
  const { caseRecord, caseWorkflow, externalHandoff, bundle, explainability } = useAssessment();
  const stateMeta = CASE_STATE_META[caseRecord.state];
  const trackingState =
    caseRecord.state === "DRAFT"
      ? "تم الاستلام"
      : caseRecord.state === "NEEDS_REVISION"
        ? "يحتاج استكمال"
        : caseRecord.state === "APPROVED" || caseRecord.state === "REJECTED"
          ? "جاهزة للانتقال"
          : "قيد المراجعة";

  const nextHref =
    caseRecord.state === "NEEDS_REVISION"
      ? "/job-analysis"
      : caseRecord.state === "DRAFT"
        ? "/portal/new-case"
        : "/home";

  const nextLabel =
    caseRecord.state === "NEEDS_REVISION"
      ? "أكمل المدخلات"
      : caseRecord.state === "DRAFT"
        ? "راجع الاستلام الداخلي"
        : "اعرض الحالة";

  const missingItems = [
    ...(externalHandoff?.candidate.evidence.length
      ? []
      : [
          {
            title: "الأدلة",
            detail: "يحتاج استكمال قبل رفع الثقة في الملف.",
            status: "يحتاج استكمال"
          }
        ]),
    ...explainability.approvalBlocks.slice(0, 2).map((block) => ({
      title: stripInternalCodePrefix(block.title),
      detail: block.requiredAction,
      status: block.status === "missing-evidence" ? "بانتظار مراجعة" : "بانتظار اعتماد"
    }))
  ].slice(0, 3);

  return (
    <AppShell
      pageId="portal:submission-status"
      title="متابعة الإرسال"
      subtitle="هذه الصفحة تتابع انتقال الحالة قبل اكتمال القرار الداخلي."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="decision-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="portal-label">سطح التتبع</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[42px]">
                {trackingState}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill label={`المرحلة الحالية ${caseWorkflow.currentStateLabel}`} tone="neutral" />
                <StatusPill label={`المالك الحالي ${caseWorkflow.currentOwnerLabel}`} tone="neutral" />
                <StatusPill label={trackingState} tone={trackingToneMap[trackingState]} />
              </div>
            </div>

            <Link
              href={nextHref}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              {nextLabel}
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">حالة الإرسال</div>
              <div className="mt-2 text-lg font-semibold text-white">{trackingState}</div>
              <div className="mt-1 text-xs text-slate-400">{stateMeta.description}</div>
            </div>
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">المرحلة الحالية</div>
              <div className="mt-2 text-lg font-semibold text-white">{caseWorkflow.currentStateLabel}</div>
              <div className="mt-1 text-xs text-slate-400">ضمن نواة Meyar</div>
            </div>
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">المالك الحالي</div>
              <div className="mt-2 text-lg font-semibold text-white">{caseWorkflow.currentOwnerLabel}</div>
              <div className="mt-1 text-xs text-slate-400">الجهة المسؤولة الآن</div>
            </div>
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">المرحلة التالية</div>
              <div className="mt-2 text-lg font-semibold text-white">{caseWorkflow.nextStageLabel}</div>
              <div className="mt-1 text-xs text-slate-400">بعد إغلاق الوضع الحالي</div>
            </div>
          </div>
        </section>

        <section className="surface-card-soft p-6">
          <div className="portal-label">ما الذي تم استلامه؟</div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="summary-card px-5 py-5">
              <div className="text-xs text-slate-500">ملف المرشح</div>
              <div className="mt-2 text-sm font-medium text-white">
                جاهزية {externalHandoff?.candidate.capabilityScore ?? 0}% •{" "}
                {externalHandoff?.candidate.strengths.slice(0, 2).join(" • ") || "لا توجد بيانات"}
              </div>
            </div>
            <div className="summary-card px-5 py-5">
              <div className="text-xs text-slate-500">ملخص الوظيفة</div>
              <div className="mt-2 text-sm font-medium text-white">
                {externalHandoff?.job.title ?? bundle.job.title} • تعقيد{" "}
                {externalHandoff ? complexityLabelMap[externalHandoff.job.complexity] : "متوسط"}
              </div>
            </div>
            <div className="summary-card px-5 py-5">
              <div className="text-xs text-slate-500">الأدلة</div>
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
            <div className="summary-card px-5 py-5">
              <div className="text-xs text-slate-500">التكييفات</div>
              <div className="mt-2 text-sm font-medium text-white">
                {externalHandoff
                  ? `متوقع ${accommodationLevelLabelMap[externalHandoff.expectedAccommodationLevel]}`
                  : "قيد التقدير"}
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card-soft p-6">
          <div className="portal-label">ما الذي ما زال ناقصًا؟</div>
          <div className="mt-2 text-sm leading-7 text-slate-400">
            التتبع هنا يوضح النقص أو الانتظار دون تعقيد أو ضوضاء.
          </div>

          <div className="mt-5 space-y-3">
            {missingItems.length > 0 ? (
              missingItems.map((item) => (
                <div key={item.title} className="summary-card flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</div>
                  </div>
                  <StatusPill
                    label={item.status}
                    tone={item.status === "يحتاج استكمال" ? "warning" : "neutral"}
                  />
                </div>
              ))
            ) : (
              <div className="summary-card px-5 py-4 text-sm text-slate-300">
                لا يوجد نقص مباشر الآن. الحالة تتحرك داخل المسار الحالي.
              </div>
            )}
          </div>
        </section>

        <section className="state-card p-6">
          <div className="portal-label">الخطوة التالية</div>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-2xl font-semibold text-white">{nextLabel}</div>
              <div className="mt-2 text-sm leading-7 text-slate-400">
                المسار الحالي يقوده {caseWorkflow.currentOwnerLabel}، وبعده تنتقل الحالة إلى {caseWorkflow.nextStageLabel}.
              </div>
            </div>
            <Link
              href={nextHref}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              {nextLabel}
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
};
