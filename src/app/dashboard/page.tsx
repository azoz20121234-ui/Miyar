"use client";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { pipelineCases } from "@/data/dashboard";
import { formatCurrency } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

export default function DashboardPage() {
  const { bundle } = useAssessment();

  const averageReadiness = Math.round(
    pipelineCases.reduce((sum, item) => sum + item.readiness, 0) / pipelineCases.length
  );
  const averageCost = Math.round(
    pipelineCases.reduce((sum, item) => sum + item.costSar, 0) / pipelineCases.length
  );
  const strongCases = pipelineCases.filter((item) => item.readiness >= 75).length;

  return (
    <AppShell
      title="لوحة تنفيذية"
      subtitle="عرض مختصر للمحفظة الحالية: مستوى الجاهزية، حجم الإنفاق المتوقع، والحالات التي يمكن دفعها إلى قرار أسرع."
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="متوسط الجاهزية"
            value={`${averageReadiness}%`}
            hint="قياس محفظة القرارات الحالية."
            tone="warning"
          />
          <MetricCard
            label="متوسط تكلفة التهيئة"
            value={formatCurrency(averageCost)}
            hint="متوسط الخطة الأولية لكل حالة."
            tone="neutral"
          />
          <MetricCard
            label="حالات قابلة للدفع"
            value={`${strongCases}`}
            hint="عدد الحالات فوق 75% جاهزية."
            tone="success"
          />
          <MetricCard
            label="الحالة قيد المراجعة"
            value={`${bundle.report.finalReadiness}%`}
            hint="الحالة النشطة داخل صفحات الديمو."
            tone="neutral"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            eyebrow="Portfolio View"
            title="توزيع الجاهزية"
            description="قراءة سريعة لحجم القضايا التي يمكن اعتمادها مقابل القضايا التي تحتاج تهيئة أوسع."
          >
            <div className="space-y-4">
              {pipelineCases.map((item) => (
                <div key={item.id} className="rounded-3xl border border-white/8 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white">{item.company}</div>
                      <div className="text-xs text-slate-500">{item.roleTitle}</div>
                    </div>
                    <div className="text-lg font-semibold text-white">{item.readiness}%</div>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <div
                      className={`h-2 rounded-full ${
                        item.readiness >= 80
                          ? "bg-emerald-400"
                          : item.readiness >= 65
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      }`}
                      style={{ width: `${item.readiness}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Governance"
            title="إشارات إدارة"
            description="ما الذي يجب أن تراه الإدارة أو لجنة الامتثال بوضوح؟"
          >
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-sm text-slate-400">أسرع رافعة قرار</div>
                <div className="mt-3 text-lg leading-8 text-white">
                  رفع نضج الوصول الرقمي من Basic إلى Managed ينعكس فورًا على غالبية الحالات المكتبية.
                </div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-sm text-slate-400">إشارة محفظة</div>
                <div className="mt-3 text-lg leading-8 text-white">
                  الحالات ذات الكلفة الأقل من {formatCurrency(6000)} وزمن تنفيذ أقل من أسبوع تمثل أفضل مسار
                  للبدء السريع.
                </div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-sm text-slate-400">حالة الديمو</div>
                <div className="mt-3 text-lg leading-8 text-white">
                  {bundle.report.recommendation} مع خطة محدودة وتكلفة إجمالية {formatCurrency(bundle.plan.totalCostSar)}.
                </div>
              </div>
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
