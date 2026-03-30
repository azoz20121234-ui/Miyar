"use client";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { pipelineCases } from "@/data/dashboard";
import { bandToneForSignal, formatCurrency, statusLabel } from "@/lib/scoring";
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
      pageId="dashboard"
      title="لوحة تنفيذية"
      subtitle="عرض مختصر للمحفظة الحالية مع إشارات Saudi-first: وضوح الدور، كفاية التكييف، واحتمالية الاستمرارية عبر الحالات."
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
            label="الحالة النشطة"
            value={statusLabel(bundle.report.status)}
            hint="الحكم النهائي للحالة المفتوحة."
            tone="neutral"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            eyebrow="Portfolio View"
            title="توزيع الجاهزية"
            description="قراءة سريعة لحجم الحالات التي يمكن اعتمادها مقابل الحالات التي تحتاج تهيئة أوسع."
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
            eyebrow="Signals"
            title="إشارات الجاهزية الحالية"
            description="ما الذي يجب أن تراه الإدارة أو لجنة الامتثال بوضوح في الحالة النشطة؟"
          >
            <div className="space-y-4">
              {bundle.report.signals.map((signal) => {
                const tone = bandToneForSignal(signal.score, signal.direction);
                return (
                  <div key={signal.id} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="text-sm text-slate-400">{signal.label}</div>
                      <div
                        className={`rounded-full px-3 py-1 text-xs ${
                          tone === "success"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : tone === "warning"
                              ? "bg-amber-400/15 text-amber-200"
                              : "bg-rose-400/15 text-rose-200"
                        }`}
                      >
                        {signal.score}%
                      </div>
                    </div>
                    <div className="text-sm leading-7 text-white">{signal.rationale}</div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </section>

        <SectionCard
          eyebrow="Role Comparison"
          title="مقارنة الأدوار ضمن الملف الحالي"
          description="يعرض كيف يتغير القرار عند تبديل الدور مع ثبات ملف القدرات نفسه."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {bundle.roleCatalogPreviews.slice(0, 9).map((role) => (
              <div key={role.jobId} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{role.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{role.family}</div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-[#091120] px-3 py-2 text-sm text-white">
                    {role.readiness}%
                  </div>
                </div>
                <div className="text-sm leading-7 text-slate-300">
                  {statusLabel(role.status)} مع ثقة {role.confidence}%
                </div>
                <div className="mt-3 text-xs text-accent">{role.topSignal}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
