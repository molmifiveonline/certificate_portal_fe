import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "../../lib/utils/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

  // Re-sync value when props change
  React.useEffect(() => {
    setHasValue(!!props.value || !!props.defaultValue);
  }, [props.value, props.defaultValue]);

  const inputElement = (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer",
        type === "date" && "date-input-custom pr-10",
        className,
      )}
      onChange={(e) => {
        setHasValue(!!e.target.value);
        props.onChange?.(e);
      }}
      data-has-value={hasValue}
      ref={ref}
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
