"use client";

import { Search } from "lucide-react";
import { forwardRef, useState } from "react";

interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** HTML id for the input */
  id: string;
  /** ARIA label for accessibility */
  ariaLabel: string;
}

/**
 * SearchInput - A reusable search input component
 *
 * Wraps the native input element with consistent styling and behavior
 * for search functionality in the UN System Chart Navigator.
 */
const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "Search for UN entities...",
      id,
      ariaLabel,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const hasValue = value.trim().length > 0;
    const isActive = isFocused || hasValue || isHovered;

    return (
      <div
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <label htmlFor={id} className="sr-only">
          {ariaLabel}
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search
            className="h-4 w-4 text-un-blue"
            aria-hidden="true"
          />
        </div>
        <input
          ref={ref}
          type="text"
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`block h-10 w-full touch-manipulation rounded-lg border py-2 pr-3 pl-10 text-base transition-colors focus:border-un-blue focus:ring-1 focus:ring-un-blue focus:outline-none ${
            hasValue
              ? "border-un-blue bg-un-blue/10 text-un-blue placeholder-un-blue"
              : isActive
                ? "border-un-blue bg-white text-un-blue placeholder-un-blue"
                : "border-gray-200 bg-white text-gray-700 placeholder-gray-500"
          }`}
          aria-label={ariaLabel}
        />
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
