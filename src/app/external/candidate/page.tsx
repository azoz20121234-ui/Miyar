"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ExternalField } from "@/components/external/external-field";
import { ExternalFlowCard } from "@/components/external/external-flow-card";
import { ExternalShell } from "@/components/external/external-shell";
import { joinExternalList } from "@/lib/external-handoff";
import { useExternalIntake } from "@/store/external-intake-context";

const candidateSteps = [
  { id: "capabilities", label: "ماذا تستطيع أن تفعل؟" },
  { id: "environment", label: "ما البيئة المناسبة لك؟" },
  { id: "evidence", label: "ارفع الأدلة" },
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

  return (
    <ExternalShell
      flowLabel="بوابة المرشح"
      title="ملف المرشح الخارجي"
      subtitle="خطوة واحدة في كل شاشة لبناء صورة تشغيلية أولية قبل بدء القرار."
      steps={candidateSteps.map((item) => item.label)}
      activeStep={activeIndex}
    >
      {step === "capabilities" ? (
        <ExternalFlowCard
          title="ماذا تستطيع أن تفعل؟"
          subtitle="اكتب نقاط القوة الحالية والقيود التي تريد أخذها في الاعتبار."
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
            label="نقاط القوة"
            hint="سطر واحد لكل نقطة."
            value={joinExternalList(candidate.strengths)}
            onChange={(event) => setCandidateList("strengths", event.target.value)}
          />
          <ExternalField
            as="textarea"
            label="القيود الحالية"
            hint="سطر واحد لكل نقطة."
            value={joinExternalList(candidate.limitations)}
            onChange={(event) => setCandidateList("limitations", event.target.value)}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "environment" ? (
        <ExternalFlowCard
          title="ما البيئة المناسبة لك؟"
          subtitle="اكتب التفضيلات أو الظروف التي تجعل الأداء أكثر استقرارًا."
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
            label="البيئة والتفضيلات المناسبة"
            hint="مثال: تواصل كتابي أولًا، بيئة هادئة، واجهات واضحة."
            value={joinExternalList(candidate.preferences)}
            onChange={(event) => setCandidateList("preferences", event.target.value)}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "evidence" ? (
        <ExternalFlowCard
          title="ارفع الأدلة (اختياري)"
          subtitle="أضف أمثلة قصيرة أو أدلة تدعم الصورة التشغيلية."
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
          subtitle="هذه هي الصورة التي ستنتقل إلى صفحة الإرسال قبل بدء التقييم."
          footer={
            <Link
              href="/external/submit"
              className="block w-full rounded-[22px] bg-white px-6 py-4 text-center text-base font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              التالي
            </Link>
          }
        >
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5">
            <div className="text-[11px] tracking-[0.16em] text-slate-500">جاهزية المرشح</div>
            <div className="mt-3 text-4xl font-semibold text-white">{candidate.capabilityScore}%</div>
          </div>

          <div className="space-y-3">
            {[
              { label: "نقاط القوة", items: candidate.strengths },
              { label: "القيود الحالية", items: candidate.limitations },
              { label: "البيئة المناسبة", items: candidate.preferences },
              { label: "الأدلة", items: candidate.evidence.length ? candidate.evidence : ["لا يوجد"] }
            ].map((group) => (
              <div key={group.label} className="surface-card-muted px-4 py-4">
                <div className="text-xs text-slate-500">{group.label}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={`${group.label}-${item}`}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ExternalFlowCard>
      ) : null}
    </ExternalShell>
  );
}
