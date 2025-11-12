import { RotateCcw } from 'lucide-react';

interface ResetButtonProps {
    onClick: () => void;
    showLabel?: boolean;
    className?: string;
}

export default function ResetButton({ onClick, showLabel = false, className = '' }: ResetButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center justify-center gap-2 
                rounded-md transition-colors text-sm 
                text-gray-500 bg-white hover:bg-un-blue/10 hover:text-un-blue 
                border border-gray-200 hover:border-un-blue 
                flex-shrink-0 font-normal
                ${showLabel ? 'h-10 px-3' : 'h-10 w-10'}
                ${className}
            `}
            aria-label="Clear filters and search"
            title="Clear filters and search"
        >
            <RotateCcw className="h-4 w-4" />
            {showLabel && <span>Reset</span>}
        </button>
    );
}
