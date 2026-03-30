"use client";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { RadarChart } from "@/components/radar-chart";
import { SectionCard } from "@/components/section-card";
import { useAssessment } from "@/store/assessment-context";

export default function CandidateProfilePage() {
  const { profile, bundle, updateDimensionScore } = useAssessment();

  return (
    <AppShell
      pageId="candidate-profile"
      title="ملف القدرات التشغيلية"
      subtitle="اللغة هنا تشغيلية لا طبية: ما الذي يستطيع المرشح تنفيذه فعليًا، وما الشروط التي تحافظ على الأداء والاستمرارية."
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard label="المرشح" value={profile.candidateAlias} hint="تمثيل ديمو لمرشح بضعف بصري." />
          <MetricCard
            label="ثقة التقييم"
            value={`${profile.assessmentConfidence}%`}
            hint="مؤشر ثقة داخلي في كفاية البيانات التشغيلية."
            tone="neutral"
          />
          <MetricCard
            label="توافق المهام"
            value={`${bundle.report.taskFit}%`}
            hint="يتغير مع تعديل أبعاد القدرة الفعلية."
            tone="warning"
          />
          <MetricCard
            label="احتمال الاستمرارية"
            value={`${bundle.report.signals.find((signal) => signal.id === "sustainability-likelihood")?.score ?? 0}%`}
            hint="إشارة تقديرية بعد ربط القدرات بخطة التهيئة."
            tone="success"
          />
        </section>

        <SectionCard
          eyebrow="Profile Summary"
          title="الخلاصة التشغيلية"
          description="هذا الملخص هو ما يجب أن يقرأه صاحب القرار لفهم الملف قبل الدخول في الفجوات."
        >
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-accent/20 bg-accent/10 p-6">
              <div className="text-2xl font-semibold text-white">{profile.headline}</div>
              <p className="mt-4 text-sm leading-8 text-slate-200">
                الجاهزية الحالية قبل التكييف {bundle.report.baselineReadiness}%، وترتفع إلى {bundle.report.finalReadiness}%
                بعد تنفيذ الخطة المقترحة. هذا يعني أن الفجوة ليست في القدرة العامة بقدر ما هي في تهيئة المسار
                التشغيلي داخل الدور.
              </p>
            </div>

            <div className="space-y-3">
              {profile.operationalStrengths.map((item) => (
                <div key={item} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                  <div className="text-sm leading-7 text-slate-200">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Profile Map"
          title="الخريطة التشغيلية"
          description="العرض البصري يوضح أين توجد القوة وأين يجب أن يتحمل النظام أو البيئة عبء التهيئة بدل المرشح."
        >
          <RadarChart data={bundle.dimensionScores} />
        </SectionCard>

        <SectionCard
          eyebrow="Dimensions"
          title="أبعاد القدرة القابلة للمراجعة"
          description="لأغراض الديمو يمكن تعديل كل بُعد بخطوات بسيطة لرؤية أثره المباشر على المطابقة والتقرير."
        >
          <div className="grid gap-4">
            {profile.dimensions.map((dimension) => (
              <div key={dimension.id} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{dimension.label}</h3>
                      <div className="rounded-full border border-white/10 bg-[#091120] px-3 py-1 text-xs text-slate-300">
                        {dimension.score}%
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-slate-300">{dimension.note}</p>
                    <div className="mt-2 text-xs text-slate-500">{dimension.evidence}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateDimensionScore(dimension.id, -4)}
                      className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-lg text-slate-200 transition hover:bg-white/10"
                    >
                      -
                    </button>
                    <div className="min-w-[88px] rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-lg font-semibold text-white">
                      {dimension.score}%
                    </div>
                    <button
                      type="button"
                      onClick={() => updateDimensionScore(dimension.id, 4)}
                      className="h-10 w-10 rounded-full border border-accent/20 bg-accent/10 text-lg text-accent transition hover:bg-accent/20"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <section className="grid gap-6 lg:grid-cols-3">
          <SectionCard
            eyebrow="Preferred Conditions"
            title="ظروف الأداء الأنسب"
            description="هذه ليست تفضيلات شخصية، بل شروط ترفع احتمالية الاستمرارية."
          >
            <div className="space-y-3">
              {profile.workConditions.map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Tooling"
            title="أدوات مثبتة"
            description="المهم هنا ما يمكن استخدامه فعليًا داخل الدور لا ما يمكن نظريًا تدريبه لاحقًا."
          >
            <div className="space-y-3">
              {profile.toolsMastery.map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Constraints"
            title="فجوات تشغيلية محتملة"
            description="هذه الفجوات تدخل لاحقًا إلى محرك العوائق والتكييف."
          >
            <div className="space-y-3">
              {profile.constraints.map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
