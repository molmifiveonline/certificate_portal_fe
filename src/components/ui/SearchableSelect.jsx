import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";
import { cn } from "../../lib/utils/utils";

const SearchableSelect = React.forwardRef(
  (
    {
      options = [],
      value = "",
      onChange,
      onBlur,
      placeholder = "Select...",
      searchPlaceholder = "Search...",
      className = "",
      error = false,
      disabled = false,
      name,
      required = false,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Normalize options to [{ value, label, ... }]
    const normalizedOptions = useMemo(() => {
      if (!Array.isArray(options)) return [];
      return options.map((opt) => {
        if (opt === null || opt === undefined) return { value: "", label: "" };
        if (typeof opt === "object") {
          return {
            value: opt.value !== undefined ? String(opt.value) : "",
            label:
              opt.label !== undefined
                ? String(opt.label)
                : String(opt.value || ""),
            raw: opt, // keep raw object for callback
          };
        }
        return {
          value: String(opt),
          label: String(opt),
          raw: opt,
        };
      });
    }, [options]);

    // Find selected option
    const selectedOption = useMemo(() => {
      return normalizedOptions.find((opt) => opt.value === String(value));
    }, [normalizedOptions, value]);

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
      if (!searchTerm.trim()) return normalizedOptions;
      const lowerSearch = searchTerm.toLowerCase();
      return normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(lowerSearch),
      );
    }, [normalizedOptions, searchTerm]);

    // Handle clicking outside to close
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      } else {
        setSearchTerm("");
      }
    }, [isOpen]);

    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
    };

    const handleSelect = (option) => {
      if (onChange) {
        onChange(option.value, option.raw);
      }
      setIsOpen(false);
      if (onBlur) {
        onBlur({ target: { name, value: option.value } });
      }
    };

    const handleClear = (e) => {
      e.stopPropagation();
      if (disabled) return;
      if (onChange) {
        onChange("", null);
      }
      if (onBlur) {
        onBlur({ target: { name, value: "" } });
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    return (
      <div
        ref={containerRef}
        className={cn("relative w-full", className)}
        onKeyDown={handleKeyDown}
      >
        <select
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          <option value="">{placeholder}</option>
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border bg-white/50 px-4 py-2 text-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 text-left cursor-pointer",
            error ? "border-red-500" : "border-slate-200",
            isOpen && "border-blue-500 ring-4 ring-blue-500/10",
          )}
        >
          <span
            className={cn(
              "truncate block",
              !selectedOption && "text-slate-500",
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="flex items-center gap-1.5 ml-2 shrink-0">
            {selectedOption && !required && !disabled && (
              <span
                onClick={handleClear}
                className="p-0.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 transition-transform duration-200",
                isOpen && "transform rotate-180",
              )}
            />
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full min-w-[200px] rounded-xl border border-slate-200 bg-white p-1 text-slate-900 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Search Input */}
            <div className="relative flex items-center border-b border-slate-100 px-3 pb-2 pt-1">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-lg bg-slate-50 pl-8 pr-3 text-sm outline-none border border-transparent focus:border-slate-200 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isChecked = option.value === String(value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-9 pr-3 text-sm outline-none hover:bg-slate-50 text-slate-700 text-left transition-colors",
                        isChecked &&
                          "bg-blue-50/50 font-semibold text-blue-600 hover:bg-blue-50",
                      )}
                    >
                      {isChecked && (
                        <span className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center text-blue-600">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      <span className="truncate">{option.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

SearchableSelect.displayName = "SearchableSelect";

export default SearchableSelect;
