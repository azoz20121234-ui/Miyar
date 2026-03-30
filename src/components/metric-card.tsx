interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}

const toneMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  success: "border-emerald-500/14",
  warning: "border-amber-500/14",
  danger: "border-rose-500/14",
  neutral: "border-white/10"
};

export const MetricCard = ({
  label,
  value,
  hint,
  tone = "neutral"
}: MetricCardProps) => (
  <div
    className={`rounded-[24px] border bg-white/[0.03] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.14)] ${toneMap[tone]}`}
  >
    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
    <div className="mt-3 text-2xl font-semibold text-white sm:text-[28px]">{value}</div>
    <p className="mt-2 text-sm leading-6 text-slate-400">{hint}</p>
  </div>
);
