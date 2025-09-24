'use client';

import EntitiesGrid from '@/components/EntitiesGrid';
import { useRef } from 'react';

export default function Home() {
    const entitiesGridRef = useRef<{ handleReset: () => void }>(null);

    const handleTitleClick = () => {
        entitiesGridRef.current?.handleReset();
    };

    return (
        <main className="min-h-screen w-full p-3 sm:p-4 lg:p-6">
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left mt-2 sm:mt-4">
                    <button
                        onClick={handleTitleClick}
                        className="hover:opacity-80 transition-opacity duration-200 cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
                    >
                        UN System Chart
                    </button>
                    <sup className="text-sm sm:text-base lg:text-lg text-gray-500 font-normal ml-1 sm:ml-1.5">alpha</sup>
                </h1>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed -mt-1 sm:-mt-2">
                    Interactive overview of United Nations System entities. For informational purposes only and subject to official review. You can find the print version <a href="https://www.un.org/en/delegate/page/un-system-chart" target="_blank" rel="noopener noreferrer" className="text-un-blue hover:font-bold">here</a>.
                </p>
                <EntitiesGrid ref={entitiesGridRef} />
            </div>
        </main>
    );
}
