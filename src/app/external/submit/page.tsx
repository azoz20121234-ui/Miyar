"use client";

import { useRouter } from "next/navigation";

import { ExternalFlowCard } from "@/components/external/external-flow-card";
import { ExternalShell } from "@/components/external/external-shell";
import {
  accommodationLevelLabelMap,
  buildExternalHandoffRecord,
  complexityLabelMap
} from "@/lib/external-handoff";
import { applyExternalHandoff } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";
import { useExternalIntake } from "@/store/external-intake-context";

const steps = ["المرشح", "الوظيفة", "بدء القرار"];

export default function ExternalSubmitPage() {
  const router = useRouter();
  const { setRole } = useRoleSession();
  const { candidate, job } = useExternalIntake();
  const handoffPreview = buildExternalHandoffRecord({ candidate, job });

  const handleStartAssessment = () => {
    applyExternalHandoff({ candidate, job });
    setRole("case-initiator");
    router.push("/portal/new-case");
  };

  return (
    <ExternalShell
      flowLabel="الإرسال"
      title="ابدأ التقييم"
      subtitle="راجع الصورة المختصرة ثم انقلها إلى Meyar Core."
      steps={steps}
      activeStep={2}
    >
      <ExternalFlowCard
        title="ملخص جاهز للنقل"
        subtitle="هذه الصفحة تعرض ما سيدخل إلى Meyar Core دون كشف أي منطق داخلي."
        footer={
          <button
            type="button"
            onClick={handleStartAssessment}
            className="w-full rounded-[22px] bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            ابدأ التقييم
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-card-muted px-5 py-5">
            <div className="text-xs text-slate-500">جاهزية المرشح</div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {candidate.capabilityScore}%
            </div>
          </div>

          <div className="surface-card-muted px-5 py-5">
            <div className="text-xs text-slate-500">تعقيد الوظيفة</div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {complexityLabelMap[job.complexity]}
            </div>
          </div>

          <div className="surface-card-muted px-5 py-5">
            <div className="text-xs text-slate-500">مستوى التكييف المتوقع</div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {accommodationLevelLabelMap[handoffPreview.expectedAccommodationLevel]}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card-muted px-5 py-5">
            <div className="portal-label">المرشح</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {candidate.strengths.slice(0, 4).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card-muted px-5 py-5">
            <div className="portal-label">الوظيفة</div>
            <div className="mt-3 text-sm text-white">{job.title}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.criticalTasks.slice(0, 4).map((item) => (
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
      </ExternalFlowCard>
    </ExternalShell>
  );
}
