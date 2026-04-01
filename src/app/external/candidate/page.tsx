"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ExternalField } from "@/components/external/external-field";
import { ExternalFlowCard } from "@/components/external/external-flow-card";
import { ExternalShell } from "@/components/external/external-shell";
import { useExternalIntake } from "@/store/external-intake-context";

const candidateSteps = [
  { id: "start", label: "البدء" },
  { id: "capabilities", label: "القدرات" },
  { id: "evidence", label: "الأدلة" },
  { id: "preferences", label: "التفضيلات" },
  { id: "summary", label: "الملخص" }
] as const;

type CandidateStep = (typeof candidateSteps)[number]["id"];

const stepIndex = (step: CandidateStep) =>
  candidateSteps.findIndex((item) => item.id === step);

const isCandidateStep = (value: string): value is CandidateStep =>
  candidateSteps.some((item) => item.id === value);

export default function ExternalCandidatePage() {
  const { candidate, updateCandidate } = useExternalIntake();
  const [step, setStep] = useState<CandidateStep>("start");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (isCandidateStep(hash)) {
      setStep(hash);
    }
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `#${step}`);
  }, [step]);

  const activeIndex = stepIndex(step);
  const previousStep = activeIndex > 0 ? candidateSteps[activeIndex - 1].id : null;
  const nextStep = activeIndex < candidateSteps.length - 1 ? candidateSteps[activeIndex + 1].id : null;
  const nextStepLabel = nextStep
    ? candidateSteps.find((item) => item.id === nextStep)?.label ?? "المتابعة"
    : "الإرسال";

  const primaryLabel = step === "summary" ? "انتقل إلى الإرسال" : "متابعة";
  const primaryHref = step === "summary" ? "/external/submit" : null;

  const canContinue = useMemo(() => {
    if (step === "start") {
      return candidate.start.fullName.trim().length > 0 && candidate.start.targetRole.trim().length > 0;
    }

    return true;
  }, [candidate.start.fullName, candidate.start.targetRole, step]);

  return (
    <ExternalShell
      flowLabel="تجربة المرشح"
      title="أدخل ما يمكنك تنفيذه فعليًا"
      subtitle="تجربة قصيرة لبناء صورة تشغيلية واضحة قبل ربطك بالحالة."
      steps={candidateSteps.map((item) => item.label)}
      activeStep={activeIndex}
      aside={
        <div className="surface-card-soft p-5">
          <div className="portal-label">ملخص سريع</div>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">حالة الملف</span>
              <span className="text-white">{step === "summary" ? "جاهز للربط" : "قيد الإدخال"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">الخطوة التالية</span>
              <span className="text-white">{nextStepLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">التكييف المقترح</span>
              <span className="text-white">
                {candidate.preferences.supportTools || "بانتظار الإدخال"}
              </span>
            </div>
          </div>
        </div>
      }
    >
      {step === "start" ? (
        <ExternalFlowCard
          title="ابدأ الملف"
          subtitle="حدد بياناتك الأساسية والدور الذي تريد ربطه بالتقييم."
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
              {primaryLabel}
            </button>
          }
        >
          <ExternalField
            label="الاسم أو المعرّف"
            placeholder="أدخل اسمًا مختصرًا أو معرّفًا"
            value={candidate.start.fullName}
            onChange={(event) =>
              updateCandidate("start", { fullName: event.target.value })
            }
          />
          <ExternalField
            label="المدينة"
            placeholder="الرياض"
            value={candidate.start.city}
            onChange={(event) =>
              updateCandidate("start", { city: event.target.value })
            }
          />
          <ExternalField
            label="الدور المستهدف"
            placeholder="دعم إداري / إدخال بيانات"
            value={candidate.start.targetRole}
            onChange={(event) =>
              updateCandidate("start", { targetRole: event.target.value })
            }
          />
        </ExternalFlowCard>
      ) : null}

      {step === "capabilities" ? (
        <ExternalFlowCard
          title="القدرات التشغيلية"
          subtitle="اكتب ما تستطيع تنفيذه فعليًا داخل العمل الرقمي والمكتبي."
          footer={
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => nextStep && setStep(nextStep)}
                className="w-full rounded-[22px] bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                {primaryLabel}
              </button>
              {previousStep ? (
                <button
                  type="button"
                  onClick={() => setStep(previousStep)}
                  className="w-full text-sm text-slate-400 transition hover:text-white"
                >
                  الرجوع للخطوة السابقة
                </button>
              ) : null}
            </div>
          }
        >
          <ExternalField
            as="textarea"
            label="التنقل الرقمي"
            value={candidate.capabilities.digitalNavigation}
            onChange={(event) =>
              updateCandidate("capabilities", { digitalNavigation: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="التواصل الكتابي"
            value={candidate.capabilities.writtenCommunication}
            onChange={(event) =>
              updateCandidate("capabilities", { writtenCommunication: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="التعامل مع الملفات"
            value={candidate.capabilities.documentHandling}
            onChange={(event) =>
              updateCandidate("capabilities", { documentHandling: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="العمل عبر لوحة المفاتيح"
            value={candidate.capabilities.keyboardUse}
            onChange={(event) =>
              updateCandidate("capabilities", { keyboardUse: event.target.value })
            }
          />
        </ExternalFlowCard>
      ) : null}

      {step === "evidence" ? (
        <ExternalFlowCard
          title="الأدلة العملية"
          subtitle="أضف أمثلة قصيرة تساعد الفريق على فهم السياق الفعلي للأداء."
          footer={
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => nextStep && setStep(nextStep)}
                className="w-full rounded-[22px] bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                {primaryLabel}
              </button>
              {previousStep ? (
                <button
                  type="button"
                  onClick={() => setStep(previousStep)}
                  className="w-full text-sm text-slate-400 transition hover:text-white"
                >
                  الرجوع للخطوة السابقة
                </button>
              ) : null}
            </div>
          }
        >
          <ExternalField
            as="textarea"
            label="أمثلة أداء أو خبرة"
            value={candidate.evidence.workSample}
            onChange={(event) =>
              updateCandidate("evidence", { workSample: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="الأدوات التي تستخدمها"
            value={candidate.evidence.toolsUsed}
            onChange={(event) =>
              updateCandidate("evidence", { toolsUsed: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="مؤشرات الدعم أو الثبات"
            value={candidate.evidence.supportEvidence}
            onChange={(event) =>
              updateCandidate("evidence", { supportEvidence: event.target.value })
            }
          />
        </ExternalFlowCard>
      ) : null}

      {step === "preferences" ? (
        <ExternalFlowCard
          title="التفضيلات المناسبة للأداء"
          subtitle="حدد الظروف والأدوات التي تجعل الأداء أكثر استقرارًا ووضوحًا."
          footer={
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => nextStep && setStep(nextStep)}
                className="w-full rounded-[22px] bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                {primaryLabel}
              </button>
              {previousStep ? (
                <button
                  type="button"
                  onClick={() => setStep(previousStep)}
                  className="w-full text-sm text-slate-400 transition hover:text-white"
                >
                  الرجوع للخطوة السابقة
                </button>
              ) : null}
            </div>
          }
        >
          <ExternalField
            as="textarea"
            label="نمط العمل المناسب"
            value={candidate.preferences.workMode}
            onChange={(event) =>
              updateCandidate("preferences", { workMode: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="الأدوات أو التكييفات المفضلة"
            value={candidate.preferences.supportTools}
            onChange={(event) =>
              updateCandidate("preferences", { supportTools: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="ملاحظات الجدولة أو الإيقاع"
            value={candidate.preferences.scheduleNotes}
            onChange={(event) =>
              updateCandidate("preferences", { scheduleNotes: event.target.value })
            }
          />
          <ExternalField
            as="select"
            label="طريقة التواصل المفضلة"
            value={candidate.preferences.contactPreference}
            onChange={(event) =>
              updateCandidate("preferences", { contactPreference: event.target.value })
            }
            options={[
              { label: "التواصل الكتابي أولًا", value: "التواصل الكتابي أولًا" },
              { label: "اجتماعات قصيرة مع ملخص مكتوب", value: "اجتماعات قصيرة مع ملخص مكتوب" },
              { label: "مرن حسب المهمة", value: "مرن حسب المهمة" }
            ]}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "summary" ? (
        <ExternalFlowCard
          title="راجع الملخص"
          subtitle="هذه هي الصورة التي ستنتقل إلى صفحة الربط قبل بدء التقييم."
          footer={
            <div className="space-y-3">
              <Link
                href={primaryHref ?? "#"}
                className="block w-full rounded-[22px] bg-white px-6 py-4 text-center text-base font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                {primaryLabel}
              </Link>
              {previousStep ? (
                <button
                  type="button"
                  onClick={() => setStep(previousStep)}
                  className="w-full text-sm text-slate-400 transition hover:text-white"
                >
                  الرجوع للخطوة السابقة
                </button>
              ) : null}
            </div>
          }
        >
          <div className="space-y-4">
            {[
              { label: "المرشح", value: candidate.start.fullName },
              { label: "الدور", value: candidate.start.targetRole },
              { label: "المدينة", value: candidate.start.city },
              { label: "التنقل الرقمي", value: candidate.capabilities.digitalNavigation },
              { label: "الأدوات", value: candidate.evidence.toolsUsed },
              { label: "التفضيلات", value: candidate.preferences.supportTools }
            ].map((item) => (
              <div key={item.label} className="surface-card-muted px-4 py-4">
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className="mt-2 text-sm leading-7 text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </ExternalFlowCard>
      ) : null}
    </ExternalShell>
  );
}
