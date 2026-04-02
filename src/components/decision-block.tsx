"use client";

import { DecisionBlock as DecisionBlockModel } from "@/types/decision-block";

const statusMap = {
  good: {
    label: "✔ مناسب",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
  },
  partial: {
    label: "⚠ جزئي",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-100"
  },
  blocker: {
    label: "⛔ حاجب",
    className: "border-rose-500/20 bg-rose-500/10 text-rose-100"
  }
} as const;

interface DecisionBlockProps {
  block: DecisionBlockModel;
  title?: string;
  upliftTitle?: string;
  className?: string;
}

export const DecisionBlock = ({
  block,
  title = "كيف تم الوصول إلى القرار؟",
  upliftTitle = "ما الذي يرفع القرار؟",
  className
}: DecisionBlockProps) => (
  <section className={className ?? "summary-card px-5 py-5"}>
    <div className="portal-label">{title}</div>

    <div className="mt-4 space-y-1">
      {block.factors.map((factor, index) => (
        <div
          key={factor.label}
          className={`flex items-start justify-between gap-4 py-4 ${
            index > 0 ? "border-t border-white/8" : ""
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white">{factor.label}</div>
            <div className="mt-2 text-sm leading-7 text-slate-300">{factor.note}</div>
          </div>
          <span
            className={`inline-flex shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${statusMap[factor.status].className}`}
          >
            {statusMap[factor.status].label}
          </span>
        </div>
      ))}
    </div>

    <div className="mt-4 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="text-[11px] tracking-[0.16em] text-slate-500">{upliftTitle}</div>
      <div className="mt-3 space-y-2">
        {block.upliftActions.slice(0, 3).map((action) => (
          <div key={action} className="text-sm leading-7 text-slate-300">
            {action}
          </div>
        ))}
      </div>
    </div>
  </section>
);
