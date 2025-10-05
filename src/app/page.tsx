'use client';

import EntitiesGrid from '@/components/EntitiesGrid';
import MemberStatesGrid from '@/components/MemberStatesGrid';
import { useRef, Suspense } from 'react';
import { getAllMemberStates } from '@/lib/memberStates';
import { getAllEntities } from '@/lib/entities';

export default function Home() {
    const entitiesGridRef = useRef<{ handleReset: () => void; toggleGroup: (groupKey: string) => void }>(null);

    const handleTitleClick = () => {
        entitiesGridRef.current?.handleReset();
    };

    const memberStatesCount = getAllMemberStates().filter(s => s.status === 'member').length;
    const entitiesCount = getAllEntities().length;

    return (
        <main className="min-h-screen w-full p-3 sm:p-4 lg:p-6">
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left mt-2 sm:mt-4">
                    <button
                        onClick={handleTitleClick}
                        className="hover:opacity-80 transition-opacity duration-200 cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit italic"
                    >
                        The United Nations at a glance.
                    </button>
                    <sup className="text-sm sm:text-base lg:text-lg text-gray-500 font-normal ml-1 sm:ml-1.5">alpha</sup>
                </h1>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left">{memberStatesCount} member states</h1>
                <Suspense fallback={<div>Loading...</div>}>
                    <MemberStatesGrid />
                </Suspense>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left">fund {entitiesCount} organizations</h1>
                <Suspense fallback={<div>Loading...</div>}>
                    <EntitiesGrid ref={entitiesGridRef} />
                </Suspense>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left">to pursue the 17 Sustainable Development Goals,</h1>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left">and they are having an impact.</h1>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left">Member states coordinate in 23 organs,</h1>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left">adopt ~400 resolutions per year</h1>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left">and publish ~1500 reports per year.</h1>
                
            </div>
        </main>
    );
}
