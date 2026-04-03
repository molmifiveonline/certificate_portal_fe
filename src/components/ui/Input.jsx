import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "../../lib/utils/utils";

const Input = React.forwardRef(({ className, type, onChange, onBlur, value, defaultValue, ...props }, ref) => {
  const internalRef = React.useRef(null);
  const combinedRef = (node) => {
    internalRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const [hasValue, setHasValue] = React.useState(!!value || !!defaultValue);

  // Re-sync value when props change or when mounting
  React.useEffect(() => {
    const checkValue = () => {
      const val = internalRef.current?.value || value || defaultValue;
      setHasValue(!!val);
    };
    checkValue();
    // Also check after a small delay in case RHF updates the value asynchronously
    const timer = setTimeout(checkValue, 100);
    return () => clearTimeout(timer);
  }, [value, defaultValue]);

  const inputElement = (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        type === "date" ? "date-input-custom cursor-pointer pr-10" : "cursor-text",
        className,
      )}
      onChange={(e) => {
        setHasValue(!!e.target.value);
        onChange?.(e);
      }}
      onBlur={(e) => {
        setHasValue(!!e.target.value);
        onBlur?.(e);
      }}
      value={value}
      defaultValue={defaultValue}
      data-has-value={hasValue}
      ref={combinedRef}
      {...props}
    />
  );

  if (type === "date") {
    return (
      <div className="date-input-wrapper w-full">
        {inputElement}
        <Calendar size={18} className="calendar-icon" />
      </div>
    );
  }

  return inputElement;
});
Input.displayName = "Input";

export { Input };
