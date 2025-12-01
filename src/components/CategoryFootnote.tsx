import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { footnoteDefinitions } from "@/lib/constants";
import { Info } from "lucide-react";

interface CategoryFootnoteProps {
  footnoteNumbers: number[];
}

export default function CategoryFootnote({
  footnoteNumbers,
}: CategoryFootnoteProps) {
  return (
    <Tooltip delayDuration={50} disableHoverableContent>
      <TooltipTrigger asChild>
        <Info className="ml-1.5 inline-block h-3.5 w-3.5 cursor-help text-gray-400 hover:text-gray-600" />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-fit max-w-xs border border-slate-200 bg-white px-2.5 py-1.5 text-left text-slate-800 shadow-lg"
        hideWhenDetached
        avoidCollisions={true}
        collisionPadding={12}
      >
        <div className="text-left text-xs leading-snug text-wrap">
          <div className="space-y-1.5">
            {footnoteNumbers.map((num) => (
              <div key={num} className="flex items-start gap-2">
                <span className="flex-shrink-0 font-medium">{num}</span>
                <span className="text-wrap">{footnoteDefinitions[num]}</span>
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
