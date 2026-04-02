"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { FinancialImpactCard } from "@/components/financial-impact-card";
import { ExternalFlowCard } from "@/components/external/external-flow-card";
import { ExternalShell } from "@/components/external/external-shell";
import {
  accommodationLevelLabelMap,
  buildExternalHandoffRecord,
  complexityLabelMap
} from "@/lib/external-handoff";
import {
  buildExternalFinancialPreview,
  retentionImpactLevelLabel
} from "@/lib/financial-model";
import { submitPageMicrocopy } from "@/lib/microcopy";
import { formatCurrency } from "@/lib/scoring";
import { applyExternalHandoff } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";
import { useExternalIntake } from "@/store/external-intake-context";

const steps = ["المرشح", "الوظيفة", "بدء القرار"];

export default function ExternalSubmitPage() {
  const router = useRouter();
  const { setRole } = useRoleSession();
  const { candidate, job, hasCandidateData, hasJobData } = useExternalIntake();
  const handoffPreview = buildExternalHandoffRecord({ candidate, job });
  const financialPreview = buildExternalFinancialPreview({
    candidate: handoffPreview.candidate,
    job: handoffPreview.job,
    expectedAccommodationLevel: handoffPreview.expectedAccommodationLevel
  });
  const canStartAssessment = hasCandidateData && hasJobData;
  const preliminaryBlocker = !hasCandidateData
    ? "ملف المرشح غير مكتمل."
    : !hasJobData
      ? "تعريف الوظيفة غير مكتمل."
      : candidate.evidence.length === 0
        ? "الأدلة ما زالت محدودة، لكن يمكن بدء التقييم التمهيدي."
        : null;

  const handleStartAssessment = () => {
    if (!canStartAssessment) {
      return;
    }

    applyExternalHandoff({ candidate, job });
    setRole("case-initiator");
    router.push("/portal/new-case");
  };

  return (
    <ExternalShell
      flowLabel="الإرسال"
      title={submitPageMicrocopy.title}
      subtitle={submitPageMicrocopy.subtitle}
      steps={steps}
      activeStep={2}
    >
      <ExternalFlowCard
        title={submitPageMicrocopy.cardTitle}
        subtitle={submitPageMicrocopy.cardSubtitle}
        purpose={submitPageMicrocopy.recap}
        impact="سيُستخدم هذا الملخص لتحديد التوافق، والتكييف المطلوب، وقابلية التنفيذ."
        nextStepHint={submitPageMicrocopy.transition}
        footer={
          <div className="space-y-4">
            {!canStartAssessment ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {!hasCandidateData ? (
                  <Link
                    href="/external/candidate"
                    className="block rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-sm font-medium text-white transition hover:bg-white/[0.06]"
                  >
                    {submitPageMicrocopy.completeCandidate}
                  </Link>
                ) : null}
                {!hasJobData ? (
                  <Link
                    href="/external/employer"
                    className="block rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-sm font-medium text-white transition hover:bg-white/[0.06]"
                  >
                    {submitPageMicrocopy.completeJob}
                  </Link>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-[20px] border border-cyan-400/15 bg-cyan-400/10 px-4 py-4 text-sm leading-6 text-cyan-100">
              {submitPageMicrocopy.commitment}
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
              {submitPageMicrocopy.trust}
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
              {submitPageMicrocopy.transition}
            </div>
            <button
              type="button"
              onClick={handleStartAssessment}
              disabled={!canStartAssessment}
              className={`w-full rounded-[22px] px-6 py-4 text-base font-semibold transition ${
                canStartAssessment
                  ? "bg-white text-slate-950 hover:bg-slate-200"
                  : "cursor-not-allowed border border-white/10 bg-white/[0.03] text-slate-500"
              }`}
            >
              {submitPageMicrocopy.cta}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card-muted px-5 py-5">
            <div className="portal-label">المرشح</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">الجاهزية</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {candidate.capabilityScore}%
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200">
                {candidate.evidence.length > 0 ? "مكتمل" : "يحتاج استكمال"}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="text-xs text-slate-500">أبرز القدرات</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(candidate.strengths.length ? candidate.strengths.slice(0, 4) : ["يحتاج استكمال"]).map((item) => (
                    <span
                      key={`strength-${item}`}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">الأدلة المكتملة</div>
                <div className="mt-2 text-sm text-white">
                  {candidate.evidence.length ? `${candidate.evidence.length} أدلة` : "يحتاج استكمال"}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">البيئة المناسبة</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(candidate.preferences.length ? candidate.preferences.slice(0, 3) : ["لم تُحدد بعد"]).map((item) => (
                    <span
                      key={`preference-${item}`}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card-muted px-5 py-5">
            <div className="portal-label">الوظيفة</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">المسمى</div>
                <div className="mt-2 text-2xl font-semibold text-white">{job.title || "يحتاج استكمال"}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200">
                تعقيد {complexityLabelMap[job.complexity]}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="text-xs text-slate-500">المهام الأساسية</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(job.criticalTasks.length ? job.criticalTasks.slice(0, 4) : ["يحتاج استكمال"]).map((item) => (
                    <span
                      key={`critical-${item}`}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">المخاطر الرئيسية</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(job.risks.length ? job.risks.slice(0, 3) : ["لا توجد ملاحظات"]).map((item) => (
                    <span
                      key={`risk-${item}`}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card-muted px-5 py-5">
          <div className="portal-label">ما الذي سينتقل إلى نواة Miyar؟</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="text-xs text-slate-500">ملف المرشح</div>
              <div className="mt-2 text-sm text-white">ملف القدرات + البيئة المناسبة + الأدلة</div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="text-xs text-slate-500">ملخص الوظيفة</div>
              <div className="mt-2 text-sm text-white">المسمى + المهام الأساسية + المخاطر</div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="text-xs text-slate-500">التكييفات المقترحة</div>
              <div className="mt-2 text-sm text-white">
                مستوى متوقع {accommodationLevelLabelMap[handoffPreview.expectedAccommodationLevel]}
              </div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="text-xs text-slate-500">الجاهزية الأولية</div>
              <div className="mt-2 text-sm text-white">{candidate.capabilityScore}% قبل التقييم الداخلي</div>
            </div>
          </div>
        </div>

        <div className="surface-card-muted px-5 py-5">
          <div className="portal-label">عرض تمهيدي</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="text-xs text-slate-500">مستوى التكييف المتوقع</div>
              <div className="mt-2 text-sm font-medium text-white">
                {accommodationLevelLabelMap[handoffPreview.expectedAccommodationLevel]}
              </div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="text-xs text-slate-500">مانع أولي</div>
              <div className="mt-2 text-sm font-medium text-white">
                {preliminaryBlocker ?? "لا يوجد مانع أولي مباشر."}
              </div>
            </div>
          </div>
        </div>

        <FinancialImpactCard
          eyebrow="تقدير مالي أولي"
          title="المؤشر المالي التمهيدي"
          summary={financialPreview.summary}
          signalLabel={financialPreview.financialSignalLabel}
          signalTone={financialPreview.financialSignalTone}
          items={[
            {
              label: "تكلفة التكييف",
              value: formatCurrency(financialPreview.directAccommodationCost),
              hint: "تقدير أولي قبل التقييم الداخلي",
              tone: "neutral"
            },
            {
              label: "تكلفة التأخير",
              value: formatCurrency(financialPreview.delayCost),
              hint: "إذا تأخر إدخال الحالة أو تنفيذ التهيئة",
              tone: financialPreview.financialSignalTone === "risk" ? "risk" : "watch"
            },
            {
              label: "وفرة المخاطر",
              value: formatCurrency(financialPreview.estimatedRiskAvoidanceValue),
              hint: "هدر متجنب مقارنة بقرار غير منضبط",
              tone: "positive"
            },
            {
              label: "أثر الاستمرارية",
              value: retentionImpactLevelLabel(financialPreview.retentionImpactLevel),
              hint: "مؤشر عملي بعد التكييف المتوقع",
              tone:
                financialPreview.retentionImpactLevel === "high"
                  ? "positive"
                  : financialPreview.retentionImpactLevel === "medium"
                    ? "watch"
                    : "risk"
            }
          ]}
          footnote={`هذا تقدير تمهيدي قبل إدخال الحالة إلى نواة Miyar. ${financialPreview.assumptionsNote}`}
        />
      </ExternalFlowCard>
    </ExternalShell>
  );
}
