"use client";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { useAssessment } from "@/store/assessment-context";

const lightingOptions = [
  { value: "controlled", label: "متحكم بها" },
  { value: "standard", label: "قياسية" },
  { value: "high-glare", label: "سطوع مرتفع" }
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

export default function JobAnalysisPage() {
  const { job, bundle, toggleTaskEssential, toggleTaskAdaptable, setEnvironmentField } = useAssessment();

  return (
    <AppShell
      title="تحليل الوظيفة"
      subtitle="تفكيك الدور إلى متطلبات تشغيلية حقيقية: مهام، أدوات، بيئة، ومخاطر اعتماد. هذه الصفحة هي الأساس لأي قرار لاحق."
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard
            label="المسمى"
            value={job.title}
            hint="الدور المستهدف ضمن النسخة الأولى."
          />
          <MetricCard
            label="المهام الأساسية"
            value={`${job.tasks.filter((task) => task.essential).length}`}
            hint="عدد المهام غير القابلة للإلغاء."
            tone="neutral"
          />
          <MetricCard
            label="المهام القابلة للتعديل"
            value={`${job.tasks.filter((task) => task.adaptable).length}`}
            hint="المهام التي يمكن إعادة هندستها جزئيًا."
            tone="success"
          />
          <MetricCard
            label="ملاءمة البيئة"
            value={`${bundle.report.environmentFit}%`}
            hint="تتغير حسب إعدادات البيئة أدناه."
            tone="warning"
          />
        </section>

        <SectionCard
          eyebrow="Role Brief"
          title="بطاقة الدور"
          description="دور مكتبي رقمي لا يتطلب حركة عالية، لكنه يتأثر مباشرة بجودة الوصول داخل الأدوات والملفات."
        >
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-white/8 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-400">{job.department}</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{job.family}</div>
                </div>
                <StatusPill label={job.location} tone="neutral" />
              </div>
              <p className="text-sm leading-7 text-slate-300">{job.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {job.coreSkills.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {job.environment.risks.map((risk) => (
                <div key={risk} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                  <div className="text-sm leading-7 text-slate-200">{risk}</div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Task Bank"
          title="اختيار المهام وتوصيفها"
          description="المطلوب هنا ليس وصفًا عامًا، بل تحديد ما هو أساسي وما يمكن تعديله دون الإضرار بالهدف التشغيلي."
        >
          <div className="grid gap-4">
            {job.tasks.map((task) => (
              <div key={task.id} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-2 text-xs text-accent">{task.category}</div>
                    <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{task.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {task.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid min-w-[260px] gap-3">
                    <div className="grid grid-cols-3 gap-3 rounded-3xl border border-white/8 bg-[#091120] p-4 text-center">
                      <div>
                        <div className="text-xs text-slate-500">الوقت</div>
                        <div className="mt-2 text-xl text-white">{task.timeShare}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">الجهد</div>
                        <div className="mt-2 text-xl text-white">{task.effortLevel}/5</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">الحركة</div>
                        <div className="mt-2 text-xl text-white">{task.movementLevel}/5</div>
                      </div>
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
                        {task.essential ? "أساسي" : "اجعله أساسيًا"}
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
                        {task.adaptable ? "قابل للتعديل" : "غير قابل للتعديل"}
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
          title="بيئة العمل"
          description="هذه العناصر تؤثر مباشرة على قرار الملاءمة حتى لو لم تتغير المهام نفسها."
        >
          <div className="grid gap-6 lg:grid-cols-3">
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
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
