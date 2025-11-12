'use client';

import EntitiesGrid from '@/components/EntitiesGrid';
import Footer from '@/components/Footer';
import DataDownloadBar from '@/components/DataDownloadBar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Suspense, useRef } from 'react';
import Link from 'next/link';
import { FileEdit } from 'lucide-react';

export default function Home() {
    const entitiesGridRef = useRef<{ handleReset: () => void; toggleGroup: (groupKey: string) => void }>(null);

    const handleTitleClick = () => {
        entitiesGridRef.current?.handleReset();
    };



    return (
        <>
            <main className="flex-grow w-full p-3 sm:p-4 lg:p-6">
                <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6">
                    <div className="flex flex-col gap-3 mt-2 sm:mt-4">
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                            <h1 className="text-left">
                                <button
                                    onClick={handleTitleClick}
                                    className="group inline-flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0 transition-all duration-200 cursor-pointer bg-transparent border-none p-0 text-left"
                                    aria-label="Reset filters and return to home view"
                                >
                                    <span className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground group-hover:text-un-blue transition-colors leading-tight whitespace-nowrap">
                                        UN System
                                    </span>
                                    <span className="text-2xl sm:text-4xl lg:text-5xl font-normal text-foreground group-hover:text-un-blue transition-colors leading-tight whitespace-nowrap">
                                        Chart
                                    </span>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <sup className="text-xs sm:text-base lg:text-lg text-gray-600 group-hover:text-un-blue font-normal mt-1 sm:mt-4 -ml-0.5 transition-colors cursor-help">
                                                alpha
                                            </sup>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="bg-white text-slate-800 border border-slate-200 ml-2">
                                            <p className="text-sm">This is an experimental version in active development.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </button>
                            </h1>
                            <Link 
                                href="/contribute"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 h-8 px-2 sm:px-3 rounded-md transition-colors text-sm text-gray-500 bg-white hover:bg-un-blue/10 hover:text-un-blue border border-gray-200 hover:border-un-blue flex-shrink-0 mt-0.5 sm:mt-1 font-normal"
                                aria-label="Contribute to the UN System Chart"
                            >
                                <FileEdit className="h-4 w-4" />
                                <span className="hidden sm:inline">Contribute</span>
                            </Link>
                        </div>
                        <p className="text-gray-600 text-base sm:text-base lg:text-lg leading-snug sm:leading-relaxed">
                            Interactive overview of United Nations System entities. For informational purposes only and subject to official review. The relevant rules of the organization concerned should be consulted in order to establish the legal status, functions and reporting lines of each entity shown. The print version is available{' '}
                            <a
                                href="https://www.un.org/en/delegate/page/un-system-chart"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-un-blue hover:underline font-medium transition-all"
                            >
                                here
                            </a>.
                        </p>
                    </div>
                    <Suspense fallback={<div className="min-h-screen"></div>}>
                        <EntitiesGrid ref={entitiesGridRef} />
                    </Suspense>
                </div>
            </main>
            <DataDownloadBar />
            <Footer />
        </>
    );
}
