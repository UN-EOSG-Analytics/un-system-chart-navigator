import { Check } from "lucide-react";

interface ToastProps {
  message: string;
  show: boolean;
}

export function Toast({ message, show }: ToastProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-2.5 rounded-lg bg-white px-4 py-2.5 text-gray-600 shadow-lg fade-in slide-in-from-bottom-2">
      <Check size={16} className="flex-shrink-0 text-green-600" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
