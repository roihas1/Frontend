import React from "react";

export const adminControlClass =
  "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-colors-nba-blue focus:ring-2 focus:ring-colors-nba-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

export const adminSecondaryBtnClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

export const adminPrimaryBtnClass =
  "rounded-lg bg-colors-nba-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400";

export const adminDangerBtnClass =
  "rounded-lg bg-colors-nba-red px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

interface AdminFormCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  as?: "div" | "form";
  onSubmit?: (e: React.FormEvent) => void;
}

export const AdminFormCard: React.FC<AdminFormCardProps> = ({
  title,
  description,
  children,
  className = "",
  as = "div",
  onSubmit,
}) => {
  const body = (
    <>
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </>
  );

  if (as === "form") {
    return (
      <form
        onSubmit={onSubmit}
        className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
      >
        {body}
      </form>
    );
  }

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      {body}
    </div>
  );
};

interface AdminFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AdminField: React.FC<AdminFieldProps> = ({
  label,
  htmlFor,
  hint,
  required,
  children,
  className = "",
}) => (
  <div className={className}>
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700"
    >
      {label}
      {required && <span className="ml-0.5 text-colors-nba-red">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

export const AdminFieldGrid: React.FC<{
  children: React.ReactNode;
  cols?: 2 | 3;
}> = ({ children, cols = 2 }) => (
  <div
    className={
      cols === 3
        ? "grid gap-4 sm:grid-cols-3"
        : "grid gap-4 sm:grid-cols-2"
    }
  >
    {children}
  </div>
);

interface AdminFormActionsProps {
  cancelLabel?: string;
  submitLabel: string;
  onCancel: () => void;
  loading?: boolean;
  disabled?: boolean;
  submitType?: "button" | "submit";
  onSubmitClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const AdminFormActions: React.FC<AdminFormActionsProps> = ({
  cancelLabel = "Cancel",
  submitLabel,
  onCancel,
  loading = false,
  disabled = false,
  submitType = "submit",
  onSubmitClick,
}) => (
  <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
    <button
      type="button"
      onClick={onCancel}
      disabled={loading}
      className={`${adminSecondaryBtnClass} sm:min-w-[6rem]`}
    >
      {cancelLabel}
    </button>
    <button
      type={submitType}
      onClick={onSubmitClick}
      disabled={disabled || loading}
      className={`${adminPrimaryBtnClass} sm:min-w-[8rem]`}
    >
      {loading ? `${submitLabel}…` : submitLabel}
    </button>
  </div>
);

interface AdminSegmentedOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface AdminSegmentedControlProps<T extends string> {
  value: T | null;
  options: AdminSegmentedOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function AdminSegmentedControl<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: AdminSegmentedControlProps<T>) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-3 py-3 text-left transition disabled:opacity-50 ${
              active
                ? "border-colors-nba-blue bg-blue-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span
              className={`block text-sm font-semibold ${
                active ? "text-colors-nba-blue" : "text-gray-900"
              }`}
            >
              {option.label}
            </span>
            {option.description && (
              <span className="mt-0.5 block text-xs text-gray-500">
                {option.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface AdminChipGroupProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  disabled?: boolean;
}

export const AdminChipGroup: React.FC<AdminChipGroupProps> = ({
  options,
  selected,
  onToggle,
  disabled,
}) => (
  <div className="mt-1.5 flex flex-wrap gap-1.5">
    {options.map((option) => {
      const active = selected.includes(option);
      return (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onToggle(option)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
            active
              ? "bg-colors-nba-blue text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {option}
        </button>
      );
    })}
  </div>
);

interface AdminChoiceGroupProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const AdminChoiceGroup: React.FC<AdminChoiceGroupProps> = ({
  options,
  value,
  onChange,
  disabled,
}) => (
  <div className="mt-1.5 flex flex-wrap gap-1.5">
    {options.map((option) => {
      const active = value === option.value;
      return (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
            active
              ? "bg-colors-nba-blue text-white"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
