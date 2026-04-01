import { ReactNode } from "react";

interface ExternalFlowCardProps {
  title: string;
  subtitle: string;
  notice?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const ExternalFlowCard = ({
  title,
  subtitle,
  notice,
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
    </div>

    <div className="mt-7 space-y-5">{children}</div>

    {footer ? <div className="mt-8 border-t border-white/10 pt-6">{footer}</div> : null}
  </section>
);
