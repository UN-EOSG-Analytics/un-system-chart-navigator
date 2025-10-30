import { Check } from 'lucide-react';

interface ToastProps {
    message: string;
    show: boolean;
}

export function Toast({ message, show }: ToastProps) {
    if (!show) return null;
    
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-600 px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 z-50">
            <Check size={16} className="text-green-600 flex-shrink-0" />
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
}
