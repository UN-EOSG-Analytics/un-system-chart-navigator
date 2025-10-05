'use client';

import * as React from 'react';

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
                ${checked ? 'bg-un-blue' : 'bg-gray-300'}
            `}
        >
            <span
                className={`
                    inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out
                    ${checked ? 'translate-x-5' : 'translate-x-0.5'}
                `}
            />
        </button>
    );
}
