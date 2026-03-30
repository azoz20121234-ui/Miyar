"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { bandToneForSignal, statusTone } from "@/lib/scoring";
import { useAssessment } from "@/store/assessment-context";

import { NavStepper } from "./nav-stepper";
import { StatusPill } from "./status-pill";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const AppShell = ({ title, subtitle, children, actions }: AppShellProps) => {
  const { bundle } = useAssessment();
  const pathname = usePathname();
  const steps = [
    "/",
    "/workspace",
    "/job-analysis",
    "/candidate-profile",
    "/matching",
    "/accommodation-plan",
    "/readiness-report",
    "/dashboard"
  ];
  const currentStep = Math.max(0, steps.indexOf(pathname));
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);
  const topSignals = bundle.report.signals.slice(0, 3);

  return (
    <div className="min-h-screen bg-cinematic text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 mb-8 rounded-[30px] border border-white/8 bg-[#07101c]/90 px-5 py-4 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-lg font-semibold text-accent"
              >
                م
              </Link>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Miyar Decision Engine
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  الوظيفة × القدرات المثبتة + التكييف المسعّر = توظيف مستدام
                </div>
              </div>
            </div>
            <NavStepper />
            <div className="flex items-center gap-3">
              <StatusPill
                label={bundle.report.recommendation}
                tone={statusTone(bundle.report.status)}
              />
              {actions}
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">قرار قبل التوظيف</div>
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">{title}</h1>
              <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">{subtitle}</p>
            </div>
            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-4">
                <div className="text-xs text-slate-400">الجاهزية النهائية</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {bundle.report.finalReadiness}%
                </div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-4">
                <div className="text-xs text-slate-400">ملاءمة الوظيفة</div>
                <div className="mt-2 text-3xl font-semibold text-white">{bundle.report.taskFit}%</div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div>{children}</div>

            <aside className="hidden xl:block">
              <div className="sticky top-28 space-y-4">
                <div className="rounded-[28px] border border-white/8 bg-[#08121f]/90 p-5 shadow-panel">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs tracking-[0.2em] text-slate-500">FLOW PROGRESS</div>
                      <div className="mt-2 text-lg font-semibold text-white">
                        {currentStep + 1} / {steps.length}
                      </div>
                    </div>
                    <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-2 text-sm text-accent">
                      {progress}%
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-accent to-gold"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-4 text-sm leading-7 text-slate-300">
                    الحالة النشطة: {bundle.job.title}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <div className="text-sm text-slate-400">ملخص القرار</div>
                  <div className="mt-3 text-xl font-semibold text-white">{bundle.report.recommendation}</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#091120] p-4">
                      <div className="text-xs text-slate-500">قبل التهيئة</div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        {bundle.report.baselineReadiness}%
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#091120] p-4">
                      <div className="text-xs text-slate-500">بعد التهيئة</div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        {bundle.report.finalReadiness}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-slate-100">
                    أثر التهيئة المتوقع: +{bundle.report.readinessDelta} نقطة
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <div className="text-sm text-slate-400">الثقة والمخاطر</div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">درجة الثقة</span>
                      <span className="font-semibold text-white">{bundle.report.confidence}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">المخاطر المتبقية</span>
                      <span className="font-semibold text-white">{bundle.report.residualRiskLevel}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">التكلفة التقديرية</span>
                      <span className="font-semibold text-white">
                        {bundle.report.totalCostRangeSar.midpoint.toLocaleString("ar-SA")} ر.س
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <div className="text-sm text-slate-400">Saudi-first signals</div>
                  <div className="mt-4 space-y-3">
                    {topSignals.map((signal) => {
                      const tone = bandToneForSignal(signal.score, signal.direction);
                      return (
                        <div key={signal.id} className="rounded-2xl border border-white/8 bg-[#091120] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-white">{signal.label}</div>
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
                          <div className="mt-2 text-xs leading-6 text-slate-400">{signal.rationale}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};
