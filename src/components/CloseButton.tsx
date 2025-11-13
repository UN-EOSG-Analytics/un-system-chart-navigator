import { X } from "lucide-react";

interface CloseButtonProps {
  onClick: () => void;
}

export default function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-gray-200 text-sm font-normal text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-300 hover:text-gray-800 focus:ring-2 focus:ring-gray-300 focus:outline-none"
      aria-label="Close modal"
      title="Close modal"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
