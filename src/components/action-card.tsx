import Link from "next/link";
import { ReactNode } from "react";

interface ActionCardProps {
  eyebrow?: string;
  title: string;
  problem?: string;
  context?: string;
  reason?: string;
  impact?: string;
  description?: string;
  meta?: string;
  status?: ReactNode;
  variant?: "primary" | "secondary";
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
  };
  className?: string;
}

const ctaBase =
  "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition";

export const ActionCard = ({
  eyebrow,
  title,
  problem,
  context,
  reason,
  impact,
  description,
  meta,
  status,
  variant = "secondary",
  cta,
  className = ""
}: ActionCardProps) => {
  const ctaClass = cta?.disabled
    ? `${ctaBase} pointer-events-none cursor-not-allowed border border-white/10 bg-white/[0.03] text-slate-500`
    : variant === "primary"
      ? `${ctaBase} bg-white text-slate-950 hover:bg-slate-200`
      : `${ctaBase} border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]`;
  const resolvedProblem = problem ?? title;
  const resolvedContext = context ?? reason ?? description ?? resolvedProblem;
  const shellClass =
    variant === "primary"
      ? "decision-card p-7 sm:p-8"
      : "state-card p-5";

  return (
    <section className={`${shellClass} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? <div className="portal-label mb-2">{eyebrow}</div> : null}
          <div
            className={`${variant === "primary" ? "text-[26px]" : "text-base"} font-semibold tracking-[-0.02em] text-white`}
          >
            {title}
          </div>
        </div>
        {status ? <div className="shrink-0">{status}</div> : null}
      </div>

      <div className="mt-6 space-y-4">
        {impact ? (
          <div className="summary-card px-5 py-5">
            <div className="text-[11px] tracking-[0.16em] text-slate-500">الأثر المتوقع</div>
            <div
              className={`mt-3 ${variant === "primary" ? "text-xl leading-9" : "text-base leading-8"} font-medium text-white`}
            >
              {impact}
            </div>
          </div>
        ) : null}

        <div className="surface-card-muted px-4 py-4">
          <div className="text-[11px] tracking-[0.16em] text-slate-500">السياق</div>
          <div className="mt-2 text-sm leading-7 text-white">{resolvedContext}</div>
        </div>

        {resolvedProblem !== resolvedContext ? (
          <div className="surface-card-muted px-4 py-4">
            <div className="text-[11px] tracking-[0.16em] text-slate-500">النقطة الحالية</div>
            <div className="mt-2 text-sm leading-7 body-soft">{resolvedProblem}</div>
          </div>
        ) : null}
      </div>

      {meta ? <div className="mt-4 text-xs tracking-[0.14em] text-slate-500">{meta}</div> : null}

      {cta ? (
        <div className="mt-5">
          {cta.href ? (
            <Link href={cta.href} className={ctaClass}>
              {cta.label}
            </Link>
          ) : (
            <button type="button" onClick={cta.onClick} disabled={cta.disabled} className={ctaClass}>
              {cta.label}
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
};
