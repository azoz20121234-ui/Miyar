interface StatusPillProps {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}

const toneMap: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-100",
  danger: "border-rose-500/20 bg-rose-500/10 text-rose-100",
  neutral: "border-white/10 bg-white/[0.045] text-slate-200"
};

export const StatusPill = ({ label, tone = "neutral" }: StatusPillProps) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.01em] ${toneMap[tone]}`}
  >
    {label}
  </span>
);
