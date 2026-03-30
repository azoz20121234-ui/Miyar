import { ReactNode } from "react";

interface SectionCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const SectionCard = ({
  eyebrow,
  title,
  description,
  children,
  className = ""
}: SectionCardProps) => (
  <section
    className={`rounded-[24px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)] ${className}`}
  >
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1.5">
        {eyebrow ? (
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">{eyebrow}</div>
        ) : null}
        <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-6 text-slate-400">{description}</p> : null}
      </div>
    </div>
    {children}
  </section>
);
