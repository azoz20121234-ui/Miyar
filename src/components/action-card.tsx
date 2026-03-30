import Link from "next/link";
import { ReactNode } from "react";

interface ActionCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: string;
  status?: ReactNode;
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
  description,
  meta,
  status,
  cta,
  className = ""
}: ActionCardProps) => {
  const ctaClass = cta?.disabled
    ? `${ctaBase} pointer-events-none cursor-not-allowed border border-white/10 bg-white/[0.03] text-slate-500`
    : `${ctaBase} border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]`;

  return (
    <section className={`surface-card-soft p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? <div className="portal-label mb-2">{eyebrow}</div> : null}
          <div className="text-base font-semibold text-white">{title}</div>
          {description ? <div className="mt-2 text-sm leading-7 body-muted">{description}</div> : null}
        </div>
        {status ? <div className="shrink-0">{status}</div> : null}
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
