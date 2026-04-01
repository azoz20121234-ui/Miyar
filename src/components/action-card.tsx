import Link from "next/link";
import { ReactNode } from "react";

interface ActionCardProps {
  eyebrow?: string;
  title: string;
  problem?: string;
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
    : `${ctaBase} border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]`;
  const resolvedProblem = problem ?? title;
  const resolvedReason = reason ?? description;
  const shellClass =
    variant === "primary"
      ? "surface-card p-6 sm:p-7"
      : "surface-card-soft p-5";

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

      <div className="mt-5 space-y-4">
        <div className="surface-card-muted px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">المشكلة</div>
          <div className="mt-2 text-sm leading-7 text-white">{resolvedProblem}</div>
        </div>

        {resolvedReason ? (
          <div className="surface-card-muted px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">السبب</div>
            <div className="mt-2 text-sm leading-7 body-soft">{resolvedReason}</div>
          </div>
        ) : null}

        {impact ? (
          <div className="surface-card-muted px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">الأثر</div>
            <div className="mt-2 text-sm leading-7 text-white">{impact}</div>
          </div>
        ) : null}
      </div>

      {meta ? <div className="mt-4 text-xs uppercase tracking-[0.14em] text-slate-500">{meta}</div> : null}

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
