import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

const MultiSelectInput = ({ value = [], onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 flex items-center justify-between cursor-pointer focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-slate-600"
      >
        <span className="truncate">
          {selectedLabels.length > 0
            ? selectedLabels.join(", ")
            : "Select trainers..."}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto p-1">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm text-slate-600"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${value.includes(opt.value) ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}
              >
                {value.includes(opt.value) && (
                  <Check size={12} className="text-white" />
                )}
              </div>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectInput;
