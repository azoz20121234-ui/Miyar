"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface ExternalShellProps {
  flowLabel: string;
  title: string;
  subtitle: string;
  steps: string[];
  activeStep: number;
  children: ReactNode;
  aside?: ReactNode;
}

export const ExternalShell = ({
  flowLabel,
  title,
  subtitle,
  steps,
  activeStep,
  children,
  aside
}: ExternalShellProps) => {
  const hasAside = Boolean(aside);

  return (
    <div className="min-h-screen bg-cinematic text-slate-100">
      <div className="mx-auto max-w-[1080px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#0d1219]/82 px-5 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/external"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-semibold text-white transition hover:bg-white/[0.07]"
            >
              م
            </Link>
            <div>
              <div className="portal-label">البوابات الخارجية</div>
              <div className="mt-1 text-sm text-slate-300">إدخال تمهيدي قبل التقييم</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/external/candidate"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06]"
            >
              المرشح
            </Link>
            <Link
              href="/external/employer"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06]"
            >
              جهة العمل
            </Link>
            <Link
              href="/external/submit"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              الإرسال
            </Link>
          </div>
        </header>

        <main className={hasAside ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]" : ""}>
          <section className="space-y-6">
            <div className="surface-card p-7 sm:p-9">
              <div className="portal-label">{flowLabel}</div>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-[48px]">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                {subtitle}
              </p>
            </div>

            <div className="surface-card-soft p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="portal-label">تقدم الخطوات</div>
                <div className="text-sm text-slate-300">
                  الخطوة {activeStep + 1} من {steps.length}
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {steps.map((step, index) => {
                  const active = index === activeStep;
                  const complete = index < activeStep;

                  return (
                    <div
                      key={step}
                      className={`rounded-full px-4 py-2.5 text-sm transition ${
                        active
                          ? "bg-white text-slate-950"
                          : complete
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                            : "border border-white/10 bg-white/[0.03] text-slate-400"
                      }`}
                    >
                      {index + 1}. {step}
                    </div>
                  );
                })}
              </div>
            </div>

            {children}
          </section>

          {hasAside ? (
            <aside className="space-y-4">
              <div className="surface-card-soft p-5">
                <div className="portal-label">الإيقاع</div>
                <div className="mt-3 text-xl font-semibold text-white">خطوة واحدة في كل شاشة</div>
                <div className="mt-2 text-sm leading-7 text-slate-400">
                  إدخال مختصر، زر رئيسي واحد، وتسليم واضح إلى نواة Meyar عند الجاهزية.
                </div>
              </div>

              {aside}
            </aside>
          ) : null}
        </main>
      </div>
    </div>
  );
};
