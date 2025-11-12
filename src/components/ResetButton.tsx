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
                text-gray-600 bg-gray-200 hover:bg-gray-300 hover:text-gray-800 
                border border-gray-300 hover:border-gray-400 
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
