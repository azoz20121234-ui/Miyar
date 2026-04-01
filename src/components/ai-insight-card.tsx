interface AIInsightCardProps {
  title: string;
  lines: string[];
  eyebrow?: string;
  tone?: "cyan" | "amber";
  className?: string;
}

export const AIInsightCard = ({
  title,
  lines,
  eyebrow = "تفسير",
  tone = "cyan",
  className = ""
}: AIInsightCardProps) => (
  <section className={`ai-insight-card ${tone === "amber" ? "ai-insight-card-amber" : ""} ${className}`}>
    <div className="portal-label">{eyebrow}</div>
    <div className="mt-3 text-lg font-semibold text-white">{title}</div>
    <div className="mt-4 space-y-2.5">
      {lines.slice(0, 3).map((line) => (
        <div key={line} className="text-sm leading-7 text-slate-200">
          {line}
        </div>
      ))}
    </div>
  </section>
);
