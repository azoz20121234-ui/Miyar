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
    className={`surface-card p-6 ${className}`}
  >
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1.5">
        {eyebrow ? <div className="portal-label">{eyebrow}</div> : null}
        <h2 className="section-title">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-6 body-muted">{description}</p> : null}
      </div>
    </div>
    {children}
  </section>
);
