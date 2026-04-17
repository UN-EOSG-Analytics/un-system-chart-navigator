"use client";

import { featureFlags } from "@/lib/constants";
import { appHeader } from "@/lib/styles";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, FileEdit, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className={appHeader.bar}>
      <div className={appHeader.inner}>
        <h1 className="min-w-0 flex-1 text-left">
          <Link
            href="/"
            className="group inline-flex min-w-0 translate-y-1 items-center gap-2.5 transition-colors duration-200 sm:gap-3"
            aria-label="Reset filters and return to home view"
          >
            <Image
              src="/images/UN_Logo_Stacked_Colour_English.svg"
              alt="United Nations"
              width={96}
              height={30}
              priority
              className="h-auto w-20 shrink-0 sm:w-22"
            />
            <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0 text-slate-950 sm:gap-x-2">
              <span className={appHeader.titleBold}>System Chart</span>
              <span className={appHeader.titleLight}>Navigator</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={appHeader.previewBadge}>Preview</span>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="max-w-70 border border-slate-200 bg-white text-center text-slate-500 shadow-sm"
                >
                  This is an early public preview. Content and features may
                  change and are not authoritative.
                </TooltipContent>
              </Tooltip>
            </span>
          </Link>
        </h1>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-un-blue hover:text-un-blue"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-44 rounded-md border border-slate-200 bg-white p-1 shadow-md"
          >
            <DropdownMenuItem asChild>
              <Link
                href="/methodology"
                className="cursor-pointer rounded-sm px-3 py-2 text-sm font-normal text-slate-600 transition-colors hover:bg-un-blue/5 hover:text-un-blue"
              >
                <BookOpen className="h-4 w-4 text-slate-400" />
                Methodology
              </Link>
            </DropdownMenuItem>
            {featureFlags.contribute && (
              <DropdownMenuItem asChild>
                <Link
                  href="/contribute"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer rounded-sm px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-un-blue/5 hover:text-un-blue"
                >
                  <FileEdit className="h-4 w-4 text-un-blue" />
                  Contribute
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
