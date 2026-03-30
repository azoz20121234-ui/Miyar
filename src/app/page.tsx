"use client";

import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { RoleSwitcher } from "@/components/role-switcher";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { pipelineCases } from "@/data/dashboard";
import { formatCurrencyRange, statusLabel } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

const modules = [
  {
    icon: "تح",
    title: "تحليل الوظيفة",
    text: "تفكيك الدور إلى مهام وأدوات وبيئة."
  },
  {
    icon: "قد",
    title: "ملف القدرات",
    text: "قراءة تشغيلية مختصرة لما يمكن تنفيذه فعليًا."
  },
  {
    icon: "مط",
    title: "المطابقة",
    text: "استخراج الفجوات والعوائق بشكل قابل للتفسير."
  },
  {
    icon: "تق",
    title: "التقرير التنفيذي",
    text: "حكم نهائي مع تكلفة وزمن واعتماد مطلوب."
  }
];

export default function LandingPage() {
  const { bundle } = useAssessment();

  return (
    <div className="min-h-screen bg-cinematic text-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 mb-8 rounded-[24px] border border-white/10 bg-[#0b1017]/86 px-5 py-4 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-semibold text-white"
              >
                م
              </Link>
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Meyar</div>
                <div className="mt-1 text-sm text-slate-300">Decision &amp; Compliance Standard Engine</div>
              </div>
            </div>

            <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-2 lg:flex">
              <a href="#overview" className="rounded-full px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
                Overview
              </a>
              <a href="#cases" className="rounded-full px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
                Cases
              </a>
              <a href="#standards" className="rounded-full px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
                Standards
              </a>
              <Link href="/readiness-report" className="rounded-full px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
                Reports
              </Link>
              <Link href="/dashboard" className="rounded-full px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
                Admin
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex">
                <RoleSwitcher />
              </div>
              <Link
                href="/home"
                className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                ادخل حسب الدور
              </Link>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          <section className="rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:px-8 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div className="max-w-3xl">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Operational Readiness</div>
                <h1 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  قرار التوظيف يبدأ من الجاهزية التشغيلية.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                  تقييم مختصر للملاءمة، الاعتماد المطلوب، والتكلفة قبل إصدار القرار.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/home"
                    className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    ادخل لوحة الدور
                  </Link>
                  <Link
                    href="/readiness-report"
                    className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
                  >
                    اعرض التقرير
                  </Link>
                </div>
              </div>

              <div className="grid gap-3">
                <MetricCard
                  label="الجاهزية"
                  value={`${bundle.report.finalReadiness}%`}
                  hint="الحالة الحالية"
                  tone="neutral"
                />
                <MetricCard
                  label="التكلفة"
                  value={formatCurrencyRange(bundle.report.totalCostRangeSar)}
                  hint="نطاق التنفيذ"
                  tone="neutral"
                />
                <MetricCard
                  label="زمن التهيئة"
                  value={`${bundle.report.maxImplementationDays} أيام`}
                  hint="المدة المتوقعة"
                  tone="neutral"
                />
              </div>
            </div>
          </section>

          <section id="overview" className="grid gap-4 lg:grid-cols-3">
            <SectionCard
              eyebrow="Snapshot"
              title="حالة نشطة"
              description="عرض سريع للحالة الحالية."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{bundle.job.title}</div>
                    <div className="mt-1 text-sm text-slate-400">{bundle.profile.candidateAlias}</div>
                  </div>
                  <StatusPill label={statusLabel(bundle.report.status)} tone="warning" />
                </div>
                <div className="text-sm text-slate-400">جاهز للمراجعة التنفيذية</div>
                <div className="lg:hidden">
                  <RoleSwitcher />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Fit"
              title="درجة الملاءمة"
              description="مؤشر تشغيلي مباشر."
            >
              <div className="space-y-3">
                <div className="text-4xl font-semibold text-white">{bundle.report.taskFit}%</div>
                <div className="text-sm text-slate-400">ملاءمة المهام الأساسية</div>
                <div className="h-2 rounded-full bg-white/8">
                  <div className="h-2 rounded-full bg-white" style={{ width: `${bundle.report.taskFit}%` }} />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Required"
              title="الاعتماد المطلوب"
              description="الإجراءات الأولى قبل المباشرة."
            >
              <div className="space-y-2">
                {bundle.report.topActions.slice(0, 2).map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                    {item.title}
                  </div>
                ))}
              </div>
            </SectionCard>
          </section>

          <section id="standards">
            <SectionCard
              eyebrow="Modules"
              title="وحدات المنصة"
              description="أربع وحدات تشغيلية فقط."
            >
              <div className="grid gap-4 lg:grid-cols-4">
                {modules.map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white">
                      {item.icon}
                    </div>
                    <div className="mt-4 text-lg font-semibold text-white">{item.title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">{item.text}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </section>

          <section id="cases" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <SectionCard
              eyebrow="Cases"
              title="حالات حديثة"
              description="عرض حي مختصر من مساحة العمل."
            >
              <div className="overflow-hidden rounded-[20px] border border-white/10">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="bg-white/[0.03] text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-right">الجهة</th>
                      <th className="px-4 py-3 text-right">الحالة</th>
                      <th className="px-4 py-3 text-right">الجاهزية</th>
                      <th className="px-4 py-3 text-right">التكلفة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-transparent">
                    {pipelineCases.slice(0, 4).map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 text-white">{item.company}</td>
                        <td className="px-4 py-4 text-slate-300">{item.statusLabel}</td>
                        <td className="px-4 py-4 text-slate-300">{item.readiness}%</td>
                        <td className="px-4 py-4 text-slate-300">{item.costSar.toLocaleString("ar-SA")} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Workspace"
              title="عرض مباشر"
              description="وصول سريع إلى الحالة الحالية."
            >
              <div className="space-y-4">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm text-slate-400">الحكم</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{bundle.report.recommendation}</div>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm text-slate-400">العوائق الرئيسية</div>
                  <div className="mt-3 space-y-2">
                    {bundle.report.topBarriers.slice(0, 2).map((item) => (
                      <div key={item.title} className="text-sm text-slate-200">
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  href="/home"
                  className="block rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-center text-sm text-slate-200 transition hover:bg-white/5"
                >
                  افتح لوحة الدور
                </Link>
              </div>
            </SectionCard>
          </section>
        </main>

        <footer className="mt-10 flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>Meyar</div>
          <div className="flex flex-wrap gap-4">
            <Link href="/home" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/readiness-report" className="transition hover:text-white">
              Reports
            </Link>
            <Link href="/dashboard" className="transition hover:text-white">
              Admin
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
