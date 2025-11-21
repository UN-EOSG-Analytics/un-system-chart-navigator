import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface CategoryFootnoteProps {
  text: string | string[];
}

export default function CategoryFootnote({ text }: CategoryFootnoteProps) {
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
          {Array.isArray(text) ? (
            // Array: render as bullet points
            <div className="space-y-1">
              {text.map((line, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-gray-400">•</span>
                  <span className="text-wrap">{line}</span>
                </div>
              ))}
            </div>
          ) : (
            // Single string: render as plain text
            <div className="text-wrap">{text}</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
