'use client';

import { Impact } from '@/types/impact';
import { getAllImpacts } from '@/lib/impacts';
import { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 9;
const ROTATION_INTERVAL = 3500;

interface ImpactGridProps {
    onEntityClick?: (entityCode: string) => void;
}

export default function ImpactGrid({ onEntityClick }: ImpactGridProps) {
    const [visibleImpacts, setVisibleImpacts] = useState<Impact[]>([]);
    const [impactPool, setImpactPool] = useState<Impact[]>([]);
    const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

    // Initialize: shuffle and split into visible + pool
    useEffect(() => {
        const allImpacts = getAllImpacts();
        const shuffled = [...allImpacts].sort(() => Math.random() - 0.5);
        setVisibleImpacts(shuffled.slice(0, GRID_SIZE));
        setImpactPool(shuffled.slice(GRID_SIZE));
    }, []);

    const rotateCard = useCallback(() => {
        if (impactPool.length === 0 || visibleImpacts.length === 0) return;

        const randomIndex = Math.floor(Math.random() * visibleImpacts.length);
        const randomPoolIndex = Math.floor(Math.random() * impactPool.length);

        setAnimatingIndex(randomIndex);

        setTimeout(() => {
            setVisibleImpacts(prev => {
                const newVisible = [...prev];
                const oldImpact = newVisible[randomIndex];
                newVisible[randomIndex] = impactPool[randomPoolIndex];
                
                setImpactPool(prevPool => {
                    const newPool = [...prevPool];
                    newPool[randomPoolIndex] = oldImpact;
                    return newPool;
                });

                return newVisible;
            });

            setTimeout(() => setAnimatingIndex(null), 100);
        }, 200);
    }, [visibleImpacts, impactPool]);

    useEffect(() => {
        const interval = setInterval(rotateCard, ROTATION_INTERVAL);
        return () => clearInterval(interval);
    }, [rotateCard]);

    const renderImpactText = (impact: Impact) => {
        const parts = impact.impact.split(new RegExp(`(${impact.highlight})`, 'gi'));
        
        return parts.map((part, i) => {
            if (part.toLowerCase() === impact.highlight.toLowerCase()) {
                return (
                    <button
                        key={i}
                        onClick={() => onEntityClick?.(impact.entity)}
                        className="text-un-blue hover:opacity-80 transition-opacity duration-200 font-semibold cursor-pointer"
                    >
                        {part}
                    </button>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {visibleImpacts.map((impact, index) => (
                <div
                    key={`${impact.id}-${index}`}
                    className={`
                        bg-gray-50 rounded-lg p-4 sm:p-5 
                        transition-all duration-200 ease-out
                        ${animatingIndex === index ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                    `}
                >
                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                        {renderImpactText(impact)}
                    </p>
                </div>
            ))}
        </div>
    );
}
