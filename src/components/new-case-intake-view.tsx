"use client";

import Link from "next/link";

import { stripInternalCodePrefix } from "@/lib/display-copy";
import { accommodationLevelLabelMap, complexityLabelMap } from "@/lib/external-handoff";
import { useAssessment } from "@/store/assessment-context";

import { AppShell } from "./app-shell";
import { StatusPill } from "./status-pill";

export const NewCaseIntakeView = () => {
  const { bundle, profile, caseWorkflow, caseRecord, externalHandoff, explainability } = useAssessment();
  const topBlocker = explainability.approvalBlocks[0];
  const receivedAccommodations = bundle.plan.items.slice(0, 3);

  return (
    <AppShell
      pageId="portal:new-case"
      title="بوابة الاستلام الداخلي"
      subtitle="تم الاستلام. هذه الصفحة تنقل الحالة من الإدخال الخارجي إلى مساحة القرار الداخلية."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="state-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {externalHandoff ? (
                <div className="mb-3 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  تم الإنشاء من بوابة خارجية
                </div>
              ) : null}
              <div className="portal-label">الحالة الحالية</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[42px]">
                {externalHandoff?.job.title || `الحالة #${caseRecord.id}`}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill label={`المرحلة الحالية ${caseWorkflow.currentStateLabel}`} tone="neutral" />
                <StatusPill label={`المالك الحالي ${caseWorkflow.currentOwnerLabel}`} tone="neutral" />
                <StatusPill label={`الحالة #${caseRecord.id}`} tone="neutral" />
              </div>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300">
              جاهزة للدخول إلى نواة Meyar
            </div>
          </div>
        </section>

        <section className="decision-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="portal-label">بطاقة الاستلام</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[44px]">
                جاهزة للتقييم
              </div>
              <div className="mt-3 text-sm leading-7 text-slate-300">
                تم إنشاء الحالة داخليًا ويمكن الآن فتح مساحة القرار دون المرور عبر شاشات إضافية.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/home"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                ابدأ التقييم
              </Link>
              <a
                href="#received"
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-slate-200 transition hover:bg-white/[0.06]"
              >
                مراجعة المدخلات
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">الجاهزية الأولية</div>
              <div className="mt-2 text-xl font-semibold text-white">
                {externalHandoff?.candidate.capabilityScore ?? bundle.report.baselineReadiness}%
              </div>
              <div className="mt-1 text-xs text-slate-400">قبل التقييم الداخلي الكامل</div>
            </div>
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">الثقة الأولية</div>
              <div className="mt-2 text-xl font-semibold text-white">{profile.assessmentConfidence}%</div>
              <div className="mt-1 text-xs text-slate-400">مستوى الثقة في الملف التمهيدي</div>
            </div>
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">أعلى مانع</div>
              <div className="mt-2 text-base font-semibold text-white">
                {stripInternalCodePrefix(topBlocker?.title) || "لا يوجد"}
              </div>
              <div className="mt-1 text-xs text-slate-400">{topBlocker?.ownerLabel ?? "المسار واضح حتى الآن"}</div>
            </div>
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">الإجراء التالي</div>
              <div className="mt-2 text-base font-semibold text-white">ابدأ التقييم</div>
              <div className="mt-1 text-xs text-slate-400">المرحلة التالية {caseWorkflow.nextStageLabel}</div>
            </div>
          </div>
        </section>

        <section id="received" className="surface-card-soft p-6">
          <div className="portal-label">ما الذي تم استلامه؟</div>
          <div className="mt-3 text-2xl font-semibold text-white">ملخص الاستلام الداخلي</div>
          <div className="mt-2 text-sm leading-7 text-slate-400">
            هذه العناصر فقط هي التي دخلت إلى نواة Meyar قبل بدء التقييم.
          </div>

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
                    مستوى متوقع {externalHandoff ? accommodationLevelLabelMap[externalHandoff.expectedAccommodationLevel] : "متوسط"}
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
        </section>
      </div>
    </AppShell>
  );
};
