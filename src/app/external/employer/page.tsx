"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ExternalField } from "@/components/external/external-field";
import { ExternalFlowCard } from "@/components/external/external-flow-card";
import { ExternalShell } from "@/components/external/external-shell";
import { complexityLabelMap, joinExternalList } from "@/lib/external-handoff";
import { employerFlowMicrocopy } from "@/lib/microcopy";
import { useExternalIntake } from "@/store/external-intake-context";

const employerSteps = [
  { id: "description", label: employerFlowMicrocopy.steps.description.title },
  { id: "critical", label: employerFlowMicrocopy.steps.critical.title },
  { id: "adaptable", label: employerFlowMicrocopy.steps.adaptable.title },
  { id: "risks", label: employerFlowMicrocopy.steps.risks.title },
  { id: "summary", label: employerFlowMicrocopy.steps.summary.title }
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

  const completionItems = [
    {
      label: "المسمى",
      value: job.title || "يحتاج استكمال"
    },
    {
      label: "المهام الأساسية",
      value: job.criticalTasks.length ? `${job.criticalTasks.length} مهام` : "يحتاج استكمال"
    },
    {
      label: "المهام القابلة للتكييف",
      value: job.adaptableTasks.length ? `${job.adaptableTasks.length} مهام` : "لا يوجد"
    },
    {
      label: "التعقيد",
      value: complexityLabelMap[job.complexity]
    }
  ];

  return (
    <ExternalShell
      flowLabel="بوابة جهة العمل"
      title={employerFlowMicrocopy.shell.title}
      subtitle={employerFlowMicrocopy.shell.subtitle}
      steps={employerSteps.map((item) => item.label)}
      activeStep={activeIndex}
    >
      {step === "description" ? (
        <ExternalFlowCard
          title={employerFlowMicrocopy.steps.description.title}
          subtitle={employerFlowMicrocopy.steps.description.subtitle}
          notice={employerFlowMicrocopy.steps.description.valueLine}
          purpose={employerFlowMicrocopy.steps.description.purpose}
          impact={employerFlowMicrocopy.steps.description.impact}
          nextStepHint={employerFlowMicrocopy.steps.description.next}
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
              {employerFlowMicrocopy.steps.description.cta}
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
          title={employerFlowMicrocopy.steps.critical.title}
          subtitle={employerFlowMicrocopy.steps.critical.subtitle}
          notice={employerFlowMicrocopy.steps.critical.valueLine}
          purpose={employerFlowMicrocopy.steps.critical.purpose}
          impact={employerFlowMicrocopy.steps.critical.impact}
          nextStepHint={employerFlowMicrocopy.steps.critical.next}
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
              {employerFlowMicrocopy.steps.critical.cta}
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
          title={employerFlowMicrocopy.steps.adaptable.title}
          subtitle={employerFlowMicrocopy.steps.adaptable.subtitle}
          notice={employerFlowMicrocopy.steps.adaptable.valueLine}
          purpose={employerFlowMicrocopy.steps.adaptable.purpose}
          impact={employerFlowMicrocopy.steps.adaptable.impact}
          nextStepHint={employerFlowMicrocopy.steps.adaptable.next}
          footer={
            <button
              type="button"
              onClick={() => nextStep && setStep(nextStep)}
              className="w-full rounded-[22px] bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              {employerFlowMicrocopy.steps.adaptable.cta}
            </button>
          }
        >
          <ExternalField
            as="textarea"
            label="المهام القابلة للتكييف"
            hint="سطر واحد لكل مهمة."
            value={joinExternalList(job.adaptableTasks)}
            onChange={(event) => setJobList("adaptableTasks", event.target.value)}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "risks" ? (
        <ExternalFlowCard
          title={employerFlowMicrocopy.steps.risks.title}
          subtitle={employerFlowMicrocopy.steps.risks.subtitle}
          notice={employerFlowMicrocopy.steps.risks.valueLine}
          purpose={employerFlowMicrocopy.steps.risks.purpose}
          impact={employerFlowMicrocopy.steps.risks.impact}
          nextStepHint={employerFlowMicrocopy.steps.risks.next}
          footer={
            <button
              type="button"
              onClick={() => nextStep && setStep(nextStep)}
              className="w-full rounded-[22px] bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              {employerFlowMicrocopy.steps.risks.cta}
            </button>
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
            <div className="text-xs text-slate-500">مستوى التعقيد</div>
            <div className="mt-2 text-sm text-white">{complexityLabelMap[job.complexity]}</div>
          </div>
        </ExternalFlowCard>
      ) : null}

      {step === "summary" ? (
        <ExternalFlowCard
          title={employerFlowMicrocopy.steps.summary.title}
          subtitle={employerFlowMicrocopy.steps.summary.subtitle}
          notice={employerFlowMicrocopy.steps.summary.valueLine}
          purpose={employerFlowMicrocopy.steps.summary.purpose}
          impact={employerFlowMicrocopy.steps.summary.impact}
          nextStepHint={employerFlowMicrocopy.steps.summary.next}
          footer={
            <Link
              href="/external/submit"
              className="block w-full rounded-[22px] bg-white px-6 py-4 text-center text-base font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              {employerFlowMicrocopy.steps.summary.cta}
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {completionItems.map((item) => (
              <div key={item.label} className="surface-card-muted px-4 py-4">
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className="mt-2 text-sm font-medium text-white">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="surface-card-muted px-4 py-4">
            <div className="text-xs text-slate-500">المهام الأساسية</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(job.criticalTasks.length ? job.criticalTasks : ["يحتاج استكمال"]).map((item) => (
                <span
                  key={`critical-${item}`}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card-muted px-4 py-4">
            <div className="text-xs text-slate-500">المهام القابلة للتكييف</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(job.adaptableTasks.length ? job.adaptableTasks : ["لا يوجد"]).map((item) => (
                <span
                  key={`adaptable-${item}`}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card-muted px-4 py-4">
            <div className="text-xs text-slate-500">المخاطر الرئيسية</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(job.risks.length ? job.risks : ["لا يوجد"]).map((item) => (
                <span
                  key={`risk-${item}`}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </ExternalFlowCard>
      ) : null}
    </ExternalShell>
  );
}
