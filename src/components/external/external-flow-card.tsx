import { ReactNode } from "react";

interface ExternalFlowCardProps {
  title: string;
  subtitle: string;
  notice?: string;
  purpose?: string;
  impact?: string;
  nextStepHint?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const ExternalFlowCard = ({
  title,
  subtitle,
  notice,
  purpose,
  impact,
  nextStepHint,
  children,
  footer
}: ExternalFlowCardProps) => (
  <section className="surface-card p-7 sm:p-8">
    <div className="max-w-3xl">
      <h2 className="text-[28px] font-semibold text-white sm:text-[34px]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">{subtitle}</p>
      {notice ? (
        <div className="mt-4 inline-flex rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100">
          {notice}
        </div>
      ) : null}
      {purpose || impact || nextStepHint ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {purpose ? (
            <div className="surface-card-muted px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">لماذا هذه الخطوة؟</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">{purpose}</div>
            </div>
          ) : null}
          {impact ? (
            <div className="surface-card-muted px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">كيف تؤثر على القرار؟</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">{impact}</div>
            </div>
          ) : null}
          {nextStepHint ? (
            <div className="surface-card-muted px-4 py-4">
              <div className="text-[11px] tracking-[0.16em] text-slate-500">ماذا يحدث بعدها؟</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">{nextStepHint}</div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>

    <div className="mt-7 space-y-5">{children}</div>

    {footer ? <div className="mt-8 border-t border-white/10 pt-6">{footer}</div> : null}
  </section>
);
