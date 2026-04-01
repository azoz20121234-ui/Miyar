import { TextareaHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface ExternalBaseFieldProps {
  label: string;
  hint?: string;
}

type ExternalInputProps = ExternalBaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type ExternalTextareaProps = ExternalBaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type ExternalSelectProps = ExternalBaseFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    as: "select";
    options: Array<{ label: string; value: string }>;
  };

type ExternalFieldProps =
  | ExternalInputProps
  | ExternalTextareaProps
  | ExternalSelectProps;

const controlClassName =
  "mt-3 w-full rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-white/20 focus:bg-white/[0.05]";

export const ExternalField = (props: ExternalFieldProps) => {
  const { label, hint } = props;

  return (
    <label className="block">
      <div className="text-sm font-medium text-white">{label}</div>
      {hint ? <div className="mt-1 text-xs leading-6 text-slate-500">{hint}</div> : null}

      {props.as === "textarea" ? (
        <textarea {...props} className={`${controlClassName} min-h-[124px] resize-y`} />
      ) : props.as === "select" ? (
        <select {...props} className={controlClassName}>
          {props.options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-950 text-white">
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input {...props} className={controlClassName} />
      )}
    </label>
  );
};
