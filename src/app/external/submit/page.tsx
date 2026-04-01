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
      title="جاهز للتقييم"
      subtitle="راجع الملخص التمهيدي ثم ابدأ التقييم داخل نواة Meyar."
      steps={steps}
      activeStep={2}
    >
      <ExternalFlowCard
        title="كل شيء جاهز قبل بدء القرار"
        subtitle="هذه الصفحة تعرض الملخص الذي سينتقل إلى فريق التقييم."
        footer={
          <div className="space-y-4">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
              لن تظهر تفاصيلك الداخلية للعامة. سيتم إرسال ملخص تمهيدي فقط إلى فريق التقييم.
            </div>
            <button
              type="button"
              onClick={handleStartAssessment}
              className="w-full rounded-[22px] bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              ابدأ التقييم
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
          <div className="portal-label">ما الذي سينتقل إلى نواة Meyar؟</div>
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
      </ExternalFlowCard>
    </ExternalShell>
  );
}
