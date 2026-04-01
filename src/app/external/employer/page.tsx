"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ExternalField } from "@/components/external/external-field";
import { ExternalFlowCard } from "@/components/external/external-flow-card";
import { ExternalShell } from "@/components/external/external-shell";
import { useExternalIntake } from "@/store/external-intake-context";

const employerSteps = [
  { id: "start", label: "البدء" },
  { id: "job-breakdown", label: "تفكيك الوظيفة" },
  { id: "requirements", label: "المتطلبات" },
  { id: "risks", label: "المخاطر" },
  { id: "accommodations", label: "التكييفات" },
  { id: "summary", label: "الملخص" }
] as const;

type EmployerStep = (typeof employerSteps)[number]["id"];

const stepIndex = (step: EmployerStep) =>
  employerSteps.findIndex((item) => item.id === step);

const isEmployerStep = (value: string): value is EmployerStep =>
  employerSteps.some((item) => item.id === value);

export default function ExternalEmployerPage() {
  const { employer, updateEmployer } = useExternalIntake();
  const [step, setStep] = useState<EmployerStep>("start");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (isEmployerStep(hash)) {
      setStep(hash);
    }
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `#${step}`);
  }, [step]);

  const activeIndex = stepIndex(step);
  const previousStep = activeIndex > 0 ? employerSteps[activeIndex - 1].id : null;
  const nextStep =
    activeIndex < employerSteps.length - 1 ? employerSteps[activeIndex + 1].id : null;
  const nextStepLabel = nextStep
    ? employerSteps.find((item) => item.id === nextStep)?.label ?? "المتابعة"
    : "الإرسال";

  const primaryLabel = step === "summary" ? "انتقل إلى الإرسال" : "متابعة";
  const primaryHref = step === "summary" ? "/external/submit" : null;

  const canContinue = useMemo(() => {
    if (step === "start") {
      return (
        employer.start.companyName.trim().length > 0 &&
        employer.start.roleTitle.trim().length > 0
      );
    }

    return true;
  }, [employer.start.companyName, employer.start.roleTitle, step]);

  return (
    <ExternalShell
      flowLabel="تجربة الجهة"
      title="أدخل الوظيفة كما تعمل فعليًا"
      subtitle="خطوات قصيرة لتجهيز الوظيفة قبل ربطها بالتقييم الداخلي."
      steps={employerSteps.map((item) => item.label)}
      activeStep={activeIndex}
      aside={
        <div className="surface-card-soft p-5">
          <div className="portal-label">ملخص سريع</div>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">حالة الوظيفة</span>
              <span className="text-white">{step === "summary" ? "جاهزة للربط" : "قيد الإدخال"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">الخطوة التالية</span>
              <span className="text-white">{nextStepLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">التكييف المفتوح</span>
              <span className="text-white">
                {employer.accommodations.openAdjustments || "بانتظار الإدخال"}
              </span>
            </div>
          </div>
        </div>
      }
    >
      {step === "start" ? (
        <ExternalFlowCard
          title="ابدأ الحالة"
          subtitle="حدد الجهة والدور الذي تريد تحويله إلى تقييم تشغيلي."
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
            label="اسم الجهة"
            placeholder="شركة أو منشأة"
            value={employer.start.companyName}
            onChange={(event) =>
              updateEmployer("start", { companyName: event.target.value })
            }
          />
          <ExternalField
            label="مسؤول الحالة"
            placeholder="مسؤول التوظيف أو التشغيل"
            value={employer.start.ownerName}
            onChange={(event) => updateEmployer("start", { ownerName: event.target.value })}
          />
          <ExternalField
            label="المسمى الوظيفي"
            placeholder="دعم إداري / إدخال بيانات"
            value={employer.start.roleTitle}
            onChange={(event) => updateEmployer("start", { roleTitle: event.target.value })}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "job-breakdown" ? (
        <ExternalFlowCard
          title="تفكيك الوظيفة"
          subtitle="صف الهدف من الوظيفة والمهام الأساسية والأدوات المستخدمة."
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
            label="غرض الوظيفة"
            value={employer.jobBreakdown.rolePurpose}
            onChange={(event) =>
              updateEmployer("jobBreakdown", { rolePurpose: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="المهام الفعلية"
            value={employer.jobBreakdown.coreTasks}
            onChange={(event) =>
              updateEmployer("jobBreakdown", { coreTasks: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="أدوات العمل"
            value={employer.jobBreakdown.tools}
            onChange={(event) =>
              updateEmployer("jobBreakdown", { tools: event.target.value })
            }
          />
        </ExternalFlowCard>
      ) : null}

      {step === "requirements" ? (
        <ExternalFlowCard
          title="المتطلبات الفعلية"
          subtitle="اكتب ما يجب أن يتحقق فعليًا لإنجاز الدور كما هو."
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
            label="المتطلبات الأساسية"
            value={employer.requirements.mustHave}
            onChange={(event) =>
              updateEmployer("requirements", { mustHave: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="نمط التواصل"
            value={employer.requirements.communicationPattern}
            onChange={(event) =>
              updateEmployer("requirements", {
                communicationPattern: event.target.value
              })
            }
          />
          <ExternalField
            as="textarea"
            label="بيئة العمل"
            value={employer.requirements.workMode}
            onChange={(event) =>
              updateEmployer("requirements", { workMode: event.target.value })
            }
          />
        </ExternalFlowCard>
      ) : null}

      {step === "risks" ? (
        <ExternalFlowCard
          title="المخاطر ونقاط المراجعة"
          subtitle="حدد ما قد يعيق التنفيذ أو يحتاج مراجعة قبل بدء التقييم."
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
            label="المخاطر التشغيلية"
            value={employer.risks.operationalRisks}
            onChange={(event) =>
              updateEmployer("risks", { operationalRisks: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="نقاط يجب مراجعتها"
            value={employer.risks.reviewPoints}
            onChange={(event) =>
              updateEmployer("risks", { reviewPoints: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="الموانع الحالية"
            value={employer.risks.blockers}
            onChange={(event) => updateEmployer("risks", { blockers: event.target.value })}
          />
        </ExternalFlowCard>
      ) : null}

      {step === "accommodations" ? (
        <ExternalFlowCard
          title="التكييفات المفتوحة"
          subtitle="اكتب ما هو متاح الآن وما يمكن قبوله قبل بدء التقييم."
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
            label="الدعم الحالي"
            value={employer.accommodations.currentSupport}
            onChange={(event) =>
              updateEmployer("accommodations", { currentSupport: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="التعديلات المقبولة"
            value={employer.accommodations.openAdjustments}
            onChange={(event) =>
              updateEmployer("accommodations", { openAdjustments: event.target.value })
            }
          />
          <ExternalField
            as="textarea"
            label="ملاحظات التكلفة أو الميزانية"
            value={employer.accommodations.budgetNotes}
            onChange={(event) =>
              updateEmployer("accommodations", { budgetNotes: event.target.value })
            }
          />
        </ExternalFlowCard>
      ) : null}

      {step === "summary" ? (
        <ExternalFlowCard
          title="راجع ملخص الجهة"
          subtitle="هذا هو الإدخال الذي سينتقل إلى صفحة الربط قبل بدء التقييم."
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
              { label: "الجهة", value: employer.start.companyName },
              { label: "المسؤول", value: employer.start.ownerName },
              { label: "الوظيفة", value: employer.start.roleTitle },
              { label: "غرض الوظيفة", value: employer.jobBreakdown.rolePurpose },
              { label: "المتطلبات", value: employer.requirements.mustHave },
              { label: "التكييفات", value: employer.accommodations.openAdjustments }
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
