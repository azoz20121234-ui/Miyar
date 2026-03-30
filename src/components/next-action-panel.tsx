"use client";

import Link from "next/link";

import { useAssessment } from "@/store/assessment-context";

const buttonToneMap = {
  primary: "bg-white text-slate-950 hover:bg-slate-200",
  secondary: "border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/5",
  danger: "bg-rose-500/90 text-white hover:bg-rose-400",
  neutral: "border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/5"
} as const;

const disabledClasses = "cursor-not-allowed border border-white/10 bg-white/[0.02] text-slate-500";

const ActionButton = ({
  label,
  tone,
  disabled,
  href,
  onClick
}: {
  label: string;
  tone: keyof typeof buttonToneMap;
  disabled: boolean;
  href?: string;
  onClick?: () => void;
}) => {
  const className = `rounded-full px-4 py-3 text-center text-sm font-semibold transition ${
    disabled ? disabledClasses : buttonToneMap[tone]
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {label}
    </button>
  );
};

export const NextActionPanel = () => {
  const { caseWorkflow, transitionCase, completeStageAction } = useAssessment();

  const primaryAction = caseWorkflow.primaryAction;
  const secondaryActions = caseWorkflow.transitionActions.filter(
    (action) => action.id !== primaryAction.id
  );

  const handleAction = (id: string, kind: "transition" | "stage-action" | "link") => {
    if (kind === "transition") {
      transitionCase(id);
      return;
    }

    if (kind === "stage-action") {
      completeStageAction(id);
    }
  };

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Next Action</div>
      <div className="mt-3 text-lg font-semibold text-white">{primaryAction.label}</div>
      <div className="mt-2 text-sm leading-6 text-slate-400">{primaryAction.description}</div>

      <div className="mt-4">
        <ActionButton
          label={primaryAction.label}
          tone={primaryAction.tone}
          disabled={primaryAction.disabled}
          href={primaryAction.href}
          onClick={() =>
            handleAction(primaryAction.id, primaryAction.kind)
          }
        />
      </div>

      {primaryAction.disabled && primaryAction.reasons.length > 0 ? (
        <div className="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {primaryAction.reasons[0]}
        </div>
      ) : null}

      {secondaryActions.length > 0 ? (
        <div className="mt-5 space-y-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Transition Buttons</div>
          <div className="space-y-3">
            {secondaryActions.map((action) => (
              <div key={action.id} className="space-y-2">
                <ActionButton
                  label={action.label}
                  tone={action.tone}
                  disabled={action.disabled}
                  onClick={() => handleAction(action.id, action.kind)}
                />
                {action.disabled && action.reasons.length > 0 ? (
                  <div className="text-xs text-slate-500">{action.reasons[0]}</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
