'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode } from 'react';

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
                    className={`
            relative w-full lg:w-72 lg:flex-shrink-0 h-10 
            flex items-center gap-3 px-3 
            border rounded-lg 
            text-base
            touch-manipulation transition-colors
            ${isFiltered
                            ? 'bg-un-blue/10 border-un-blue text-un-blue hover:border-un-blue'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-un-blue/10 hover:border-un-blue hover:text-un-blue'
                        }
          `}
                    aria-label={ariaLabel}
                >
                    <div className="flex-shrink-0">
                        {icon}
                    </div>
                    <span className="truncate flex-1 text-left">
                        {triggerText}
                    </span>
                    <div className="flex-shrink-0 ml-auto">
                        {open ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-max max-w-[calc(100vw-2rem)] sm:max-w-sm p-1 bg-white border border-gray-200 shadow-lg"
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
                                className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-un-blue/10 hover:text-un-blue cursor-pointer transition-colors w-full text-left"
                            >
                                {option.color && (
                                    <div className={`${option.color} w-4 h-4 rounded flex-shrink-0`}></div>
                                )}
                                {option.icon && (
                                    <div className="flex-shrink-0">
                                        {option.icon}
                                    </div>
                                )}
                                <span className="text-sm flex-1">
                                    {option.label}
                                    {option.count !== undefined && (
                                        <span className="opacity-60"> ({option.count})</span>
                                    )}
                                </span>
                                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                    {showCheckmark && (
                                        <Check className="h-4 w-4 text-un-blue" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
