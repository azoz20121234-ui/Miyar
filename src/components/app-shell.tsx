"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { bandToneForSignal, statusTone } from "@/lib/scoring";
import { AppPageId, getRoleConfig } from "@/lib/role-model";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

import { AccessRestricted } from "./access-restricted";
import { RoleSidebar } from "./role-sidebar";
import { RoleSwitcher } from "./role-switcher";
import { StatusPill } from "./status-pill";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
  pageId?: AppPageId;
}

export const AppShell = ({ title, subtitle, children, actions, pageId }: AppShellProps) => {
  const { bundle } = useAssessment();
  const { role, roleLabel, canAccess } = useRoleSession();
  const pathname = usePathname();
  const roleConfig = getRoleConfig(role);
  const currentStep = Math.max(
    0,
    roleConfig.navItems.findIndex((item) => item.href === pathname)
  );
  const progress = Math.round(((currentStep + 1) / Math.max(roleConfig.navItems.length, 1)) * 100);
  const topSignals = bundle.report.signals.slice(0, 2);
  const canViewPage = pageId ? canAccess(pageId) : true;

  return (
    <div className="min-h-screen bg-cinematic text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 mb-8 rounded-[24px] border border-white/10 bg-[#0b1017]/88 px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/home"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-semibold text-white"
              >
                م
              </Link>
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Meyar</div>
                <div className="mt-1 text-sm text-slate-300">Decision &amp; Compliance Standard Engine</div>
              </div>
            </div>

            <div className="hidden xl:flex">
              <RoleSwitcher />
            </div>

            <div className="flex items-center gap-3">
              <StatusPill label={roleLabel} tone="neutral" />
              <StatusPill
                label={bundle.report.recommendation}
                tone={statusTone(bundle.report.status)}
              />
              {actions}
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
            {roleConfig.navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "bg-white text-slate-950"
                      : "border border-white/10 bg-white/[0.03] text-slate-300"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">Operational View</div>
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                الجاهزية {bundle.report.finalReadiness}%
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                الثقة {bundle.report.confidence}%
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                الحالة {bundle.report.recommendation}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div>{canViewPage ? children : <AccessRestricted pageId={pageId as AppPageId} />}</div>

            <aside className="hidden xl:block">
              <div className="sticky top-28 space-y-4">
                <RoleSidebar />

                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Progress</div>
                      <div className="mt-2 text-lg font-semibold text-white">
                        {Math.min(currentStep + 1, roleConfig.navItems.length)} / {roleConfig.navItems.length}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white">
                      {progress}%
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <div
                      className="h-2 rounded-full bg-white"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-4 text-sm leading-6 text-slate-400">
                    الحالة النشطة
                  </div>
                  <div className="mt-1 text-base font-medium text-white">
                    {bundle.job.title}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Snapshot</div>
                  <div className="mt-3 text-lg font-semibold text-white">{bundle.report.recommendation}</div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">قبل التهيئة</span>
                      <span className="font-medium text-white">{bundle.report.baselineReadiness}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">بعد التهيئة</span>
                      <span className="font-medium text-white">{bundle.report.finalReadiness}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">التكلفة</span>
                      <span className="font-medium text-white">
                        {bundle.report.totalCostRangeSar.midpoint.toLocaleString("ar-SA")} ر.س
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                    أثر متوقع +{bundle.report.readinessDelta}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Signals</div>
                  <div className="mt-4 space-y-3">
                    {topSignals.map((signal) => {
                      const tone = bandToneForSignal(signal.score, signal.direction);
                      return (
                        <div key={signal.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
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
                          <div className="mt-2 text-xs leading-5 text-slate-400">{signal.rationale}</div>
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
