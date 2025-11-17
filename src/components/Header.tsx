"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { FileEdit } from "lucide-react";

interface HeaderProps {
  onTitleClick: () => void;
}

export default function Header({ onTitleClick }: HeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4">
      <h1 className="text-left">
        <button
          onClick={onTitleClick}
          className="group inline-flex cursor-pointer flex-wrap items-center gap-x-1.5 gap-y-0 border-none bg-transparent p-0 text-left transition-all duration-200 sm:gap-x-2"
          aria-label="Reset filters and return to home view"
        >
          <span className="text-2xl leading-tight font-bold whitespace-nowrap text-foreground transition-colors group-hover:text-un-blue sm:text-4xl lg:text-5xl">
            UN System
          </span>
          <span className="text-2xl leading-tight font-normal whitespace-nowrap text-foreground transition-colors group-hover:text-un-blue sm:text-4xl lg:text-5xl">
            Chart
          </span>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <sup className="-ml-0.5 cursor-help text-xs font-normal text-gray-600 transition-colors group-hover:text-un-blue sm:mt-4 sm:text-base lg:text-lg">
                alpha
              </sup>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="ml-2 border border-slate-200 bg-white text-slate-800"
            >
              <p className="text-sm">
                This is an experimental version in active development.
              </p>
            </TooltipContent>
          </Tooltip>
        </button>
      </h1>
      <Link
        href="/contribute"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-0.5 flex h-8 flex-shrink-0 items-center justify-start gap-2 rounded-md border border-gray-200 bg-white px-2 text-sm font-normal text-gray-500 transition-colors hover:border-un-blue hover:bg-un-blue/10 hover:text-un-blue sm:mt-1 sm:px-3"
        aria-label="Contribute to the UN System Chart"
      >
        <FileEdit className="h-4 w-4 text-un-blue" />
        <span>Contribute</span>
      </Link>
    </div>
  );
}
