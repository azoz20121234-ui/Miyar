interface StatusPillProps {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}

const toneMap: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  success: "border-emerald-500/25 bg-emerald-500/12 text-emerald-200",
  warning: "border-amber-500/25 bg-amber-500/12 text-amber-200",
  danger: "border-rose-500/25 bg-rose-500/12 text-rose-200",
  neutral: "border-white/10 bg-white/5 text-slate-200"
};

export const StatusPill = ({ label, tone = "neutral" }: StatusPillProps) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${toneMap[tone]}`}
  >
    {label}
  </span>
);
