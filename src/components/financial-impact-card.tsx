import { StatusPill } from "@/components/status-pill";
import { FinancialSurfaceTone } from "@/types/financial";

interface FinancialImpactItem {
  label: string;
  value: string;
  hint?: string;
  tone?: FinancialSurfaceTone;
}

interface FinancialImpactCardProps {
  eyebrow?: string;
  title: string;
  summary: string;
  signalLabel: string;
  signalTone: FinancialSurfaceTone;
  items: FinancialImpactItem[];
  footnote?: string;
  conclusion?: string;
  className?: string;
}

const shellToneClass: Record<FinancialSurfaceTone, string> = {
  positive:
    "border-emerald-400/18 bg-[linear-gradient(180deg,rgba(8,24,18,0.96)_0%,rgba(8,16,13,0.98)_100%)]",
  watch:
    "border-amber-400/18 bg-[linear-gradient(180deg,rgba(28,20,8,0.96)_0%,rgba(16,12,7,0.98)_100%)]",
  risk:
    "border-rose-400/18 bg-[linear-gradient(180deg,rgba(30,11,14,0.96)_0%,rgba(17,9,11,0.98)_100%)]",
  neutral:
    "border-cyan-400/15 bg-[linear-gradient(180deg,rgba(10,18,30,0.96)_0%,rgba(10,14,23,0.98)_100%)]"
};

const hintToneClass: Record<FinancialSurfaceTone, string> = {
  positive: "text-emerald-200",
  watch: "text-amber-200",
  risk: "text-rose-200",
  neutral: "text-slate-400"
};

const pillTone = (tone: FinancialSurfaceTone) => {
  if (tone === "positive") return "success";
  if (tone === "watch") return "warning";
  if (tone === "risk") return "danger";
  return "neutral";
};

export const FinancialImpactCard = ({
  eyebrow = "الأثر المالي",
  title,
  summary,
  signalLabel,
  signalTone,
  items,
  footnote,
  conclusion,
  className = ""
}: FinancialImpactCardProps) => (
  <section
    className={`rounded-[30px] border p-6 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.85)] sm:p-7 ${shellToneClass[signalTone]} ${className}`}
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl">
        <div className="portal-label">{eyebrow}</div>
        <div className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[30px]">
          {title}
        </div>
        <div className="mt-3 text-sm leading-7 text-slate-300">{summary}</div>
      </div>
      <div className="shrink-0">
        <StatusPill label={signalLabel} tone={pillTone(signalTone)} />
      </div>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="summary-card px-4 py-4">
          <div className="text-[11px] tracking-[0.16em] text-slate-500">{item.label}</div>
          <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
          {item.hint ? (
            <div
              className={`mt-2 text-xs leading-6 ${
                item.tone ? hintToneClass[item.tone] : "text-slate-400"
              }`}
            >
              {item.hint}
            </div>
          ) : null}
        </div>
      ))}
    </div>

    {conclusion ? (
      <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white">
        {conclusion}
      </div>
    ) : null}

    {footnote ? <div className="mt-4 text-xs leading-6 text-slate-400">{footnote}</div> : null}
  </section>
);
