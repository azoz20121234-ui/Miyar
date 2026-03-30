"use client";

import { getRoleConfig } from "@/lib/role-model";
import { useAssessment } from "@/store/assessment-context";

const formatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short"
});

export const DecisionTimeline = () => {
  const { caseRecord } = useAssessment();

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Decision Timeline</div>
      <div className="mt-4 space-y-4">
        {[...caseRecord.timeline].reverse().map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="mt-1 h-3 w-3 rounded-full bg-white/50" />
            <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-white">{item.action}</div>
                <div className="text-xs text-slate-500">{formatter.format(new Date(item.at))}</div>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {getRoleConfig(item.actorRole).label}
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">{item.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
