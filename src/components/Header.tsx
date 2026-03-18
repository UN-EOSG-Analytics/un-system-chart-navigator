"use client";

import { featureFlags } from "@/lib/constants";
import { FileEdit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className="fixed top-0 right-0 left-0 z-40 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 md:px-10 lg:px-12 xl:px-16">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3">
        <h1 className="min-w-0 flex-1 text-left">
          <Link
            href="/"
            className="group inline-flex min-w-0 items-center gap-2.5 translate-y-1 transition-colors duration-200 sm:gap-3"
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
              <span className="text-[1.25rem] leading-none font-bold tracking-[-0.05em] text-slate-950 transition-colors group-hover:text-un-blue sm:text-[1.8rem]">
                System Chart
              </span>
              <span className="text-[1.25rem] leading-none font-light tracking-[-0.05em] text-slate-950 transition-colors group-hover:text-un-blue sm:text-[1.8rem]">
                Navigator
              </span>
            </span>
          </Link>
        </h1>
        {featureFlags.contribute && (
          <Link
            href="/contribute"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8.5 shrink-0 items-center justify-start gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:border-un-blue hover:text-un-blue"
            aria-label="Contribute to the UN System Chart"
          >
            <FileEdit className="h-4 w-4 text-un-blue" />
            <span>Contribute</span>
          </Link>
        )}
      </div>
    </div>
  );
}
