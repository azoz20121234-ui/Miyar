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
      pageId="matching"
      title="المطابقة والفجوات"
      subtitle="الصفحة التي تحوّل تحليل الدور والقدرات إلى قرار مفهوم: أين يوجد توافق، أين ظهرت الفجوة، ولماذا خرج الحكم بهذا الشكل."
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="ملاءمة المهام"
            value={`${bundle.report.taskFit}%`}
            hint="متوسط موزون على أساس أهمية المهمة وتكرارها وكثافتها."
            tone="warning"
          />
          <MetricCard
            label="ملاءمة البيئة"
            value={`${bundle.report.environmentFit}%`}
            hint="يتأثر بنضج الوصول وصيغة الملفات ونمط التواصل."
            tone="neutral"
          />
          <MetricCard
            label="الثقة"
            value={`${bundle.report.confidence}%`}
            hint="ثقة القرار ترتفع كلما كانت بيانات الدور والعوائق أوضح."
            tone="neutral"
          />
          <MetricCard
            label="الحكم الحالي"
            value={statusLabel(bundle.report.status)}
            hint="خلاصة محرك القرار قبل الانتقال لخطة التكييف."
            tone="success"
          />
        </section>

        <SectionCard
          eyebrow="Task Fit"
          title="تفصيل ملاءمة كل مهمة"
          description="كل مهمة تُقيّم مقابل القدرات الفعلية والبيئة الحالية، ثم تُحوّل إلى تفسير عربي واضح."
        >
          <div className="space-y-4">
            {bundle.taskResults.map((task) => {
              const tone = bandTone(task.score);
              return (
                <div key={task.taskId} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-[#091120] px-3 py-1 text-xs text-slate-300">
                          {task.taskTier === "essential" ? "أساسية" : "ثانوية"}
                        </span>
                        <span className="rounded-full border border-white/10 bg-[#091120] px-3 py-1 text-xs text-slate-300">
                          مساهمة {task.contributionWeight}
                        </span>
                        <span className="rounded-full border border-white/10 bg-[#091120] px-3 py-1 text-xs text-slate-300">
                          يقين {task.certainty}%
                        </span>
                      </div>
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

                  <div className="mb-4 h-3 rounded-full bg-white/8">
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

                  <div className="grid gap-3 lg:grid-cols-2">
                    {task.reasons.map((reason) => (
                      <div key={reason} className="rounded-2xl border border-white/8 bg-[#091120] px-4 py-3 text-sm leading-7 text-slate-200">
                        {reason}
                      </div>
                    ))}
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
            description="هذه العوائق ليست افتراضات عامة عن الإعاقة، بل نتائج مباشرة من المهام والبيئة والأدوات."
          >
            <div className="space-y-4">
              {bundle.barriers.map((barrier) => (
                <div key={barrier.id} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{barrier.title}</h3>
                      <div className="mt-1 text-xs text-slate-500">ثقة الاكتشاف {barrier.confidence}%</div>
                    </div>
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
                  <div className="mt-4 rounded-3xl border border-accent/20 bg-accent/10 p-4 text-sm leading-7 text-slate-100">
                    لماذا ظهر هذا العائق؟ {barrier.whyDetected}
                  </div>
                  <div className="mt-4 grid gap-3">
                    {barrier.evidence.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/8 bg-[#091120] px-4 py-3 text-sm text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Explainability"
            title="منطق القرار"
            description="المعادلة هنا قابلة للمراجعة، ومخرجاتها مرتبطة مباشرة بسبب القرار النهائي."
          >
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-white">لماذا النتيجة {statusLabel(bundle.report.status)}؟</div>
                <div className="mt-2">{bundle.report.whyThisDecision}</div>
              </div>
              {bundle.report.decisionRationale.map((item) => (
                <div key={item} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                  {item}
                </div>
              ))}
              <div className="rounded-3xl border border-accent/20 bg-accent/10 p-5">
                <div className="text-white">أثر التكييف على القرار</div>
                <div className="mt-2">
                  الجاهزية ترتفع من {bundle.report.baselineReadiness}% إلى {bundle.report.finalReadiness}% بعد تنفيذ الخطة
                  المتوقعة.
                </div>
              </div>
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
