"use client";

import { AppShell } from "@/components/app-shell";
import { ReportActions } from "@/components/report-actions";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { bandToneForSignal, formatCurrencyRange, statusLabel } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

export default function ReadinessReportPage() {
  const { bundle } = useAssessment();

  return (
    <AppShell
      pageId="readiness-report"
      title="Executive Decision Report"
      subtitle="وثيقة قرار قبل التوظيف تشرح الحكم النهائي، درجة الجاهزية، العوائق، التكييفات المطلوبة، ومؤشرات الاستدامة والامتثال التشغيلي."
      actions={<ReportActions />}
    >
      <div className="space-y-6">
        <section className="rounded-[36px] border border-white/8 bg-[#07111d]/90 p-6 shadow-panel">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-3 text-xs uppercase tracking-[0.28em] text-gold">Executive Decision</div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-semibold text-white">{statusLabel(bundle.report.status)}</h2>
                <StatusPill label={bundle.report.recommendation} tone="warning" />
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-200">
                {bundle.report.executiveSummary}
              </p>
              <div className="mt-5 rounded-[28px] border border-accent/20 bg-accent/10 p-5 text-sm leading-8 text-slate-100">
                لماذا هذا القرار؟ {bundle.report.whyThisDecision}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-xs text-slate-400">درجة الجاهزية</div>
                <div className="mt-3 text-4xl font-semibold text-white">{bundle.report.finalReadiness}%</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-xs text-slate-400">قبل التهيئة</div>
                <div className="mt-3 text-4xl font-semibold text-white">{bundle.report.baselineReadiness}%</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-xs text-slate-400">التكلفة التقديرية</div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {formatCurrencyRange(bundle.report.totalCostRangeSar)}
                </div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <div className="text-xs text-slate-400">زمن التهيئة</div>
                <div className="mt-3 text-4xl font-semibold text-white">{bundle.report.maxImplementationDays}</div>
                <div className="mt-1 text-xs text-slate-500">أيام</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            eyebrow="Decision Rationale"
            title="الروافع التي بنت القرار"
            description="هذه ليست نقاط عامة، بل المبررات التنفيذية التي يمكن عرضها على لجنة أو إدارة مباشرة."
          >
            <div className="space-y-3">
              {bundle.report.decisionRationale.map((item) => (
                <div key={item} className="rounded-3xl border border-white/8 bg-white/5 p-5 text-sm leading-8 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Readiness Matrix"
            title="مصفوفة القرار"
            description="تفصيل الأرقام التي حولت التحليل إلى حكم إداري واضح."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Task Fit", value: bundle.report.taskFit },
                { label: "Environment Fit", value: bundle.report.environmentFit },
                { label: "Accommodation Feasibility", value: bundle.report.accommodationFeasibility },
                { label: "Critical Coverage", value: bundle.report.criticalCoverage }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                  <div className="text-sm text-slate-400">{item.label}</div>
                  <div className="mt-3 text-3xl font-semibold text-white">{item.value}%</div>
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
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            eyebrow="Top Barriers"
            title="أهم 3 عوائق"
            description="العوائق التي يجب أن يراها صاحب القرار بوضوح قبل الموافقة."
          >
            <div className="space-y-4">
              {bundle.report.topBarriers.map((item) => (
                <div key={item.title} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <div className="text-lg font-semibold text-white">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Top Actions"
            title="أهم 3 إجراءات لازمة قبل التوظيف"
            description="هذه هي الأفعال التنفيذية التي يجب إغلاقها قبل المباشرة."
          >
            <div className="space-y-4">
              {bundle.report.topActions.map((item) => (
                <div key={item.title} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <div className="text-lg font-semibold text-white">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            eyebrow="Saudi-first Signals"
            title="إشارات الجاهزية والامتثال التشغيلي"
            description="مؤشرات داخلية تدعم القرار ولا تدّعي تفسيرًا قانونيًا أو فتوى تنظيمية."
          >
            <div className="space-y-4">
              {bundle.report.signals.map((signal) => {
                const tone = bandToneForSignal(signal.score, signal.direction);
                return (
                  <div key={signal.id} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="text-lg font-semibold text-white">{signal.label}</div>
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
                    <p className="text-sm leading-7 text-slate-300">{signal.rationale}</p>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Execution Checklist"
            title="Checklist قبل المباشرة"
            description="قائمة قابلة للطباعة لتثبيت القرار قبل بدء العمل."
          >
            <div className="space-y-4">
              {bundle.report.checklist.map((item) => (
                <div key={item.id} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-lg font-semibold text-white">{item.label}</div>
                    <StatusPill
                      label={item.priority === "required" ? "مطلوب" : "موصى به"}
                      tone={item.priority === "required" ? "warning" : "neutral"}
                    />
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{item.rationale}</p>
                  <div className="mt-3 text-xs text-slate-500">المالك المقترح: {item.owner}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        <SectionCard
          eyebrow="Executive Recommendation"
          title="التوصية التنفيذية القابلة للطباعة"
          description="الصياغة المختصرة التي يمكن اعتمادها في محضر أو توصية إدارية."
        >
          <div className="rounded-[32px] border border-gold/20 bg-gradient-to-br from-gold/10 via-transparent to-transparent p-6">
            <div className="text-lg leading-9 text-white">
              نوصي بالمضي في تعيين المرشح على الدور الحالي بصفة{" "}
              <span className="font-semibold text-gold">{statusLabel(bundle.report.status)}</span>، بشرط تنفيذ
              التكييفات ذات الأولوية خلال {bundle.report.maxImplementationDays} أيام تقريبًا وضمن نطاق تكلفة
              تقديري {formatCurrencyRange(bundle.report.totalCostRangeSar)}. مستوى المخاطر المتبقي {bundle.report.residualRiskLevel}،
              ويستند القرار إلى وضوح الدور، تغطية العوائق الأساسية، وارتفاع احتمالية الاستمرارية بعد التهيئة.
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
