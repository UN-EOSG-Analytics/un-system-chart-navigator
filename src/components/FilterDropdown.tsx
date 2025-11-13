"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode } from "react";

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
  icon?: ReactNode;
  color?: string;
}

interface FilterDropdownProps {
  /** Whether the popover is open */
  open: boolean;
  /** Callback when the popover open state changes */
  onOpenChange: (open: boolean) => void;
  /** The trigger button icon */
  icon: ReactNode;
  /** The trigger button text */
  triggerText: string;
  /** Whether any filters are active (not showing all) */
  isFiltered: boolean;
  /** Whether all options are active (showing all) */
  allActive: boolean;
  /** The list of filter options */
  options: FilterOption[];
  /** Set of selected option keys */
  selectedKeys: Set<string>;
  /** Callback when an option is toggled */
  onToggle: (key: string) => void;
  /** ARIA label for the trigger button */
  ariaLabel: string;
}

/**
 * FilterDropdown - A reusable filter dropdown component
 *
 * Wraps the shadcn Popover component with custom styling and behavior
 * for filter selections in the UN System Chart Navigator.
 */
export default function FilterDropdown({
  open,
  onOpenChange,
  icon,
  triggerText,
  isFiltered,
  allActive,
  options,
  selectedKeys,
  onToggle,
  ariaLabel,
}: FilterDropdownProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={`relative flex h-10 w-full touch-manipulation items-center gap-3 rounded-lg border px-3 text-base transition-colors lg:w-72 lg:flex-shrink-0 ${
            isFiltered
              ? "border-un-blue bg-un-blue/10 text-un-blue hover:border-un-blue"
              : "border-gray-200 bg-white text-gray-500 hover:border-un-blue hover:bg-un-blue/10 hover:text-un-blue"
          } `}
          aria-label={ariaLabel}
        >
          <div className="flex-shrink-0 text-un-blue">{icon}</div>
          <span className="flex-1 truncate text-left">{triggerText}</span>
          <div className="ml-auto flex-shrink-0">
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-max max-w-[calc(100vw-2rem)] border border-gray-200 bg-white p-1 shadow-lg sm:max-w-sm"
        align="start"
        sideOffset={4}
      >
        <div>
          {options.map((option) => {
            const isSelected = selectedKeys.has(option.key);
            // Only show checkmark if we're in filtered mode (not all options active)
            const showCheckmark = !allActive && isSelected;

            return (
              <button
                key={option.key}
                onClick={() => onToggle(option.key)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-un-blue/10 hover:text-un-blue"
              >
                {option.color && (
                  <div
                    className={`${option.color} h-4 w-4 flex-shrink-0 rounded`}
                  ></div>
                )}
                {option.icon && (
                  <div className="flex-shrink-0">{option.icon}</div>
                )}
                <span className="flex-1 text-sm">
                  {option.label}
                  {option.count !== undefined && (
                    <span className="opacity-60"> ({option.count})</span>
                  )}
                </span>
                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                  {showCheckmark && <Check className="h-4 w-4 text-un-blue" />}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
