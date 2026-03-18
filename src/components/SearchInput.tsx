"use client";
// CANONICAL CONTROL STYLE — all interactive controls in this project must match this component.
// See also: FilterDropdown.tsx

import { Search } from "lucide-react";
import { forwardRef, useState } from "react";

interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Callback when Enter is pressed */
  onEnter?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** HTML id for the input */
  id: string;
  /** ARIA label for accessibility */
  ariaLabel: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onEnter,
      placeholder = "Search for UN entities...",
      id,
      ariaLabel,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.trim().length > 0;
    const isActive = isFocused || hasValue;

    return (
      <div className="group relative w-full">
        <label htmlFor={id} className="sr-only">
          {ariaLabel}
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search
            className={`h-4 w-4 transition-colors ${isActive ? "text-un-blue" : "text-slate-400 group-hover:text-un-blue"}`}
            aria-hidden="true"
            suppressHydrationWarning
          />
        </div>
        <input
          ref={ref}
          type="text"
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
          onKeyUp={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`block h-10 w-full touch-manipulation rounded-lg border px-3 pl-9 text-sm transition-colors focus:outline-none ${
            isActive
              ? "border-un-blue bg-un-blue/5 text-un-blue placeholder-un-blue/50"
              : "border-slate-300 bg-white text-slate-400 placeholder-slate-400 hover:border-un-blue hover:text-un-blue hover:placeholder-un-blue/70"
          }`}
          aria-label={ariaLabel}
          suppressHydrationWarning
        />
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
