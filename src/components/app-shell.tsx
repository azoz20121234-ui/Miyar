"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { accommodationLevelLabelMap, complexityLabelMap } from "@/lib/external-handoff";
import { bandToneForSignal, statusTone } from "@/lib/scoring";
import { AppPageId, getRoleConfig } from "@/lib/role-model";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

import { AccessRestricted } from "./access-restricted";
import { CaseStatusBar } from "./case-status-bar";
import { DecisionTimeline } from "./decision-timeline";
import { NextActionPanel } from "./next-action-panel";
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

const portalNameMap = {
  "case-initiator": "مساحة بدء الحالة",
  assessor: "مساحة التقييم",
  "hiring-manager": "مساحة المدير",
  "compliance-reviewer": "مساحة الامتثال",
  "executive-viewer": "المساحة التنفيذية",
  "platform-admin": "مساحة الإدارة"
} as const;

export const AppShell = ({ title, subtitle, children, actions, pageId }: AppShellProps) => {
  const { bundle, caseWorkflow, externalHandoff } = useAssessment();
  const { role, roleLabel, canAccess } = useRoleSession();
  const pathname = usePathname();
  const roleConfig = getRoleConfig(role);
  const topSignals = bundle.report.signals.slice(0, 2);
  const canViewPage = pageId ? canAccess(pageId) : true;
  const portalLabel = portalNameMap[role];

  return (
    <div className="min-h-screen bg-cinematic text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 mb-8 rounded-[30px] border border-white/10 bg-[#0d1117]/86 px-5 py-4 shadow-header backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/home"
                className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-lg font-semibold text-white transition hover:bg-white/[0.07]"
              >
                م
              </Link>
              <div>
                <div className="portal-label">Meyar Core</div>
                <div className="mt-1 text-sm text-slate-300">
                  مساحة القرار المؤسسية الداخلية
                </div>
              </div>
            </div>

            <div className="hidden xl:flex">
              <RoleSwitcher />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <StatusPill label={roleLabel} tone="neutral" />
              <StatusPill label={bundle.report.recommendation} tone={statusTone(bundle.report.status)} />
              <StatusPill label={caseWorkflow.currentStateLabel} tone="neutral" />
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
                      : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
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
              <div className="portal-label">Meyar Core • {portalLabel}</div>
              <h1 className="page-title mt-3">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 body-muted sm:text-base">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300">
                الجاهزية {bundle.report.finalReadiness}%
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300">
                الثقة {bundle.report.confidence}%
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300">
                التالي {caseWorkflow.nextStageLabel}
              </div>
            </div>
          </div>

          <CaseStatusBar />

          {externalHandoff ? (
            <section className="surface-card-soft mb-6 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="portal-label">استلام خارجي</div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    مرشح خارجي • {externalHandoff.job.title}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    تم استلام حزمة تمهيدية من الطبقة الخارجية وإدخالها في مسودة Meyar Core.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-200">
                    {externalHandoff.candidate.capabilityScore}% جاهزية أولية
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-200">
                    {externalHandoff.candidate.evidence.length} أدلة
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-200">
                    تعقيد {complexityLabelMap[externalHandoff.job.complexity]}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-200">
                    تكييف {accommodationLevelLabelMap[externalHandoff.expectedAccommodationLevel]}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div>{canViewPage ? children : <AccessRestricted pageId={pageId as AppPageId} />}</div>

            <aside className="hidden xl:block">
              <div className="sticky top-28 space-y-4">
                <RoleSidebar />

                <NextActionPanel />

                <DecisionTimeline />

                <div className="surface-card-soft p-5">
                  <div className="portal-label">ملخص القرار</div>
                  <div className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">
                    {bundle.report.recommendation}
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="body-muted">قبل التهيئة</span>
                      <span className="font-medium text-white">{bundle.report.baselineReadiness}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="body-muted">بعد التهيئة</span>
                      <span className="font-medium text-white">{bundle.report.finalReadiness}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="body-muted">التكلفة</span>
                      <span className="font-medium text-white">
                        {bundle.report.totalCostRangeSar.midpoint.toLocaleString("ar-SA")} ر.س
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="body-muted">المسؤول الحالي</span>
                      <span className="font-medium text-white">{caseWorkflow.currentOwnerLabel}</span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                    المرحلة التالية {caseWorkflow.nextStageLabel}
                  </div>
                </div>

                <div className="surface-card-soft p-5">
                  <div className="portal-label">الإشارات</div>
                  <div className="mt-4 space-y-3">
                    {topSignals.map((signal) => {
                      const tone = bandToneForSignal(signal.score, signal.direction);
                      return (
                        <div key={signal.id} className="surface-card-muted p-4">
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
                          <div className="mt-2 text-xs leading-5 body-muted">{signal.rationale}</div>
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
