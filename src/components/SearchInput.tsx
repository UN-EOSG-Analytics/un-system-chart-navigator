'use client';

import { Search } from 'lucide-react';
import { forwardRef, useState } from 'react';

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
    ({ value, onChange, placeholder = 'Search for UN entities...', id, ariaLabel }, ref) => {
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search 
                        className={`h-4 w-4 transition-colors ${isActive ? 'text-un-blue' : 'text-gray-500'}`} 
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
                    className={`block w-full h-10 pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-un-blue focus:ring-1 focus:ring-un-blue text-base touch-manipulation transition-colors ${
                        hasValue 
                            ? 'bg-un-blue/10 border-un-blue text-un-blue placeholder-un-blue' 
                            : isActive
                                ? 'bg-white border-un-blue text-un-blue placeholder-un-blue'
                                : 'bg-white border-gray-200 text-gray-700 placeholder-gray-500'
                    }`}
                    aria-label={ariaLabel}
                />
            </div>
        );
    }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
