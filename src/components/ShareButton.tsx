"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareButton() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    // Share the current URL (already canonicalized by ModalHandler)
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);

      // Close popover after 2 seconds
      setTimeout(() => {
        setIsPopoverOpen(false);
        // Reset copied state after popover closes (wait for animation)
        setTimeout(() => {
          setIsCopied(false);
        }, 200);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={handleShare}
          className={`flex h-8 flex-shrink-0 cursor-pointer items-center justify-start gap-2 rounded-md border border-gray-200 bg-white px-2 text-sm font-normal text-gray-500 transition-all duration-200 hover:border-un-blue hover:bg-un-blue/10 hover:text-un-blue focus:ring-2 focus:ring-gray-300 focus:outline-none sm:px-3`}
          aria-label="Share entity"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-un-blue" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Share</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="flex h-8 w-fit items-center border border-gray-200 bg-white p-2 shadow-lg"
        align="center"
        side="left"
        sideOffset={4}
      >
        <p className="text-sm">
          {isCopied ? "Copied!" : "Copy link to entity"}
        </p>
      </PopoverContent>
    </Popover>
  );
}
