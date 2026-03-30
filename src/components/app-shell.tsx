"use client";

import Link from "next/link";
import { ReactNode } from "react";

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
                tone={bundle.report.finalReadiness >= 75 ? "success" : "warning"}
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
          {children}
        </main>
      </div>
    </div>
  );
};
