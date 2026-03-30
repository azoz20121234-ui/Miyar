"use client";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { bandTone, statusLabel } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

const toneLabelMap = {
  success: "success",
  warning: "warning",
  danger: "danger"
} as const;

export default function MatchingPage() {
  const { bundle } = useAssessment();

  return (
    <AppShell
      title="المطابقة والفجوات"
      subtitle="الصفحة التي تحوّل التحليل والقدرات إلى قرار مفهوم: أين يوجد توافق، أين توجد فجوة، وما حجم الخطورة قبل المضي في التوظيف."
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="ملاءمة المهام"
            value={`${bundle.report.taskFit}%`}
            hint="متوسط قابل للتفسير عبر المهام الأساسية."
            tone="warning"
          />
          <MetricCard
            label="ملاءمة البيئة"
            value={`${bundle.report.environmentFit}%`}
            hint="يتأثر بنضج الوصول ونمط التواصل والإضاءة."
            tone="neutral"
          />
          <MetricCard
            label="قابلية تنفيذ التكييف"
            value={`${bundle.report.accommodationFeasibility}%`}
            hint="هل الخطة قابلة للتطبيق ضمن تكلفة وزمن مناسبين؟"
            tone="neutral"
          />
          <MetricCard
            label="الحكم الحالي"
            value={statusLabel(bundle.report.status)}
            hint="خلاصة محرك القرار قبل خطة الاعتماد النهائية."
            tone="success"
          />
        </section>

        <SectionCard
          eyebrow="Task Fit"
          title="تفصيل ملاءمة كل مهمة"
          description="كل مهمة تُقيّم مقابل القدرات الفعلية، لا مقابل انطباع عام عن المرشح أو الوظيفة."
        >
          <div className="space-y-4">
            {bundle.taskResults.map((task) => {
              const tone = bandTone(task.score);
              return (
                <div key={task.taskId} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{task.gapSummary}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill
                        label={task.fitLevel === "strong" ? "متوافق" : task.fitLevel === "partial" ? "جزئي" : "فجوة"}
                        tone={toneLabelMap[tone]}
                      />
                      <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-lg font-semibold text-white">
                        {task.score}%
                      </div>
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-white/8">
                    <div
                      className={`h-3 rounded-full ${
                        tone === "success"
                          ? "bg-emerald-400"
                          : tone === "warning"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      }`}
                      style={{ width: `${task.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            eyebrow="Barriers"
            title="العوائق التشغيلية المستخرجة"
            description="هذه العوائق هي سبب وجود خطة تكييف. إذا لم تظهر هنا، فالقرار غير مقنع."
          >
            <div className="space-y-4">
              {bundle.barriers.map((barrier) => (
                <div key={barrier.id} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">{barrier.title}</h3>
                    <StatusPill
                      label={barrier.severity === "high" ? "مرتفع" : barrier.severity === "medium" ? "متوسط" : "منخفض"}
                      tone={
                        barrier.severity === "high"
                          ? "danger"
                          : barrier.severity === "medium"
                            ? "warning"
                            : "neutral"
                      }
                    />
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{barrier.summary}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Explainability"
            title="منطق التقييم"
            description="المعادلة واضحة وقابلة للمراجعة ولا تعتمد على ذكاء اصطناعي مبهم."
          >
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-white">Task Fit</div>
                <div className="mt-2">يعتمد على دقة العمل الرقمي + التواصل الكتابي + التركيز + الحمل البصري.</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-white">Environment Fit</div>
                <div className="mt-2">يتأثر بنضج الوصول الرقمي، الإضاءة، ونمط التواصل في البيئة المستهدفة.</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-white">Accommodation Feasibility</div>
                <div className="mt-2">يقيس واقعية الخطة وفق التكلفة، الزمن، وحجم التغيير المطلوب.</div>
              </div>
              <div className="rounded-3xl border border-accent/20 bg-accent/10 p-5">
                <div className="text-white">Final Readiness</div>
                <div className="mt-2">
                  42% ملاءمة المهام + 18% البيئة + 20% التكييف + 20% تغطية المهام الحرجة.
                </div>
              </div>
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
