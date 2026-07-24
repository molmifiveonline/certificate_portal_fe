import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils/utils";
import { getCommonFieldValidation } from "../../../lib/utils/validation";
import { Input } from "../../../components/ui/Input";

export const InputField = ({
  label,
  name,
  type = "text",
  required,
  readOnly,
  placeholder,
  register,
  errors,
  defaultValue,
  rows = 3,
  ...props
}) => {
  const validation = getCommonFieldValidation({ label, name, type, required });

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          value={props.value}
          onChange={props.onChange}
          rows={rows}
          readOnly={readOnly}
          disabled={props.disabled}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-y",
            "bg-slate-50/50 border-slate-200",
            (readOnly || props.disabled) && "bg-slate-100 cursor-not-allowed text-slate-500",
            props.className,
          )}
          {...props}
        />
      ) : (
        <Input
          type={type}
          {...(register ? register(name, validation.rules) : { name, defaultValue, onChange: props.onChange })}
          {...validation.inputProps}
          readOnly={readOnly}
          placeholder={placeholder || (type === "date" ? "DD-MM-YYYY" : "")}
          className={cn(
            "bg-slate-50/50 border-slate-200",
            readOnly && "bg-slate-100 cursor-not-allowed text-slate-500",
          )}
          {...props}
        />
      )}
      {errors && errors[name] && (
        <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

export const SelectField = ({
  label,
  name,
  options,
  required,
  disabled,
  register,
  errors,
  children,
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-slate-700 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        {...(register ? register(name, {
          required: required ? `${label} is required` : false,
        }) : { name })}
        disabled={disabled}
        className={cn(
          "w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm outline-none appearance-none cursor-pointer",
          disabled && "bg-slate-100 cursor-not-allowed text-slate-500",
        )}
      >
        <option value="">Select {label}</option>
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
    {errors && errors[name] && (
      <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>
    )}
  </div>
);


