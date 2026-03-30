"use client";

import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { formatCurrency } from "@/lib/scoring";
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
      subtitle="خطة محددة العناصر والتكلفة والزمن. إذا لم تكن قابلة للتنفيذ، فلا معنى لتوصية التوظيف."
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="التكلفة الكلية"
            value={formatCurrency(bundle.plan.totalCostSar)}
            hint="تكلفة مجمعة للخطة المقترحة."
            tone="neutral"
          />
          <MetricCard
            label="أطول زمن تنفيذ"
            value={`${bundle.plan.maxImplementationDays} أيام`}
            hint="المدة الحاكمة للوصول إلى جاهزية أولية."
            tone="warning"
          />
          <MetricCard
            label="حجم التغيير"
            value={bundle.plan.changeVolume}
            hint="تقدير إداري لحجم الجهد المطلوب من الشركة."
            tone="neutral"
          />
          <MetricCard
            label="عدد العناصر"
            value={`${bundle.plan.items.length}`}
            hint="أدوات وسياسات وتجهيزات محددة."
            tone="success"
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
                    <div className="mb-2 text-xs text-accent">{categoryLabel[item.category]}</div>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{item.rationale}</p>
                  </div>
                  <div className="grid min-w-[280px] gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">الأولوية</span>
                      <StatusPill
                        label={item.priority === "critical" ? "حرجة" : item.priority === "high" ? "عالية" : "متوسطة"}
                        tone={item.priority === "critical" ? "danger" : item.priority === "high" ? "warning" : "neutral"}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 rounded-3xl border border-white/8 bg-[#091120] p-4 text-center">
                      <div>
                        <div className="text-xs text-slate-500">التكلفة</div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {formatCurrency(item.estimatedCostSar)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">الزمن</div>
                        <div className="mt-2 text-sm font-semibold text-white">{item.implementationDays} أيام</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">الأثر</div>
                        <div className="mt-2 text-sm font-semibold text-white">+{item.expectedLift}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Execution"
          title="أولوية التنفيذ"
          description="يجب البدء بما يخفض الخطر التشغيلي بسرعة قبل الدخول في تحسينات ثانوية."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {bundle.plan.items.slice(0, 3).map((item, index) => (
              <div key={item.accommodationId} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="mb-3 text-sm text-gold">المرحلة {index + 1}</div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.rationale}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
