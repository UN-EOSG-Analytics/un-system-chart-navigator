'use client';

import EntitiesGrid from '@/components/EntitiesGrid';
import MemberStatesGrid from '@/components/MemberStatesGrid';
import SDGsGrid from '@/components/SDGsGrid';
import OrgansGrid from '@/components/OrgansGrid';
import ImpactGrid from '@/components/ImpactGrid';
import ModalHandler from '@/components/ModalHandler';
import { useRef, useState, useEffect, Suspense, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAllMemberStates } from '@/lib/memberStates';
import { getAllEntities, getEntityByCode } from '@/lib/entities';
import { getAllOrgans } from '@/lib/organs';

export default function Home() {
    const router = useRouter();
    const entitiesGridRef = useRef<{ handleReset: () => void; toggleGroup: (groupKey: string) => void }>(null);
    const [open, setOpen] = useState<number | null>(null);
    const Section = (
        { i, title, children }:
        { i: number; title: ReactNode; children: ReactNode }
    ) => {
        const isOpen = open === i;
        const contentRef = useRef<HTMLDivElement>(null);
        const [height, setHeight] = useState<number | 'auto'>(0);
        useEffect(() => {
            const el = contentRef.current;
            if (!el) return;
            if (isOpen) setHeight(el.scrollHeight);
            else {
                if (height === 'auto') setHeight(el.scrollHeight);
                requestAnimationFrame(() => setHeight(0));
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isOpen]);
        useEffect(() => {
            const el = contentRef.current;
            if (!el || !isOpen) return;
            const ro = new ResizeObserver(() => height !== 'auto' && setHeight(el.scrollHeight));
            ro.observe(el);
            return () => ro.disconnect();
        }, [isOpen, height]);
        return (
            <>
                <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left w-full flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    aria-expanded={isOpen}
                >
                    <span>{title}</span>
                    <span className={`text-gray-400 ml-2 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-90' : ''}`}>&gt;</span>
                </button>
                <div
                    ref={contentRef}
                    onTransitionEnd={() => isOpen && setHeight('auto')}
                    className={`overflow-hidden transition-[height,opacity] duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    style={{ height: height === 'auto' ? 'auto' : height }}
                >
                    <div className="py-2">
                        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
                    </div>
                </div>
            </>
        );
    };

    const handleTitleClick = () => {
        entitiesGridRef.current?.handleReset();
    };

    const handleEntityClick = (entityCode: string) => {
        const entity = getEntityByCode(entityCode);
        if (entity) {
            const slug = entity.entity.toLowerCase().replace(/\s+/g, '-');
            router.push(`/?entity=${slug}`, { scroll: false });
        }
    };

    const memberStatesCount = getAllMemberStates().filter(s => s.status === 'member').length;
    const entitiesCount = getAllEntities().length;
    const organsCount = getAllOrgans().length;

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
                <Section i={0} title={<span>{memberStatesCount} member states</span>}>
                    <MemberStatesGrid />
                </Section>
                <Section i={1} title={<span>fund {entitiesCount} organizations</span>}>
                    <EntitiesGrid ref={entitiesGridRef} />
                </Section>
                <Section i={2} title={<span>to pursue the 17 Sustainable Development Goals,</span>}>
                    <SDGsGrid />
                </Section>
                <Section i={3} title={<span>and they are making an impact.</span>}>
                    <ImpactGrid onEntityClick={handleEntityClick} />
                </Section>
                <Section i={4} title={<span>Member states coordinate in {organsCount} organs,</span>}>
                    <OrgansGrid />
                </Section>
                <Section i={5} title={<span>adopt ~400 resolutions per year,</span>}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded" />
                        ))}
                    </div>
                </Section>
                <Section i={6} title={<span>and publish ~1500 reports per year.</span>}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded" />
                        ))}
                    </div>
                </Section>
            </div>
            <ModalHandler />
        </main>
    );
}
