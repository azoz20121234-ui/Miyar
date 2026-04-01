"use client";

import { useRouter } from "next/navigation";

import { ExternalFlowCard } from "@/components/external/external-flow-card";
import { ExternalShell } from "@/components/external/external-shell";
import { useRoleSession } from "@/store/role-session-context";
import { useExternalIntake } from "@/store/external-intake-context";

const steps = ["بيانات المرشح", "بيانات الجهة", "بدء التقييم"];

export default function ExternalSubmitPage() {
  const router = useRouter();
  const { setRole } = useRoleSession();
  const { candidate, employer } = useExternalIntake();

  const handleStartAssessment = () => {
    setRole("case-initiator");
    router.push("/portal/new-case");
  };

  return (
    <ExternalShell
      flowLabel="الربط والإرسال"
      title="اربط الطرفين قبل بدء التقييم"
      subtitle="راجع الطرفين سريعًا ثم حوّل الحالة إلى المسار الداخلي لبدء التقييم."
      steps={steps}
      activeStep={2}
      aside={
        <div className="surface-card-soft p-5">
          <div className="portal-label">جاهزية الربط</div>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">المرشح</span>
              <span className="text-white">{candidate.start.fullName || "غير مكتمل"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">الوظيفة</span>
              <span className="text-white">{employer.start.roleTitle || "غير مكتمل"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">المسار التالي</span>
              <span className="text-white">بدء التقييم الداخلي</span>
            </div>
          </div>
        </div>
      }
    >
      <ExternalFlowCard
        title="مطابقة أولية"
        subtitle="هذه الصفحة لا تصدر قرارًا. هي فقط تربط إدخال المرشح بإدخال الجهة قبل نقل الحالة إلى محرك القرار الداخلي."
        footer={
          <button
            type="button"
            onClick={handleStartAssessment}
            className="w-full rounded-[22px] bg-white px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            بدء التقييم
          </button>
        }
      >
        <div className="space-y-4">
          <section className="surface-card-muted px-5 py-5">
            <div className="portal-label">المرشح</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">الاسم</span>
                <span className="text-white">{candidate.start.fullName}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">الدور المستهدف</span>
                <span className="text-white">{candidate.start.targetRole}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">الأدوات المفضلة</span>
                <span className="text-right text-white">
                  {candidate.preferences.supportTools}
                </span>
              </div>
            </div>
          </section>

          <section className="surface-card-muted px-5 py-5">
            <div className="portal-label">الجهة</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">الجهة</span>
                <span className="text-white">{employer.start.companyName}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">الوظيفة</span>
                <span className="text-white">{employer.start.roleTitle}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">المهام</span>
                <span className="text-right text-white">{employer.jobBreakdown.coreTasks}</span>
              </div>
            </div>
          </section>

          <section className="surface-card-muted px-5 py-5">
            <div className="portal-label">ما سينتقل داخليًا</div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                "بيانات الوظيفة الأساسية",
                "صورة تشغيلية أولية عن قدرات المرشح",
                "المخاطر والتكييفات المفتوحة قبل القرار"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </ExternalFlowCard>
    </ExternalShell>
  );
}
