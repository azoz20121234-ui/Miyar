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
    className={`rounded-[28px] border border-white/8 bg-panel/80 p-6 shadow-panel backdrop-blur ${className}`}
  >
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        {eyebrow ? <div className="text-xs text-accent">{eyebrow}</div> : null}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description ? <p className="max-w-3xl text-sm leading-7 text-slate-300">{description}</p> : null}
      </div>
    </div>
    {children}
  </section>
);
