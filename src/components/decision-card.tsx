import { ReactNode } from "react";

interface DecisionCardProps {
  eyebrow?: string;
  title: string;
  summary?: string;
  value?: string;
  badge?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const DecisionCard = ({
  eyebrow,
  title,
  summary,
  value,
  badge,
  footer,
  children,
  className = ""
}: DecisionCardProps) => (
  <section className={`surface-card p-6 sm:p-7 ${className}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        {eyebrow ? <div className="portal-label">{eyebrow}</div> : null}
        <div className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[30px]">
          {title}
        </div>
        {summary ? <div className="max-w-2xl text-sm leading-7 body-muted">{summary}</div> : null}
      </div>
      {badge ? <div className="shrink-0">{badge}</div> : null}
    </div>

    {value ? (
      <div className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-[52px]">
        {value}
      </div>
    ) : null}

    {children ? <div className="mt-6">{children}</div> : null}
    {footer ? <div className="mt-6">{footer}</div> : null}
  </section>
);
