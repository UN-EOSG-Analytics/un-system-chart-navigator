import { X } from 'lucide-react';

interface CloseButtonProps {
    onClick: () => void;
}

export default function CloseButton({ onClick }: CloseButtonProps) {
    return (
        <button
            onClick={onClick}
            className="
                flex items-center justify-center h-8 w-8 rounded-md
                transition-colors text-sm
                text-gray-600 bg-gray-200 hover:bg-gray-300 hover:text-gray-800
                border border-gray-300 hover:border-gray-400
                flex-shrink-0 cursor-pointer font-normal
                focus:outline-none focus:ring-2 focus:ring-gray-300
            "
            aria-label="Close modal"
            title="Close modal"
        >
            <X className="h-4 w-4" />
        </button>
    );
}
