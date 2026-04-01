"use client";

import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { changeVolumeLabel } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

const lightingOptions = [
  { value: "controlled", label: "متحكم بها" },
  { value: "standard", label: "قياسية" },
  { value: "high-glare", label: "وهج مرتفع" }
] as const;

const accessibilityOptions = [
  { value: "basic", label: "أساسية" },
  { value: "managed", label: "مدارة" },
  { value: "advanced", label: "متقدمة" }
] as const;

const communicationOptions = [
  { value: "written-first", label: "مكتوب أولًا" },
  { value: "mixed", label: "مختلط" },
  { value: "verbal-heavy", label: "شفهي مكثف" }
] as const;

const documentOptions = [
  { value: "structured-digital", label: "رقمية منظمة" },
  { value: "mixed", label: "مختلطة" },
  { value: "scan-heavy", label: "مصورة بكثافة" }
] as const;

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

const demandLabel = (value: number) => (value >= 75 ? "مرتفع" : value >= 55 ? "متوسط" : "منخفض");

export default function JobAnalysisPage() {
  const { job, bundle, toggleTaskEssential, toggleTaskAdaptable, setEnvironmentField, selectRoleTemplate } =
    useAssessment();

  const essentialTasks = job.tasks.filter((task) => task.essential);
  const adaptableTasks = job.tasks.filter((task) => task.adaptable);
  const complexityScore = average(
    job.tasks.map(
      (task) =>
        task.intensity * 20 * 0.35 +
        task.cognitiveRequirement * 0.25 +
        task.communicationRequirement * 0.2 +
        task.digitalNavigationRequirement * 0.2
    )
  );
  const topRisks = job.environment.risks.slice(0, 3);

  return (
    <AppShell
      pageId="job-analysis"
      title="تحليل الوظيفة"
      subtitle="نحوّل الوظيفة هنا إلى صورة تشغيلية يمكن قياسها قبل التوظيف."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="decision-card p-6 sm:p-8">
          <div className="portal-label">المدخل التشغيلي</div>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[44px]">
                {job.title}
              </div>
              <div className="mt-3 text-sm leading-7 text-slate-300">
                نفكك الدور هنا إلى مهام أساسية، مهام قابلة للتكييف، ومتطلبات تشغيلية تؤثر مباشرة على القرار.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill label={job.department} tone="neutral" />
              <StatusPill label={job.location} tone="neutral" />
              <StatusPill label={`المخاطر ${topRisks.length}`} tone={topRisks.length > 0 ? "warning" : "success"} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">مستوى التعقيد</div>
              <div className="mt-2 text-lg font-semibold text-white">{demandLabel(complexityScore)}</div>
              <div className="mt-1 text-xs text-slate-400">محسوب من المهام والمتطلبات</div>
            </div>
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">المخاطر الرئيسية</div>
              <div className="mt-2 text-lg font-semibold text-white">{topRisks.length || 0}</div>
              <div className="mt-1 text-xs text-slate-400">داخل البيئة التشغيلية الحالية</div>
            </div>
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">حساسية التكييف</div>
              <div className="mt-2 text-lg font-semibold text-white">{changeVolumeLabel(bundle.plan.changeVolume)}</div>
              <div className="mt-1 text-xs text-slate-400">حجم التغيير المتوقع قبل الاعتماد</div>
            </div>
            <div className="summary-card px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">التوافق الحالي</div>
              <div className="mt-2 text-lg font-semibold text-white">{bundle.report.recommendation}</div>
              <div className="mt-1 text-xs text-slate-400">ينعكس مباشرة عند تعديل المهام</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs text-slate-500">قوالب جاهزة</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {bundle.roleCatalogPreviews.slice(0, 6).map((role) => (
                <button
                  key={role.jobId}
                  type="button"
                  onClick={() => selectRoleTemplate(role.jobId)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    role.jobId === job.id
                      ? "bg-white text-slate-950"
                      : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]"
                  }`}
                >
                  {role.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        <SectionCard
          eyebrow="المهام الأساسية"
          title="ما الذي لا يمكن إسقاطه؟"
          description="هذه العناصر تمثل جوهر الوظيفة وتؤثر مباشرة على قرار الملاءمة."
        >
          <div className="space-y-3">
            {essentialTasks.map((task) => (
              <div key={task.id} className="state-card px-5 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap gap-2">
                      <StatusPill label="أساسية" tone="success" />
                      <StatusPill label={task.frequency} tone="neutral" />
                      <StatusPill label={task.workTool} tone="neutral" />
                    </div>
                    <div className="mt-3 text-lg font-semibold text-white">{task.title}</div>
                    <div className="mt-2 text-sm leading-7 text-slate-400">{task.description}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTaskEssential(task.id)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.07]"
                    >
                      راجع الأساسية
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleTaskAdaptable(task.id)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        task.adaptable
                          ? "bg-amber-400/85 text-slate-950"
                          : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]"
                      }`}
                    >
                      {task.adaptable ? "قابلة للتكييف" : "اجعلها قابلة للتكييف"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="المهام القابلة للتكييف"
          title="ما الذي يمكن تكييفه؟"
          description="هذه العناصر يمكن إعادة توزيعها أو تعديلها دون كسر جوهر الوظيفة."
        >
          <div className="space-y-3">
            {adaptableTasks.map((task) => (
              <div key={task.id} className="summary-card px-5 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap gap-2">
                      <StatusPill label={task.taskTier === "essential" ? "أساسية قابلة للتكييف" : "قابلة للتكييف"} tone="warning" />
                      <StatusPill label={`إعادة التوزيع ${task.redistributionPotential}`} tone="neutral" />
                    </div>
                    <div className="mt-3 text-lg font-semibold text-white">{task.title}</div>
                    <div className="mt-2 text-sm leading-7 text-slate-400">{task.notes}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="summary-card px-4 py-3">
                      <div className="text-xs text-slate-500">الحس البصري</div>
                      <div className="mt-2 text-sm font-semibold text-white">{demandLabel(task.visualSensitivity)}</div>
                    </div>
                    <div className="summary-card px-4 py-3">
                      <div className="text-xs text-slate-500">المعرفي</div>
                      <div className="mt-2 text-sm font-semibold text-white">{demandLabel(task.cognitiveRequirement)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {adaptableTasks.length === 0 ? (
              <div className="summary-card px-5 py-4 text-sm text-slate-300">
                لا توجد مهام قابلة للتكييف في الوضع الحالي.
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="المتطلبات والمخاطر"
          title="ما الذي يؤثر على القرار؟"
          description="البيئة والأدوات والمخاطر هنا تشكل الصورة التشغيلية النهائية للوظيفة."
        >
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="state-card px-5 py-5">
                <div className="text-sm font-semibold text-white">المخاطر الرئيسية</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topRisks.map((risk) => (
                    <span
                      key={risk}
                      className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100"
                    >
                      {risk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="state-card px-5 py-5">
                <div className="text-sm font-semibold text-white">أدوات العمل</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="state-card px-5 py-5">
                <div className="text-sm font-semibold text-white">إعدادات البيئة</div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-xs text-slate-500">الإضاءة</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lightingOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setEnvironmentField("lighting", item.value)}
                          className={`rounded-full px-3 py-1.5 text-xs transition ${
                            job.environment.lighting === item.value
                              ? "bg-white text-slate-950"
                              : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">الوصول الرقمي</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {accessibilityOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setEnvironmentField("accessibilityMaturity", item.value)}
                          className={`rounded-full px-3 py-1.5 text-xs transition ${
                            job.environment.accessibilityMaturity === item.value
                              ? "bg-white text-slate-950"
                              : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">نمط التواصل</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {communicationOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setEnvironmentField("communicationPattern", item.value)}
                          className={`rounded-full px-3 py-1.5 text-xs transition ${
                            job.environment.communicationPattern === item.value
                              ? "bg-white text-slate-950"
                              : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">صيغة المستندات</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {documentOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setEnvironmentField("documentFormat", item.value)}
                          className={`rounded-full px-3 py-1.5 text-xs transition ${
                            job.environment.documentFormat === item.value
                              ? "bg-white text-slate-950"
                              : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
