import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface CategoryFootnoteProps {
  text: string;
}

export default function CategoryFootnote({ text }: CategoryFootnoteProps) {
  return (
    <Tooltip delayDuration={50} disableHoverableContent>
      <TooltipTrigger asChild>
        <Info className="ml-1.5 inline-block h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="max-w-xs border border-slate-200 bg-white text-left text-slate-800 shadow-lg sm:max-w-sm"
        hideWhenDetached
        avoidCollisions={true}
        collisionPadding={12}
      >
        <div className="max-w-xs p-1 sm:max-w-sm">
          <p className="text-left text-xs leading-snug">
            {text}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
