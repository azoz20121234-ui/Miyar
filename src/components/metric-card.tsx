interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}

const toneMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  success: "border-emerald-500/18",
  warning: "border-amber-500/18",
  danger: "border-rose-500/18",
  neutral: "border-white/10"
};

export const MetricCard = ({
  label,
  value,
  hint,
  tone = "neutral"
}: MetricCardProps) => (
  <div
    className={`surface-card-soft p-5 ${toneMap[tone]}`}
  >
    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
    <div className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[28px]">
      {value}
    </div>
    <p className="mt-2 text-sm leading-6 body-muted">{hint}</p>
  </div>
);
