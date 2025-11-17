"use client"; // for Tooltip component

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import ExternalLink from "./ExternalLink";

export default function ExplainerText() {
  return (
    <p className="mt-1 mb-0.5 text-base leading-snug text-gray-600 sm:text-base sm:leading-relaxed lg:text-lg">
      Interactive overview of{" "}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dotted border-gray-400 transition-colors hover:border-un-blue hover:text-un-blue">
            United Nations system entities
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-md border border-slate-200 bg-white p-4 text-slate-800"
        >
          <p className="text-sm leading-relaxed">
            The United Nations is part of the UN system, which, in addition to
            the UN itself, comprises many funds, programmes and specialized
            agencies, each of which have their own area of work, leadership and
            budget. The programmes and funds are financed through voluntary
            rather than assessed contributions. The Specialized Agencies are
            independent international organizations funded by both voluntary and
            assessed contributions. The UN coordinates its work with these
            separate UN system entities, which cooperate with the Organization
            to help it achieve its goals.{" "}
            <ExternalLink href="https://www.un.org/en/about-us/un-system">
              Learn more
            </ExternalLink>
          </p>
        </TooltipContent>
      </Tooltip>
      . For informational purposes only and subject to official review. The
      print version is available{" "}
      <ExternalLink href="https://www.un.org/en/delegate/page/un-system-chart">
        here
      </ExternalLink>
      .
    </p>
  );
}
