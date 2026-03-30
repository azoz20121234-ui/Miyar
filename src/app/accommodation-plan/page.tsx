"use client";

import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { changeVolumeLabel, formatCurrencyRange } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

type CategoryFilter = "all" | "software" | "process" | "physical";

const categoryLabel: Record<CategoryFilter, string> = {
  all: "الكل",
  software: "Software",
  process: "Process / Policy",
  physical: "Physical / Workspace"
};

export default function AccommodationPlanPage() {
  const { bundle } = useAssessment();
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filteredItems = bundle.plan.items.filter((item) =>
    category === "all" ? true : item.category === category
  );

  return (
    <AppShell
      title="خطة التكييف التشغيلية"
      subtitle="خطة تنفيذ فعلية مرتبطة بالعائق والمهمة والتكلفة والزمن، مع تفسير واضح لأثر كل تكييف على الجاهزية النهائية."
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="التكلفة التقديرية"
            value={formatCurrencyRange(bundle.plan.totalCostRangeSar)}
            hint="النطاق الكامل قبل التنفيذ."
            tone="neutral"
          />
          <MetricCard
            label="زمن التهيئة"
            value={`${bundle.plan.maxImplementationDays} أيام`}
            hint="المدة الحاكمة للوصول إلى جاهزية أولية."
            tone="warning"
          />
          <MetricCard
            label="تغطية العوائق"
            value={`${bundle.plan.barrierCoverage}%`}
            hint="كم نسبة العوائق التي تعالجها الخطة الحالية."
            tone="success"
          />
          <MetricCard
            label="حجم التغيير"
            value={changeVolumeLabel(bundle.plan.changeVolume)}
            hint="تقدير إداري لطبيعة الجهد المطلوب."
            tone="neutral"
          />
        </section>

        <SectionCard
          eyebrow="Plan Filters"
          title="تصنيف الخطة"
          description="فلترة الخطة حسب نوع التكييف لرؤية العبء الفعلي على التقنية أو الإجراءات أو التجهيزات."
        >
          <div className="mb-5 flex flex-wrap gap-3">
            {(Object.keys(categoryLabel) as CategoryFilter[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  category === item
                    ? "bg-accent text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {categoryLabel[item]}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <div key={item.accommodationId} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs text-accent">
                        {categoryLabel[item.category]}
                      </span>
                      <span className="rounded-full border border-white/10 bg-[#091120] px-3 py-1 text-xs text-slate-300">
                        ثقة {item.confidence}%
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{item.whyRecommended}</p>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-[#091120] p-4">
                        <div className="text-xs text-slate-500">العوائق المستهدفة</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.linkedBarrierIds.map((barrierId) => (
                            <span key={barrierId} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
                              {bundle.barriers.find((barrier) => barrier.id === barrierId)?.title ?? barrierId}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-[#091120] p-4">
                        <div className="text-xs text-slate-500">المهام المدعومة</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.linkedTaskIds.map((taskId) => (
                            <span key={taskId} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
                              {bundle.taskResults.find((task) => task.taskId === taskId)?.title ?? taskId}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-3xl border border-accent/20 bg-accent/10 p-4 text-sm text-slate-100">
                      لماذا اقتُرح؟ لأنه يرفع الجاهزية من {item.readinessBefore}% إلى {item.readinessAfter}% لهذه
                      المرحلة، بأثر متوقع +{item.expectedReadinessLift} نقطة.
                    </div>
                  </div>

                  <div className="grid min-w-[300px] gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">الأولوية</span>
                      <StatusPill
                        label={item.priorityLevel === "critical" ? "حرجة" : item.priorityLevel === "high" ? "عالية" : "متوسطة"}
                        tone={
                          item.priorityLevel === "critical"
                            ? "danger"
                            : item.priorityLevel === "high"
                              ? "warning"
                              : "neutral"
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 rounded-3xl border border-white/8 bg-[#091120] p-4 text-center">
                      <div>
                        <div className="text-xs text-slate-500">التكلفة</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {formatCurrencyRange(item.estimatedCostRangeSar)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">الزمن</div>
                        <div className="mt-2 text-sm font-semibold text-white">{item.implementationDays} أيام</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">الأثر</div>
                        <div className="mt-2 text-sm font-semibold text-white">+{item.expectedReadinessLift}</div>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/8 bg-[#091120] p-4">
                      <div className="text-xs text-slate-500">متطلبات الاعتماد</div>
                      <div className="mt-3 space-y-2">
                        {item.dependencyRequirements.map((dependency) => (
                          <div key={dependency} className="text-sm text-slate-200">
                            {dependency}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-accent">
                        جاهزية محلية: {item.localReadinessFlag} | فئة الاستثمار: {item.investmentClass}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Before / After"
          title="أثر الخطة على القرار"
          description="الفرق بين الجاهزية قبل التهيئة وبعدها هو ما يجعل قرار التوظيف قابلاً للتنفيذ أمام اللجنة."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
              <div className="text-sm text-slate-400">قبل التهيئة</div>
              <div className="mt-3 text-4xl font-semibold text-white">{bundle.report.baselineReadiness}%</div>
              <div className="mt-3 text-sm leading-7 text-slate-300">
                مستوى الجاهزية إذا اتُّخذ القرار دون تثبيت التكييفات المقترحة.
              </div>
            </div>
            <div className="rounded-3xl border border-accent/20 bg-accent/10 p-5">
              <div className="text-sm text-accent">الأثر المتوقع</div>
              <div className="mt-3 text-4xl font-semibold text-white">+{bundle.report.readinessDelta}</div>
              <div className="mt-3 text-sm leading-7 text-slate-200">
                ناتج عن تكييفات مرتبطة بالعائق والمهمة وليس بإعاقة عامة فقط.
              </div>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
              <div className="text-sm text-slate-400">بعد التهيئة</div>
              <div className="mt-3 text-4xl font-semibold text-white">{bundle.report.finalReadiness}%</div>
              <div className="mt-3 text-sm leading-7 text-slate-300">
                هذا هو الرقم الذي تبنى عليه التوصية التنفيذية النهائية.
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
