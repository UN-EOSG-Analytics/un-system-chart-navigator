"use client";

import EntitiesGrid from "@/components/EntitiesGrid";
import Footer from "@/components/Footer";
import GetDataFooter from "@/components/GetDataFooter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Suspense, useRef } from "react";
import Link from "next/link";
import { FileEdit } from "lucide-react";

export default function Home() {
  const entitiesGridRef = useRef<{
    handleReset: () => void;
    toggleGroup: (groupKey: string) => void;
  }>(null);

  const handleTitleClick = () => {
    entitiesGridRef.current?.handleReset();
  };

  return (
    <>
      <main className="w-full flex-grow p-3 sm:p-4 lg:p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
          <div className="mt-2 flex flex-col gap-3 sm:mt-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <h1 className="text-left">
                <button
                  onClick={handleTitleClick}
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
                      <sup className="mt-1 -ml-0.5 cursor-help text-xs font-normal text-gray-600 transition-colors group-hover:text-un-blue sm:mt-4 sm:text-base lg:text-lg">
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
                <FileEdit className="h-4 w-4" />
                <span className="hidden sm:inline">Contribute</span>
              </Link>
            </div>
            <p className="text-base leading-snug text-gray-600 sm:text-base sm:leading-relaxed lg:text-lg">
              Interactive overview of United Nations System entities. For
              informational purposes only and subject to official review. The
              relevant rules of the organization concerned should be consulted
              in order to establish the legal status, functions and reporting
              lines of each entity shown. The print version is available{" "}
              <a
                href="https://www.un.org/en/delegate/page/un-system-chart"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-un-blue transition-all hover:underline"
              >
                here
              </a>
              .
            </p>
          </div>
          <Suspense fallback={<div className="min-h-screen"></div>}>
            <EntitiesGrid ref={entitiesGridRef} />
          </Suspense>
        </div>
      </main>
      <GetDataFooter />
      <Footer />
    </>
  );
}
