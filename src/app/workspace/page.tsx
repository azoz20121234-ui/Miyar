"use client";

import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { pipelineCases } from "@/data/dashboard";
import { formatCurrency } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

type FilterValue = "all" | "strong" | "attention";

export default function WorkspacePage() {
  const { bundle, resetDemo } = useAssessment();
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredCases = pipelineCases.filter((item) => {
    if (filter === "all") return true;
    if (filter === "strong") return item.readiness >= 75;
    return item.readiness < 75;
  });

  return (
    <AppShell
      title="مساحة صاحب العمل"
      subtitle="لوحة تشغيلية تجمع الحالات المفتوحة، مؤشر الجاهزية، والتكلفة المتوقعة قبل اتخاذ قرار التوظيف."
      actions={
        <button
          type="button"
          onClick={resetDemo}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          إعادة ضبط الديمو
        </button>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="الحالة النشطة"
            value={bundle.job.title}
            hint="القضية المفتوحة حاليًا والمستخدمة في كامل الديمو."
            tone="neutral"
          />
          <MetricCard
            label="جاهزية الحالة"
            value={`${bundle.report.finalReadiness}%`}
            hint="بعد حساب المهام والبيئة والتكييف."
            tone="warning"
          />
          <MetricCard
            label="تكلفة التنفيذ"
            value={formatCurrency(bundle.plan.totalCostSar)}
            hint="ميزانية التهيئة الأولية المقترحة."
            tone="neutral"
          />
          <MetricCard
            label="عدد التكييفات"
            value={`${bundle.plan.items.length}`}
            hint="عناصر خطة عملية وليست توصيات عامة."
            tone="success"
          />
        </section>

        <SectionCard
          eyebrow="Active Assessment"
          title="الملف الجاري"
          description="ملخص تنفيذي للحالة النشطة قبل الانتقال إلى صفحات التفاصيل."
        >
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/8 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-400">الشركة التجريبية</div>
                  <div className="mt-1 text-2xl font-semibold text-white">شركة خدمات رقمية سعودية</div>
                </div>
                <StatusPill label={bundle.report.recommendation} tone="success" />
              </div>
              <p className="text-sm leading-7 text-slate-300">
                الوظيفة مستهدفة لأعمال مكتبية ورقمية فقط. القرار لا يعتمد على انطباع عام، بل على تفكيك المهام
                الأساسية والفجوات والتكلفة المتوقعة للتهيئة.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs text-slate-400">ملاءمة البيئة</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{bundle.report.environmentFit}%</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs text-slate-400">التغطية الحرجة</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{bundle.report.criticalCoverage}%</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs text-slate-400">مستوى المخاطر</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{bundle.report.riskLevel}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {bundle.job.outcomes.map((item) => (
                <div key={item} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                  <div className="text-sm leading-7 text-slate-200">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Pipeline"
          title="قائمة القرارات المفتوحة"
          description="فلترة سريعة للحالات بحسب مستوى الجاهزية لفرق الموارد البشرية والتشغيل."
        >
          <div className="mb-5 flex flex-wrap gap-3">
            {[
              { id: "all", label: "الكل" },
              { id: "strong", label: "جاهزية أعلى" },
              { id: "attention", label: "تحتاج عناية" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id as FilterValue)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  filter === item.id
                    ? "bg-accent text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/8">
            <table className="min-w-full divide-y divide-white/8 text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-right">الشركة</th>
                  <th className="px-4 py-3 text-right">الدور</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">الجاهزية</th>
                  <th className="px-4 py-3 text-right">التكلفة</th>
                  <th className="px-4 py-3 text-right">المالك</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 bg-white/[0.03]">
                {filteredCases.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-white">{item.company}</td>
                    <td className="px-4 py-4 text-slate-300">{item.roleTitle}</td>
                    <td className="px-4 py-4 text-slate-300">{item.statusLabel}</td>
                    <td className="px-4 py-4 text-slate-300">{item.readiness}%</td>
                    <td className="px-4 py-4 text-slate-300">{formatCurrency(item.costSar)}</td>
                    <td className="px-4 py-4 text-slate-300">{item.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
