"use client";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { pipelineCases } from "@/data/dashboard";
import { bandToneForSignal, formatCurrency, statusLabel } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

export default function DashboardPage() {
  const { bundle, standards } = useAssessment();

  const averageReadiness = Math.round(
    pipelineCases.reduce((sum, item) => sum + item.readiness, 0) / pipelineCases.length
  );
  const averageCost = Math.round(
    pipelineCases.reduce((sum, item) => sum + item.costSar, 0) / pipelineCases.length
  );

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
            label="Standards Completion"
            value={`${standards.overview.completionRate}%`}
            hint="اكتمال checks للحالة الحالية."
            tone="success"
          />
          <MetricCard
            label="Blockers"
            value={`${standards.blockers.length}`}
            hint="ما يمنع الاعتماد الآن."
            tone={standards.blockers.length > 0 ? "warning" : "success"}
          />
        </section>

        <SectionCard
          eyebrow="Standards Snapshot"
          title="ملخص المعايير"
          description="Built on references + case-linked checks."
        >
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Checks</div>
                <div className="mt-2 text-2xl font-semibold text-white">{standards.overview.totalChecks}</div>
                <div className="mt-1 text-sm text-slate-400">إجمالي checks</div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Evidence Pending</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {standards.counts["missing-evidence"] + standards.counts["needs-review"]}
                </div>
                <div className="mt-1 text-sm text-slate-400">تحتاج إغلاق</div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Decision</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {statusLabel(bundle.report.status)}
                </div>
                <div className="mt-1 text-sm text-slate-400">الحكم الحالي</div>
              </div>
            </div>

            <div className="space-y-3">
              {standards.blockers.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white">{item.title}</div>
                    <div className="rounded-full border border-rose-500/20 bg-rose-500/12 px-3 py-1 text-xs text-rose-200">
                      Blocker
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">{item.rationale}</div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

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
