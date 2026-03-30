"use client";

import { useAssessment } from "@/store/assessment-context";

export const ReportActions = () => {
  const { bundle, standards, explainability, caseRecord } = useAssessment();

  const exportJson = () => {
    const payload = JSON.stringify(
      {
        bundle,
        standards,
        explainability,
        caseRecord
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "meyar-executive-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
      >
        طباعة التقرير
      </button>
      <button
        type="button"
        onClick={exportJson}
        className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent transition hover:bg-accent/20"
      >
        تنزيل JSON
      </button>
    </div>
  );
};
