"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { DecisionCard } from "@/components/decision-card";
import { InfoCard } from "@/components/info-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import {
  EXTERNAL_ROLE_ORDER,
  EXTERNAL_ROLE_REFERENCE,
  INTERNAL_ROLE_REFERENCE
} from "@/lib/experience-roles";
import { formatCurrencyRange, statusLabel } from "@/lib/scoring";
import { APP_ROLES, getFirstAllowedHref, getRoleConfig } from "@/lib/role-model";
import { useAssessment } from "@/store/assessment-context";
import { useRoleSession } from "@/store/role-session-context";

export default function LandingPage() {
  const router = useRouter();
  const { bundle, caseWorkflow, explainability } = useAssessment();
  const { setRole } = useRoleSession();
  const topBlockers = explainability.approvalBlocks.slice(0, 3);

  return (
    <div className="min-h-screen bg-cinematic text-slate-100">
      <div className="mx-auto max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 mb-10 rounded-[28px] border border-white/10 bg-[#0b1017]/88 px-5 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-semibold text-white"
              >
                م
              </Link>
              <div>
                <div className="text-xs tracking-[0.28em] text-slate-500">Meyar</div>
                <div className="mt-1 text-sm text-slate-300">محرك القرار والامتثال المعياري</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/home"
                className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                ادخل النواة الداخلية
              </Link>
            </div>
          </div>
        </header>

        <main className="space-y-10">
          <DecisionCard
            eyebrow="مدخل القرار"
            title={bundle.report.recommendation}
            summary={`الحالة الحالية في ${caseWorkflow.currentStateLabel} ويقودها ${caseWorkflow.currentOwnerLabel}.`}
            value={`${bundle.report.finalReadiness}%`}
            badge={<StatusPill label={statusLabel(bundle.report.status)} tone="warning" />}
            className="p-8 sm:p-10"
            footer={
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/home"
                    className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    استكمل الحالة الحالية
                  </Link>
                  <Link
                    href="/portal/new-case"
                    className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
                  >
                    ابدأ حالة جديدة
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard
                    label="الحالة"
                    value={caseWorkflow.currentStateLabel}
                    hint="المسار الجاري الآن"
                  />
                  <InfoCard
                    label="التكلفة المتوقعة"
                    value={formatCurrencyRange(bundle.report.totalCostRangeSar)}
                    hint="نطاق التنفيذ الحالي"
                  />
                  <InfoCard
                    label="أقرب خطوة"
                    value={caseWorkflow.primaryAction.label}
                    hint="الإجراء الأقرب لتحريك القرار"
                  />
                </div>
              </div>
            }
          />

          <SectionCard
            eyebrow="النواة الداخلية"
            title="النواة الداخلية"
            description="مساحة قرار داخلية موحدة. كل دور يرى طبقة مختلفة من الحالة داخل نفس المحرك."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {APP_ROLES.map((item) => {
                const config = getRoleConfig(item);
                const definition = INTERNAL_ROLE_REFERENCE[item];
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setRole(item);
                      router.push(getFirstAllowedHref(item));
                    }}
                    className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-right transition hover:bg-white/[0.06]"
                  >
                    <div className="text-xs tracking-[0.18em] text-slate-500">دور داخلي</div>
                    <div className="mt-3 text-2xl font-semibold text-white">{config.label}</div>
                    <div className="mt-3 text-sm leading-7 text-slate-400">{definition.description}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {definition.sees.slice(0, 2).map((entry) => (
                        <span
                          key={`${item}-${entry}`}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300"
                        >
                          {entry}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white">
                      ادخل البوابة
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="الطبقة الخارجية"
            title="البوابات الخارجية"
            description="طبقة إدخال ومتابعة محدودة تغذي Meyar Core دون كشف القرار الداخلي."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {EXTERNAL_ROLE_ORDER.map((role) => {
                const item = EXTERNAL_ROLE_REFERENCE[role];
                const active = !item.futureReady;

                return active ? (
                  <Link
                    key={role}
                    href={item.homeHref}
                    className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.06]"
                  >
                    <div className="text-xs tracking-[0.18em] text-slate-500">بوابة خارجية</div>
                    <div className="mt-3 text-2xl font-semibold text-white">{item.label}</div>
                    <div className="mt-3 text-sm leading-7 text-slate-400">{item.description}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.sees.slice(0, 2).map((entry) => (
                        <span
                          key={`${role}-${entry}`}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300"
                        >
                          {entry}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white">
                      افتح البوابة
                    </div>
                  </Link>
                ) : (
                  <div
                    key={role}
                    className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6"
                  >
                    <div className="text-xs tracking-[0.18em] text-slate-500">جاهز لاحقًا</div>
                    <div className="mt-3 text-2xl font-semibold text-white">{item.label}</div>
                    <div className="mt-3 text-sm leading-7 text-slate-400">{item.description}</div>
                    <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-400">
                      غير مفعل الآن
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="لقطة مختصرة"
            title="ما الذي يمنع التحريك الآن؟"
            description="أبرز الموانع الحالية فقط."
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-3">
                {topBlockers.length > 0 ? (
                  topBlockers.map((block) => (
                    <div key={block.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-white">{block.title}</div>
                        <StatusPill label={block.blocker ? "مانع" : "مراجعة"} tone={block.blocker ? "danger" : "warning"} />
                      </div>
                      <div className="mt-2 text-sm leading-7 text-slate-400">{block.requiredAction}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-slate-300">
                    لا توجد موانع حرجة مفتوحة في الحالة الحالية.
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <div className="text-[11px] tracking-[0.18em] text-slate-500">ملخص سريع</div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">المرشح</span>
                    <span className="text-white">{bundle.profile.candidateAlias}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">الوظيفة</span>
                    <span className="text-white">{bundle.job.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">الاعتماد</span>
                    <span className="text-white">{caseWorkflow.nextStageLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </main>

        <footer className="mt-10 flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>Meyar</div>
          <div className="flex flex-wrap gap-4">
            <Link href="/home" className="transition hover:text-white">
              النواة الداخلية
            </Link>
            <Link href="/external/candidate" className="transition hover:text-white">
              المرشح
            </Link>
            <Link href="/external/employer" className="transition hover:text-white">
              جهة العمل
            </Link>
            <Link href="/readiness-report" className="transition hover:text-white">
              التقرير
            </Link>
            <Link href="/dashboard" className="transition hover:text-white">
              الإدارة
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
