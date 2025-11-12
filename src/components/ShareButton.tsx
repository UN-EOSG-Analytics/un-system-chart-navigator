'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
    entityName: string;
}

export default function ShareButton({ entityName }: ShareButtonProps) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleShare = async () => {
        // Generate the URL for the current entity
        const url = `${window.location.origin}?entity=${encodeURIComponent(entityName)}`;

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
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <button
                    onClick={handleShare}
                    className={`
                        flex items-center justify-start gap-2 h-8 px-2 sm:px-3 rounded-md
                        transition-all duration-200
                        text-gray-500 bg-white hover:bg-un-blue/10 hover:text-un-blue border-gray-200 hover:border-un-blue
                        border text-sm
                        flex-shrink-0 cursor-pointer font-normal
                        focus:outline-none focus:ring-2 focus:ring-gray-300
                    `}
                    aria-label="Share entity"
                >
                    {isCopied ? <Check className="h-4 w-4 text-un-blue" /> : <Share2 className="h-4 w-4" />}
                    <span className="hidden sm:inline">Share</span>
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="h-8 flex items-center p-2 bg-white border border-gray-200 shadow-lg w-fit"
                align="center"
                side="left"
                sideOffset={4}
            >
                <p className="text-sm text-center">
                    {isCopied ? 'Copied!' : 'Copy link to entity'}
                </p>
            </PopoverContent>
        </Popover>
    );
}
