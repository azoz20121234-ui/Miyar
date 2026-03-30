"use client";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { statusLabel } from "@/lib/scoring";
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

const demandPill = (value: number) =>
  value >= 80 ? "مرتفع" : value >= 60 ? "متوسط" : "منخفض";

export default function JobAnalysisPage() {
  const {
    job,
    bundle,
    toggleTaskEssential,
    toggleTaskAdaptable,
    setEnvironmentField,
    selectRoleTemplate
  } = useAssessment();

  return (
    <AppShell
      title="تحليل الوظيفة"
      subtitle="تفكيك الدور إلى متطلبات تشغيلية حقيقية: مهام، كثافة، أدوات، وبيئة. هنا يبدأ القرار الحقيقي قبل أي تقييم للمرشح."
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard label="المسمى" value={job.title} hint="الدور النشط داخل الديمو." />
          <MetricCard
            label="المهام الأساسية"
            value={`${job.tasks.filter((task) => task.taskTier === "essential").length}`}
            hint="عدد المهام التي تمثل جوهر الدور فعلًا."
            tone="neutral"
          />
          <MetricCard
            label="وضوح الدور"
            value={`${bundle.report.signals.find((signal) => signal.id === "role-clarity")?.score ?? 0}%`}
            hint="إشارة داخلية تقيس هل الدور حقيقي أم عام ومضخم."
            tone="success"
          />
          <MetricCard
            label="الحكم الحالي"
            value={statusLabel(bundle.report.status)}
            hint="النتيجة الإجمالية تتغير مع تغيير البيئة أو تصنيف المهام."
            tone="warning"
          />
        </section>

        <SectionCard
          eyebrow="Role Catalog"
          title="قوالب الأدوار المتاحة في النسخة الأولى"
          description="اختيار قالب جديد يبدل كامل التحليل الحالي ويعيد تشغيل المحرك فورًا."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {bundle.roleCatalogPreviews.slice(0, 12).map((role) => (
              <button
                key={role.jobId}
                type="button"
                onClick={() => selectRoleTemplate(role.jobId)}
                className={`rounded-[28px] border p-5 text-right transition ${
                  role.jobId === job.id
                    ? "border-accent/30 bg-accent/10"
                    : "border-white/8 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{role.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{role.family}</div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-[#091120] px-3 py-2 text-sm text-white">
                    {role.readiness}%
                  </div>
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-300">{role.topSignal}</div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Role Brief"
          title="بطاقة الدور"
          description="هذا الوصف يجب أن يشرح التشغيل الفعلي، لا مجرد تعريف إداري عام."
        >
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-white/8 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-400">{job.department}</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{job.family}</div>
                </div>
                <StatusPill label={job.location} tone="neutral" />
              </div>
              <p className="text-sm leading-8 text-slate-300">{job.summary}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {job.outcomes.map((item) => (
                  <div key={item} className="rounded-2xl bg-[#091120] p-4 text-sm leading-7 text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {bundle.environmentExplainability.map((item) => (
                <div key={item} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                  <div className="text-sm leading-7 text-slate-200">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Task Bank"
          title="تفصيل المهام والمعايير"
          description="لكل مهمة: نوعها، تكرارها، شدتها، وحساسيتها البصرية أو المعرفية أو الحركية. هذا هو قلب القرار."
        >
          <div className="grid gap-4">
            {job.tasks.map((task) => (
              <div key={task.id} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs text-accent">
                        {task.category}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        {task.taskTier === "essential" ? "أساسية" : "ثانوية"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        {task.frequency}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{task.description}</p>
                    <div className="mt-3 text-xs leading-6 text-slate-500">{task.notes}</div>
                  </div>

                  <div className="grid min-w-[320px] gap-3">
                    <div className="grid grid-cols-4 gap-3 rounded-3xl border border-white/8 bg-[#091120] p-4 text-center">
                      <div>
                        <div className="text-xs text-slate-500">المدة</div>
                        <div className="mt-2 text-sm font-semibold text-white">{task.durationMinutes} د</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">الشدة</div>
                        <div className="mt-2 text-sm font-semibold text-white">{task.intensity}/5</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">الأداة</div>
                        <div className="mt-2 text-sm font-semibold text-white">{task.workTool}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">إعادة التوزيع</div>
                        <div className="mt-2 text-sm font-semibold text-white">{task.redistributionPotential}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        ["الحس البصري", task.visualSensitivity],
                        ["الحس السمعي", task.auditorySensitivity],
                        ["الحركة الدقيقة", task.fineMotorRequirement],
                        ["الحركة العامة", task.grossMotorRequirement],
                        ["المعرفي", task.cognitiveRequirement],
                        ["التواصل", task.communicationRequirement],
                        ["التنقل الرقمي", task.digitalNavigationRequirement]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3 text-center">
                          <div className="text-slate-500">{label}</div>
                          <div className="mt-2 text-sm font-semibold text-white">{value}%</div>
                          <div className="mt-1 text-[11px] text-slate-400">{demandPill(Number(value))}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleTaskEssential(task.id)}
                        className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
                          task.essential
                            ? "bg-accent text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {task.essential ? "مهمة أساسية" : "اجعلها أساسية"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleTaskAdaptable(task.id)}
                        className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
                          task.adaptable
                            ? "bg-gold/90 text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {task.adaptable ? "قابلة للتعديل" : "غير قابلة للتعديل"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Environment"
          title="إعدادات البيئة"
          description="كل عنصر هنا ينعكس مباشرة على العوائق والتكييفات والتقرير النهائي."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="text-sm text-slate-300">الإضاءة</div>
                <div className="flex flex-wrap gap-2">
                  {lightingOptions.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setEnvironmentField("lighting", item.value)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        job.environment.lighting === item.value
                          ? "bg-accent text-slate-950"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-slate-300">نضج الوصول الرقمي</div>
                <div className="flex flex-wrap gap-2">
                  {accessibilityOptions.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setEnvironmentField("accessibilityMaturity", item.value)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        job.environment.accessibilityMaturity === item.value
                          ? "bg-accent text-slate-950"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <div className="text-sm text-slate-300">نمط التواصل</div>
                <div className="flex flex-wrap gap-2">
                  {communicationOptions.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setEnvironmentField("communicationPattern", item.value)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        job.environment.communicationPattern === item.value
                          ? "bg-accent text-slate-950"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-slate-300">صيغة المستندات</div>
                <div className="flex flex-wrap gap-2">
                  {documentOptions.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setEnvironmentField("documentFormat", item.value)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        job.environment.documentFormat === item.value
                          ? "bg-accent text-slate-950"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
