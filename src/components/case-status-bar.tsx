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
    <section className="surface-card mb-6 p-5">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
        <div>
          <div className="portal-label">Case Status</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="text-2xl font-semibold text-white">{caseWorkflow.currentStateLabel}</div>
            <StatusPill label={`Case #${caseRecord.id}`} tone={toneMap.neutral} />
          </div>
        </div>

        <div>
          <div className="portal-label">Next Stage</div>
          <div className="mt-3 text-lg font-semibold text-white">{caseWorkflow.nextStageLabel}</div>
          <div className="mt-1 text-sm body-muted">ماذا سيحدث بعد هذه المرحلة</div>
        </div>

        <div>
          <div className="portal-label">Current Owner</div>
          <div className="mt-3 text-lg font-semibold text-white">{caseWorkflow.currentOwnerLabel}</div>
          <div className="mt-1 text-sm body-muted">المسؤول الحالي عن التحريك</div>
        </div>
      </div>
    </section>
  );
};
