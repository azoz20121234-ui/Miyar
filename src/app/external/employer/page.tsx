"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ExternalField } from "@/components/external/external-field";
import { ExternalFlowCard } from "@/components/external/external-flow-card";
import { ExternalShell } from "@/components/external/external-shell";
import { complexityLabelMap, joinExternalList } from "@/lib/external-handoff";
import { useExternalIntake } from "@/store/external-intake-context";

const employerSteps = [
  { id: "description", label: "وصف الوظيفة" },
  { id: "critical", label: "المهام الأساسية" },
  { id: "adaptable", label: "المهام القابلة للتعديل" },
  { id: "risks", label: "المتطلبات والمخاطر" }
] as const;

type EmployerStep = (typeof employerSteps)[number]["id"];

const isEmployerStep = (value: string): value is EmployerStep =>
  employerSteps.some((item) => item.id === value);

export default function ExternalEmployerPage() {
  const { job, setJobField, setJobList } = useExternalIntake();
  const [step, setStep] = useState<EmployerStep>("description");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (isEmployerStep(hash)) {
      setStep(hash);
    }
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `#${step}`);
  }, [step]);

  const activeIndex = employerSteps.findIndex((item) => item.id === step);
  const nextStep =
    activeIndex < employerSteps.length - 1 ? employerSteps[activeIndex + 1].id : null;

  const canContinue = useMemo(() => {
    if (step === "description") {
      return job.title.trim().length > 0;
    }

    if (step === "critical") {
      return job.criticalTasks.length > 0;
    }

    return true;
  }, [job.criticalTasks.length, job.title, step]);

  return (
    <ExternalShell
      flowLabel="بوابة جهة العمل"
      title="ملف الوظيفة الخارجي"
      subtitle="خطوات قصيرة لتعريف الوظيفة قبل إرسالها إلى Meyar Core."
      steps={employerSteps.map((item) => item.label)}
      activeStep={activeIndex}
    >
      {step === "description" ? (
        <ExternalFlowCard
          title="وصف الوظيفة"
          subtitle="حدد المسمى ومستوى التعقيد فقط قبل الانتقال إلى المهام."
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
            label="المسمى الوظيفي"
            placeholder="دعم إداري / إدخال بيانات"
            value={job.title}
            onChange={(event) => setJobField("title", event.target.value)}
          />
          <ExternalField
            as="select"
            label="تعقيد الوظيفة"
            value={job.complexity}
            onChange={(event) => setJobField("complexity", event.target.value)}
            options={[
              { label: "منخفض", value: "low" },
              { label: "متوسط", value: "medium" },
              { label: "مرتفع", value: "high" }
            ]}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "critical" ? (
        <ExternalFlowCard
          title="المهام الأساسية"
          subtitle="اكتب المهام التي لا يمكن حذفها من الدور."
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
            label="المهام الأساسية"
            hint="سطر واحد لكل مهمة."
            value={joinExternalList(job.criticalTasks)}
            onChange={(event) => setJobList("criticalTasks", event.target.value)}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "adaptable" ? (
        <ExternalFlowCard
          title="المهام القابلة للتعديل"
          subtitle="اكتب المهام التي يمكن تكييفها أو إعادة توزيعها."
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
            label="المهام القابلة للتعديل"
            hint="سطر واحد لكل مهمة."
            value={joinExternalList(job.adaptableTasks)}
            onChange={(event) => setJobList("adaptableTasks", event.target.value)}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "risks" ? (
        <ExternalFlowCard
          title="المتطلبات والمخاطر"
          subtitle="اكتب النقاط التي تحتاج تهيئة أو مراجعة قبل بدء التقييم."
          footer={
            <Link
              href="/external/submit"
              className="block w-full rounded-[22px] bg-white px-6 py-4 text-center text-base font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              التالي
            </Link>
          }
        >
          <ExternalField
            as="textarea"
            label="المتطلبات والمخاطر"
            hint="سطر واحد لكل نقطة."
            value={joinExternalList(job.risks)}
            onChange={(event) => setJobList("risks", event.target.value)}
          />

          <div className="surface-card-muted px-4 py-4">
            <div className="text-xs text-slate-500">تعقيد الوظيفة</div>
            <div className="mt-2 text-sm text-white">{complexityLabelMap[job.complexity]}</div>
          </div>
        </ExternalFlowCard>
      ) : null}
    </ExternalShell>
  );
}
