'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getAllEntities, searchEntities } from '@/lib/entities';
import { getSystemGroupingStyle, systemGroupingStyles } from '@/lib/systemGroupings';
import { createEntitySlug } from '@/lib/utils';
import { Entity } from '@/types/entity';
import { Check, Download, FileJson, FileText, Link } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import FilterControls from './FilterControls';

const EntityCard = ({ entity, onEntityClick }: { entity: Entity; onEntityClick: (entitySlug: string) => void }) => {
    const styles = getSystemGroupingStyle(entity.system_grouping);

    // Create URL-friendly slug from entity name using utility function
    const entitySlug = createEntitySlug(entity.entity);

    // All cards take exactly 1 grid cell for uniform appearance

    const handleClick = () => {
        onEntityClick(entitySlug);
    };

    return (
        <Tooltip delayDuration={50} disableHoverableContent>
            <TooltipTrigger asChild>
                <div
                    onClick={handleClick}
                    className={`${styles.bgColor} ${styles.textColor} h-[50px] sm:h-[55px] p-2 rounded-lg flex items-center justify-center text-center transition-all duration-200 ease-out cursor-pointer hover:scale-105 hover:shadow-md active:scale-95 animate-in fade-in slide-in-from-bottom-4 touch-manipulation`}
                >
                    <span className="font-medium text-xs sm:text-sm leading-tight">{entity.entity}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                sideOffset={8}
                className="bg-white text-slate-800 border border-slate-200 shadow-lg max-w-xs sm:max-w-sm"
                hideWhenDetached
                avoidCollisions={true}
                collisionPadding={12}
            >
                <div className="text-center max-w-xs sm:max-w-sm p-1">
                    <p className="font-medium text-xs sm:text-sm leading-tight">{entity.entity_long}</p>
                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Click to view entity details</p>
                    <p className="text-xs text-slate-500 mt-1 sm:hidden">Tap to view details</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
};

const EntitiesGrid = forwardRef<{ handleReset: () => void; toggleGroup: (groupKey: string) => void }>((props, ref) => {
    const entities = getAllEntities();
    const [activeGroups, setActiveGroups] = useState<Set<string>>(new Set(Object.keys(systemGroupingStyles)));
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showDownloadOptions, setShowDownloadOptions] = useState<boolean>(false);
    const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
    const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);
    const [showDownloadToast, setShowDownloadToast] = useState<boolean>(false);
    const [downloadedFormat, setDownloadedFormat] = useState<string>('');
    const [toastMessage, setToastMessage] = useState<string>('');
    const downloadRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Toast component for DRY code
    const Toast = ({ message, show }: { message: string; show: boolean }) => {
        if (!show) return null;
        return (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-600 px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 z-50">
                <Check size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">{message}</span>
            </div>
        );
    };

    // Check for filter parameter on mount and when URL changes
    useEffect(() => {
        const filterParam = searchParams.get('filter');
        if (filterParam) {
            setActiveGroups(new Set([filterParam]));
            setSearchQuery('');
            // Clear the filter parameter from URL after applying it
            router.replace('/', { scroll: false });
        }
    }, [searchParams, router]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
                setShowDownloadOptions(false);
            }
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowDownloadOptions(false);
            }
        };

        if (showDownloadOptions) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showDownloadOptions]);

    const toggleGroup = (groupKey: string) => {
        setActiveGroups(prev => {
            // If this group is the only active one, show all groups
            if (prev.size === 1 && prev.has(groupKey)) {
                return new Set(Object.keys(systemGroupingStyles));
            }
            // Otherwise, show only this group
            return new Set([groupKey]);
        });
    };

    const handleEntityClick = (entitySlug: string) => {
        // Update URL without navigation to prevent page jumping
        router.replace(`/?entity=${entitySlug}`, { scroll: false });
    };

    const handleReset = () => {
        setSearchQuery('');
        setActiveGroups(new Set(Object.keys(systemGroupingStyles)));
    };

    const handleCopyLink = (format: string, url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedFormat(format);
        setShowCopiedToast(true);

        // Reset after animation
        setTimeout(() => {
            setCopiedFormat(null);
        }, 2000);

        setTimeout(() => {
            setShowCopiedToast(false);
        }, 2000);
    };

    const handleDownload = (format: string) => {
        setDownloadedFormat(format);
        setShowDownloadToast(true);

        // Reset after animation
        setTimeout(() => {
            setShowDownloadToast(false);
        }, 2000);
    };

    useImperativeHandle(ref, () => ({
        handleReset,
        toggleGroup
    }));

    // Filter and sort entities
    const visibleEntities = (searchQuery.trim() ? searchEntities(searchQuery) : entities)
        .filter((entity: Entity) => activeGroups.has(entity.system_grouping))
        .sort((a: Entity, b: Entity) => {
            // First sort by group order defined in systemGroupingStyles
            if (a.system_grouping !== b.system_grouping) {
                const orderA = getSystemGroupingStyle(a.system_grouping).order;
                const orderB = getSystemGroupingStyle(b.system_grouping).order;
                return orderA - orderB;
            }
            // Within the same group, sort alphabetically but put "Other" at the end
            const aIsOther = a.entity === 'Other';
            const bIsOther = b.entity === 'Other';

            if (aIsOther && !bIsOther) return 1;  // a is "Other", put it after b
            if (!aIsOther && bIsOther) return -1; // b is "Other", put it after a

            // Both are "Other" or neither is "Other", sort alphabetically
            return a.entity.localeCompare(b.entity);
        });

    return (
        <div className="w-full">
            {/* Search and Filter Controls */}
            <FilterControls
                activeGroups={activeGroups}
                onToggleGroup={toggleGroup}
                entities={entities}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onReset={handleReset}
                visibleEntitiesCount={visibleEntities.length}
            />

            {/* Entities Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 w-full transition-all duration-1000 ease-out">
                {visibleEntities.map((entity: Entity) => (
                    <EntityCard key={entity.entity} entity={entity} onEntityClick={handleEntityClick} />
                ))}
            </div>

            {/* Footer with Date and Download Links */}
            <div className="mt-4 flex items-center gap-2 text-base">
                <p className="text-gray-600">As of October 2025</p>
                <span className="text-gray-400">|</span>
                <div className="relative" ref={downloadRef}>
                    <button
                        onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                        className="text-un-blue hover:underline font-medium transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        Get data
                        <Download size={16} />
                    </button>
                    {/* use kebab-case */}
                    {showDownloadOptions && (
                        <div className="absolute bottom-full -left-1 mb-1 bg-white rounded-lg shadow-lg py-1.5 px-1.5 z-10 min-w-[140px]">
                            <div className="flex items-stretch mb-1">
                                <a
                                    href="/entities.json"
                                    download={`${new Date().toISOString().split('T')[0]}_un-entities.json`}
                                    onClick={() => handleDownload('JSON')}
                                    className="flex items-center gap-2 pl-2 pr-1 py-2 text-sm text-gray-600 hover:text-un-blue hover:bg-gray-50 transition-all rounded-lg flex-1"
                                    title="Download JSON"
                                >
                                    <FileJson size={16} />
                                    JSON
                                </a>
                                <button
                                    onClick={() => handleCopyLink('json', `${window.location.origin}/entities.json`)}
                                    className="w-8 flex items-center justify-center text-gray-400 hover:text-un-blue hover:bg-gray-50 transition-all rounded-lg outline-none focus:outline-none"
                                    title="Copy link to JSON"
                                >
                                    {copiedFormat === 'json' ? (
                                        <Check size={14} className="text-green-600" />
                                    ) : (
                                        <Link size={14} />
                                    )}
                                </button>
                            </div>
                            <div className="flex items-stretch">
                                <a
                                    href="/entities.csv"
                                    download={`${new Date().toISOString().split('T')[0]}_un-entities.csv`}
                                    onClick={() => handleDownload('CSV')}
                                    className="flex items-center gap-2 pl-2 pr-1 py-2 text-sm text-gray-600 hover:text-un-blue hover:bg-gray-50 transition-all rounded-lg flex-1"
                                    title="Download CSV"
                                >
                                    <FileText size={16} />
                                    CSV
                                </a>
                                <button
                                    onClick={() => handleCopyLink('csv', `${window.location.origin}/entities.csv`)}
                                    className="w-8 flex items-center justify-center text-gray-400 hover:text-un-blue hover:bg-gray-50 transition-all rounded-lg outline-none focus:outline-none"
                                    title="Copy link to CSV"
                                >
                                    {copiedFormat === 'csv' ? (
                                        <Check size={14} className="text-green-600" />
                                    ) : (
                                        <Link size={14} />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Toast notifications */}
                    <Toast message="Link copied to clipboard." show={showCopiedToast} />
                    <Toast message={`${downloadedFormat} downloaded.`} show={showDownloadToast} />
                </div>
            </div>
        </div>
    );
});

EntitiesGrid.displayName = 'EntitiesGrid';

export default EntitiesGrid;
