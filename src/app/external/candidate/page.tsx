"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ExternalField } from "@/components/external/external-field";
import { ExternalFlowCard } from "@/components/external/external-flow-card";
import { ExternalShell } from "@/components/external/external-shell";
import { joinExternalList } from "@/lib/external-handoff";
import { useExternalIntake } from "@/store/external-intake-context";

const candidateSteps = [
  { id: "capabilities", label: "ما الذي يمكنك تنفيذه؟" },
  { id: "environment", label: "ما البيئة الأنسب لنجاحك؟" },
  { id: "evidence", label: "الأدلة المتاحة" },
  { id: "summary", label: "ملخص الجاهزية" }
] as const;

type CandidateStep = (typeof candidateSteps)[number]["id"];

const isCandidateStep = (value: string): value is CandidateStep =>
  candidateSteps.some((item) => item.id === value);

export default function ExternalCandidatePage() {
  const { candidate, setCandidateList } = useExternalIntake();
  const [step, setStep] = useState<CandidateStep>("capabilities");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (isCandidateStep(hash)) {
      setStep(hash);
    }
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `#${step}`);
  }, [step]);

  const activeIndex = candidateSteps.findIndex((item) => item.id === step);
  const nextStep =
    activeIndex < candidateSteps.length - 1 ? candidateSteps[activeIndex + 1].id : null;

  const canContinue = useMemo(() => {
    if (step === "capabilities") {
      return candidate.strengths.length > 0;
    }

    if (step === "environment") {
      return candidate.preferences.length > 0;
    }

    return true;
  }, [candidate.preferences.length, candidate.strengths.length, step]);

  const completionItems = [
    {
      label: "ملف القدرات",
      status: candidate.strengths.length > 0 ? "مكتمل" : "يحتاج استكمال",
      tone:
        candidate.strengths.length > 0
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
          : "border-amber-500/20 bg-amber-500/10 text-amber-100"
    },
    {
      label: "البيئة المناسبة",
      status: candidate.preferences.length > 0 ? "مكتمل" : "يحتاج استكمال",
      tone:
        candidate.preferences.length > 0
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
          : "border-amber-500/20 bg-amber-500/10 text-amber-100"
    },
    {
      label: "الأدلة",
      status: candidate.evidence.length > 0 ? "مكتمل" : "اختياري",
      tone:
        candidate.evidence.length > 0
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
          : "border-white/10 bg-white/[0.04] text-slate-300"
    },
    {
      label: "الخطوة التالية",
      status: "جاهز للتقييم",
      tone: "border-white/10 bg-white/[0.04] text-slate-200"
    }
  ];

  return (
    <ExternalShell
      flowLabel="بوابة المرشح"
      title="ملف القدرات"
      subtitle="أدخل صورة تمهيدية مختصرة تساعد فريق التقييم على فهم القدرات والبيئة المناسبة."
      steps={candidateSteps.map((item) => item.label)}
      activeStep={activeIndex}
    >
      {step === "capabilities" ? (
        <ExternalFlowCard
          title="ما الذي يمكنك تنفيذه؟"
          subtitle="اذكر نقاط القوة الحالية وما يحتاج مراعاة عند التنفيذ."
          footer={
            <button
              type="button"
              onClick={() => nextStep && setStep(nextStep)}
              disabled={!canContinue}
              className={`w-full rounded-[22px] px-6 py-4 text-base font-semibold transition ${
                canContinue
                  ? "bg-white text-slate-950 hover:bg-slate-200"
                  : "cursor-not-allowed border border-white/10 bg-white/[0.03] text-slate-500"
              }`}
            >
              التالي
            </button>
          }
        >
          <ExternalField
            as="textarea"
            label="ما الذي تنفذه بثبات؟"
            hint="سطر واحد لكل نقطة."
            value={joinExternalList(candidate.strengths)}
            onChange={(event) => setCandidateList("strengths", event.target.value)}
          />
          <ExternalField
            as="textarea"
            label="ما الذي يحتاج مراعاة؟"
            hint="سطر واحد لكل نقطة."
            value={joinExternalList(candidate.limitations)}
            onChange={(event) => setCandidateList("limitations", event.target.value)}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "environment" ? (
        <ExternalFlowCard
          title="ما البيئة الأنسب لنجاحك؟"
          subtitle="اذكر الظروف أو التفضيلات التي تساعد على أداء أكثر استقرارًا."
          footer={
            <button
              type="button"
              onClick={() => nextStep && setStep(nextStep)}
              disabled={!canContinue}
              className={`w-full rounded-[22px] px-6 py-4 text-base font-semibold transition ${
                canContinue
                  ? "bg-white text-slate-950 hover:bg-slate-200"
                  : "cursor-not-allowed border border-white/10 bg-white/[0.03] text-slate-500"
              }`}
            >
              التالي
            </button>
          }
        >
          <ExternalField
            as="textarea"
            label="البيئة المناسبة"
            hint="مثال: تواصل كتابي أولًا، بيئة هادئة، واجهات واضحة."
            value={joinExternalList(candidate.preferences)}
            onChange={(event) => setCandidateList("preferences", event.target.value)}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "evidence" ? (
        <ExternalFlowCard
          title="الأدلة المتاحة"
          subtitle="أضف أمثلة أو أدلة مختصرة تدعم ملف القدرات. هذه الخطوة اختيارية."
          footer={
            <button
              type="button"
              onClick={() => nextStep && setStep(nextStep)}
              className="w-full rounded-[22px] bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              التالي
            </button>
          }
        >
          <ExternalField
            as="textarea"
            label="الأدلة أو الأمثلة"
            hint="سطر واحد لكل دليل."
            value={joinExternalList(candidate.evidence)}
            onChange={(event) => setCandidateList("evidence", event.target.value)}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "summary" ? (
        <ExternalFlowCard
          title="ملخص الجاهزية"
          subtitle="هذه هي الصورة التي سنرسلها إلى صفحة الإرسال قبل بدء التقييم."
          footer={
            <Link
              href="/external/submit"
              className="block w-full rounded-[22px] bg-white px-6 py-4 text-center text-base font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              اذهب إلى الإرسال
            </Link>
          }
        >
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5">
            <div className="text-[11px] tracking-[0.16em] text-slate-500">الجاهزية</div>
            <div className="mt-3 text-4xl font-semibold text-white">{candidate.capabilityScore}%</div>
            <div className="mt-2 text-sm text-slate-400">ملف تمهيدي جاهز للمراجعة الأولية.</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {completionItems.map((item) => (
              <div key={item.label} className="surface-card-muted px-4 py-4">
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs ${item.tone}`}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>

          <div className="surface-card-muted px-4 py-4">
            <div className="text-xs text-slate-500">ما الذي سنرسله للتقييم</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[...candidate.strengths.slice(0, 3), ...candidate.preferences.slice(0, 2)].map((item) => (
                <span
                  key={`send-${item}`}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                >
                  {item}
                </span>
              ))}
              {candidate.strengths.length === 0 && candidate.preferences.length === 0 ? (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100">
                  يحتاج استكمال
                </span>
              ) : null}
            </div>
          </div>

          <div className="surface-card-muted px-4 py-4">
            <div className="text-xs text-slate-500">ما هو ناقص</div>
            <div className="mt-2 text-sm leading-6 text-slate-300">
              {candidate.evidence.length > 0
                ? "لا يوجد عنصر عاجل. يمكنك متابعة الإرسال الآن."
                : "يمكن إضافة أدلة لاحقًا. الملف جاهز للتقييم المبدئي."}
            </div>
          </div>
        </ExternalFlowCard>
      ) : null}
    </ExternalShell>
  );
}
