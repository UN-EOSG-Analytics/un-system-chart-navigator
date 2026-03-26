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
      className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-400 transition-colors hover:border-un-blue hover:text-un-blue ${showLabel ? "h-10 px-3" : "h-10 w-10"} ${className} `}
      aria-label="Clear filters and search"
      title="Clear filters and search"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {showLabel && <span>Reset</span>}
    </button>
  );
}
