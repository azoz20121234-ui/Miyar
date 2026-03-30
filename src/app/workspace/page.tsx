"use client";

import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { pipelineCases } from "@/data/dashboard";
import { bandToneForSignal, formatCurrency, statusLabel } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

type FilterValue = "all" | "strong" | "attention";

export default function WorkspacePage() {
  const { bundle, resetDemo, selectRoleTemplate } = useAssessment();
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredCases = pipelineCases.filter((item) => {
    if (filter === "all") return true;
    if (filter === "strong") return item.readiness >= 75;
    return item.readiness < 75;
  });

  return (
    <AppShell
      pageId="workspace"
      title="مساحة صاحب العمل"
      subtitle="مساحة تشغيلية تربط تحليل الدور بمؤشرات القرار الفعلية: جاهزية، تكلفة، مخاطر متبقية، واحتمال استمرارية."
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
            value={formatCurrency(bundle.report.totalCostRangeSar.midpoint)}
            hint="المنتصف التقديري للخطة المقترحة."
            tone="neutral"
          />
          <MetricCard
            label="عدد التكييفات"
            value={`${bundle.plan.items.length}`}
            hint="عناصر تنفيذ فعلية وليست توصيات عامة."
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
                <StatusPill label={statusLabel(bundle.report.status)} tone="warning" />
              </div>
              <p className="text-sm leading-7 text-slate-300">{bundle.report.whyThisDecision}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs text-slate-400">قبل التهيئة</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{bundle.report.baselineReadiness}%</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs text-slate-400">بعد التهيئة</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{bundle.report.finalReadiness}%</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs text-slate-400">المخاطر المتبقية</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{bundle.report.residualRiskLevel}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {bundle.report.signals.slice(0, 3).map((signal) => {
                const tone = bandToneForSignal(signal.score, signal.direction);
                return (
                  <div key={signal.id} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
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
                    <div className="text-sm leading-7 text-slate-200">{signal.rationale}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Role Catalog"
          title="قوالب الوظائف الجاهزة في MVP"
          description="هذه ليست قائمة وظائف عامة؛ بل قوالب أدوار يمكن تقييمها فورًا داخل المحرك نفسه."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {bundle.roleCatalogPreviews.map((role) => (
              <button
                key={role.jobId}
                type="button"
                onClick={() => selectRoleTemplate(role.jobId)}
                className={`rounded-[28px] border p-5 text-right transition ${
                  bundle.job.id === role.jobId
                    ? "border-accent/30 bg-accent/10"
                    : "border-white/8 bg-white/5 hover:bg-white/10"
                }`}
              >
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
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Decision Logic"
          title="لماذا القرار الحالي مقنع؟"
          description="المحرك يشرح منطق الحكم لا يكتفي بإظهار النتيجة."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {bundle.report.decisionRationale.map((item) => (
              <div key={item} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-sm leading-7 text-slate-200">{item}</div>
              </div>
            ))}
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
