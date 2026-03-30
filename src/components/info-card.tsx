import { ReactNode } from "react";

interface InfoCardProps {
  label: string;
  value: string;
  hint?: string;
  badge?: ReactNode;
  className?: string;
}

export const InfoCard = ({
  label,
  value,
  hint,
  badge,
  className = ""
}: InfoCardProps) => (
  <section className={`surface-card-soft p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
        <div className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[28px]">
          {value}
        </div>
        {hint ? <div className="mt-2 text-sm leading-6 body-muted">{hint}</div> : null}
      </div>
      {badge ? <div className="shrink-0">{badge}</div> : null}
    </div>
  </section>
);
