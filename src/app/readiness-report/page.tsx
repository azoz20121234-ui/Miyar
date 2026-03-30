"use client";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { ReportActions } from "@/components/report-actions";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { formatCurrency, statusLabel } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

export default function ReadinessReportPage() {
  const { bundle } = useAssessment();

  return (
    <AppShell
      title="تقرير الجاهزية النهائي"
      subtitle="تقرير تنفيذي قبل التوظيف يوضح مستوى الجاهزية، تكلفة التكييف، حجم التغيير، والتوصية النهائية للإدارة."
      actions={<ReportActions />}
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="القرار النهائي"
            value={statusLabel(bundle.report.status)}
            hint="الخلاصة المعتمدة من محرك القرار."
            tone="success"
          />
          <MetricCard
            label="التكلفة الكلية"
            value={formatCurrency(bundle.plan.totalCostSar)}
            hint="ميزانية مطلوبة قبل أو مع بداية التوظيف."
            tone="neutral"
          />
          <MetricCard
            label="حجم التغيير"
            value={bundle.plan.changeVolume}
            hint="قياس إداري لطبيعة التدخل المطلوب."
            tone="warning"
          />
          <MetricCard
            label="المخاطر"
            value={bundle.report.riskLevel}
            hint="ناتج عن عدد وشدة العوائق الرئيسية."
            tone={bundle.report.riskLevel === "high" ? "danger" : "warning"}
          />
        </section>

        <SectionCard
          eyebrow="Executive Summary"
          title="ملخص الإدارة"
          description="هذا هو الملخص الذي يجب أن يستطيع متخذ القرار قراءته في أقل من دقيقة."
        >
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-accent/20 bg-accent/10 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-2xl font-semibold text-white">توصية ما قبل التوظيف</div>
                <StatusPill label={bundle.report.recommendation} tone="success" />
              </div>
              <p className="text-sm leading-8 text-slate-200">{bundle.report.executiveSummary}</p>
              <div className="mt-5 rounded-3xl border border-white/10 bg-[#091120] p-5">
                <div className="text-sm text-slate-400">الخلاصة التشغيلية</div>
                <div className="mt-3 text-lg leading-8 text-white">
                  الوظيفة مناسبة للمرشح بعد تهيئة وصول رقمي وسياسة مراجعة محدودة، مع تكلفة متوقعة يمكن ضبطها
                  مسبقًا دون تغيير جوهري في بنية الدور.
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-sm text-slate-400">العوائق الرئيسية</div>
                <div className="mt-3 space-y-2">
                  {bundle.report.keyBarriers.map((item) => (
                    <div key={item} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-sm text-slate-400">أعلى التكييفات أثرًا</div>
                <div className="mt-3 space-y-2">
                  {bundle.report.topAdjustments.map((item) => (
                    <div key={item} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Readiness Matrix"
          title="مصفوفة الجاهزية"
          description="تفصيل النتائج التي بنت التوصية النهائية."
        >
          <div className="grid gap-4 lg:grid-cols-4">
            {[
              { label: "Task Fit", value: bundle.report.taskFit },
              { label: "Environment Fit", value: bundle.report.environmentFit },
              { label: "Accommodation Feasibility", value: bundle.report.accommodationFeasibility },
              { label: "Critical Coverage", value: bundle.report.criticalCoverage }
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="mb-3 text-sm text-slate-400">{item.label}</div>
                <div className="text-3xl font-semibold text-white">{item.value}%</div>
                <div className="mt-4 h-2 rounded-full bg-white/8">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-accent to-gold"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
