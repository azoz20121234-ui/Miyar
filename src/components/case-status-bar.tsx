"use client";

import { useAssessment } from "@/store/assessment-context";

import { StatusPill } from "./status-pill";

const toneMap = {
  neutral: "neutral",
  warning: "warning",
  success: "success",
  danger: "danger"
} as const;

export const CaseStatusBar = () => {
  const { caseRecord, caseWorkflow } = useAssessment();

  return (
    <section className="mb-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Case Status</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="text-2xl font-semibold text-white">{caseWorkflow.currentStateLabel}</div>
            <StatusPill
              label={`Case #${caseRecord.id}`}
              tone={toneMap.neutral}
            />
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Next Stage</div>
          <div className="mt-3 text-lg font-semibold text-white">{caseWorkflow.nextStageLabel}</div>
          <div className="mt-1 text-sm text-slate-400">ماذا سيحدث بعد هذه المرحلة</div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Current Owner</div>
          <div className="mt-3 text-lg font-semibold text-white">{caseWorkflow.currentOwnerLabel}</div>
          <div className="mt-1 text-sm text-slate-400">المسؤول الحالي عن التحريك</div>
        </div>
      </div>
    </section>
  );
};
