import { RotateCcw } from "lucide-react";

interface ResetButtonProps {
  onClick: () => void;
  showLabel?: boolean;
  className?: string;
}

export default function ResetButton({
  onClick,
  showLabel = false,
  className = "",
}: ResetButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-gray-200 text-xs font-normal text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-300 hover:text-gray-800 ${showLabel ? "h-9 px-2.5" : "h-9 w-9"} ${className} `}
      aria-label="Clear filters and search"
      title="Clear filters and search"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {showLabel && <span>Reset</span>}
    </button>
  );
}
