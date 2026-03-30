interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}

const toneMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  success: "from-emerald-500/12 to-emerald-500/4",
  warning: "from-amber-500/12 to-amber-500/4",
  danger: "from-rose-500/12 to-rose-500/4",
  neutral: "from-white/10 to-white/5"
};

export const MetricCard = ({
  label,
  value,
  hint,
  tone = "neutral"
}: MetricCardProps) => (
  <div
    className={`rounded-3xl border border-white/8 bg-gradient-to-br ${toneMap[tone]} p-5 shadow-glow`}
  >
    <div className="text-xs text-slate-400">{label}</div>
    <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
    <p className="mt-2 text-sm leading-6 text-slate-300">{hint}</p>
  </div>
);
