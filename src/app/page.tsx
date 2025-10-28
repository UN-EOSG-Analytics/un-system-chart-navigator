'use client';

import EntitiesGrid from '@/components/EntitiesGrid';
import { Suspense, useRef } from 'react';

export default function Home() {
    const entitiesGridRef = useRef<{ handleReset: () => void; toggleGroup: (groupKey: string) => void }>(null);

    const handleTitleClick = () => {
        entitiesGridRef.current?.handleReset();
    };



    return (
        <main className="min-h-screen w-full p-3 sm:p-4 lg:p-6">
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col gap-3 mt-2 sm:mt-4">
                    <h1 className="text-left">
                        <button
                            onClick={handleTitleClick}
                            className="group inline-flex items-start gap-2 transition-all duration-200 cursor-pointer bg-transparent border-none p-0 text-left"
                        >
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 group-hover:text-un-blue transition-colors leading-tight">
                                UN System
                            </span>
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-normal text-gray-700 group-hover:text-un-blue transition-colors leading-tight">
                                Chart
                            </span>
                            <sup className="text-base sm:text-lg text-gray-500 group-hover:text-un-blue font-normal mt-4 -ml-1 transition-colors">alpha</sup>
                        </button>
                    </h1>
                    <p className="text-gray-600 text-base sm:text-base lg:text-lg leading-relaxed">
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
                <Suspense fallback={<div>Loading...</div>}>
                    <EntitiesGrid ref={entitiesGridRef} />
                </Suspense>
            </div>
        </main>
    );
}
