"use client";

import { StatusPill } from "@/components/status-pill";
import { DecisionLogicSummary } from "@/types/decision-logic";

const statusLabelMap = {
  positive: "مناسب",
  partial: "جزئي",
  blocked: "حاجب"
} as const;

const statusToneMap = {
  positive: "success" as const,
  partial: "warning" as const,
  blocked: "danger" as const
} as const;

interface DecisionLogicBlockProps {
  title: string;
  summary: DecisionLogicSummary;
  upliftTitle: string;
  variant?: "compact" | "report";
}

export const DecisionLogicBlock = ({
  title,
  summary,
  upliftTitle,
  variant = "compact"
}: DecisionLogicBlockProps) => (
  <section className={variant === "report" ? "space-y-4" : "summary-card px-5 py-5"}>
    <div className="portal-label">{title}</div>
    <div className="mt-3 text-sm leading-7 text-slate-300">{summary.overallNarrative}</div>

    <div className="mt-5 space-y-3">
      {summary.items.map((item) => (
        <div key={item.key} className="surface-card-muted px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">{item.label}</div>
            <StatusPill
              label={statusLabelMap[item.status]}
              tone={statusToneMap[item.status]}
            />
          </div>
          <div className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</div>
        </div>
      ))}
    </div>

    <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="text-[11px] tracking-[0.16em] text-slate-500">{upliftTitle}</div>
      {summary.decisionShiftHint ? (
        <div className="mt-3 text-sm font-medium leading-7 text-white">
          {summary.decisionShiftHint}
        </div>
      ) : null}
      <div className="mt-3 space-y-2">
        {summary.upliftActions.slice(0, 3).map((action) => (
          <div key={action} className="text-sm leading-7 text-slate-300">
            {action}
          </div>
        ))}
      </div>
    </div>
  </section>
);
