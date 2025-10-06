'use client';

import { SystemGroupingBadge } from '@/components/ui/SystemGroupingBadge';
// import EntityLogo from '@/components/EntityLogo'; // Hidden for now since the feature is not complete yet
import { Entity } from '@/types';
import { budgetData, formatBudget } from '@/lib/entities';
import { getImpactsByEntity } from '@/lib/impacts';
import { BarChart3, BookOpen, Database, DollarSign, Eye, FileText, Globe, Linkedin, Newspaper, Palette, Target, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

interface EntityModalProps {
    entity: Entity | null;
    onClose: () => void;
    loading?: boolean;
}

export default function EntityModal({ entity, onClose, loading = false }: EntityModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Animation state management
    useEffect(() => {
        // Trigger entrance animation after mount
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        // Wait for exit animation before actually closing
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);



    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [handleClose]);

    // Swipe handling
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isRightSwipe = distance < -minSwipeDistance;

        // Close on right swipe (swipe to dismiss)
        if (isRightSwipe) {
            handleClose();
        }
    };

    // Prevent body scroll when modal is open while maintaining scrollbar space
    useEffect(() => {
        // Store original values
        const originalOverflow = document.documentElement.style.overflow;

        // Prevent scrolling on the html element instead of body to preserve scrollbar
        document.documentElement.style.overflow = 'hidden';

        return () => {
            // Restore original values
            document.documentElement.style.overflow = originalOverflow;
        };
    }, []);

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    // Reusable close button component
    const CloseButton = () => (
        <button
            onClick={handleClose}
            className="
                flex items-center justify-center h-8 w-8 rounded-full
                transition-all duration-200 ease-out touch-manipulation
                text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-gray-100 cursor-pointer
                focus:outline-none focus:bg-gray-400 focus:text-gray-100 flex-shrink-0
            "
            aria-label="Close modal"
            title="Close modal"
        >
            <X className="h-3 w-3" />
        </button>
    );

    // Reusable subheader component
    const SubHeader = ({ children }: { children: React.ReactNode }) => (
        <h3 className="text-lg sm:text-xl font-normal text-gray-900 mb-3 uppercase tracking-wider">{children}</h3>
    );

    // Reusable field label component
    const FieldLabel = ({ children }: { children: React.ReactNode }) => (
        <span className="font-normal text-gray-600 text-sm uppercase tracking-wide">{children}</span>
    );

    // Reusable badge/chip component
    const Badge = ({ children }: { children: React.ReactNode }) => (
        <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">{children}</span>
    );

    // Reusable field value wrapper component
    const FieldValue = ({ children }: { children: React.ReactNode }) => (
        <div className="mt-0.5">{children}</div>
    );

    // Complete field component combining label and value
    const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <FieldValue>{children}</FieldValue>
        </div>
    );

    // Helper function to check if a link is valid
    const isValidLink = (link: string | null | undefined): boolean => {
        return link ? link.startsWith('https') : false;
    };

    // Reusable link component
    const LinkItem = ({
        href,
        icon: Icon,
        label
    }: {
        href: string;
        icon: React.ComponentType<{ size: number; className: string }>;
        label: string;
    }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 py-2 px-3 rounded-lg hover:bg-blue-50 touch-manipulation"
        >
            <Icon size={18} className="flex-shrink-0" />
            <span className="text-base sm:text-lg">{label}</span>
        </a>
    );

    // Render header content based on state
    const renderHeader = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-48 animate-pulse flex-1 mr-4"></div>
                    <CloseButton />
                </div>
            );
        }

        if (!entity) {
            return (
                <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1 pr-4">Entity Not Found</h2>
                    <CloseButton />
                </div>
            );
        }

        return (
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 leading-tight flex-1">
                    {entity.entity}: {entity.entity_long}
                </h2>
                <CloseButton />
            </div>
        );
    };

    // Render body content based on state
    const renderBody = () => {
        if (loading) {
            return (
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
            );
        }

        if (!entity) {
            return (
                <div className="p-4 sm:p-6">
                    <p className="text-gray-600">The requested entity could not be found.</p>
                </div>
            );
        }

        // Full entity content - only if entity exists
        return (
            <div className="px-6 sm:px-8 pt-4 sm:pt-5 pb-6 sm:pb-8 space-y-6">
                {/* Logo - Hidden for now since the feature is not complete yet */}
                {/* <EntityLogo 
                    entityName={entity!.entity}
                    entityLong={entity!.entity_long}
                    className="h-12 sm:h-14 lg:h-16 w-auto max-w-48"
                /> */}

                {/* Description */}
                {entity!.entity_description && (
                    <div>
                        {/* <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">Description</h3> */}
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{entity!.entity_description}</p>
                    </div>
                )}

                {/* Basic Info */}
                <div>
                    <SubHeader>Overview</SubHeader>
                    <div className="space-y-4">
                        <Field label="System Grouping">
                            <SystemGroupingBadge
                                grouping={entity!.system_grouping}
                                clickable={true}
                            />
                        </Field>
                        <Field label="Entity Category">
                            <Badge>{entity!.category}</Badge>
                        </Field>
                        <Field label="UN Principal Organ">
                            <Badge>{entity!.un_principal_organ}</Badge>
                        </Field>
                        {(() => {
                            const budgetEntry = budgetData[entity!.entity];
                            if (budgetEntry) {
                                const sourceLabel = budgetEntry.source === 'ceb' ? 'CEB' : 'UN';
                                const sourceUrl = budgetEntry.source === 'ceb' 
                                    ? 'https://unsceb.org/total-expenses'
                                    : 'https://open.un.org/un-secretariat-financials/expenses?tab=second';
                                const year = budgetEntry.year || 2023;
                                
                                return (
                                    <Field label="Annual Expenses">
                                        <div className="text-gray-700 text-base font-semibold">
                                            {formatBudget(budgetEntry.amount)}
                                        </div>
                                        <div className="text-gray-500 text-xs mt-0.5">
                                            <a
                                                href={sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-500 hover:text-gray-700 hover:underline transition-all duration-200"
                                            >
                                                {sourceLabel} {year}
                                            </a>
                                        </div>
                                    </Field>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>

                {/* Leadership */}
                {(() => {
                    const hasLeadershipInfo = entity!.head_of_entity_level !== "Not applicable" ||
                        entity!.head_of_entity_title_specific !== "Not applicable" ||
                        entity!.head_of_entity_name !== "Not applicable";

                    if (!hasLeadershipInfo) {
                        return (
                            <div>
                                <SubHeader>Leadership</SubHeader>
                                <p className="text-gray-500 text-sm">Not available</p>
                            </div>
                        );
                    }

                    return (
                        <div>
                            <SubHeader>Leadership</SubHeader>
                            <div className="space-y-4">
                                {entity!.head_of_entity_name !== "Not applicable" && (
                                    <Field label="Head of Entity">
                                        {(() => {
                                            const hasPhoto = entity!.head_of_entity_headshot && entity!.head_of_entity_headshot.trim() !== '';

                                            if (hasPhoto) {
                                                return (
                                                    <div className="flex items-start gap-4 ml-0.5">
                                                        <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <Image
                                                                src={entity!.head_of_entity_headshot!}
                                                                alt={`Portrait of ${entity!.head_of_entity_name}`}
                                                                fill
                                                                className="object-cover object-top"
                                                                unoptimized={true}
                                                                onError={(e) => {
                                                                    console.log('Image failed to load:', entity!.head_of_entity_headshot);
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col justify-center min-h-[5rem]">
                                                            <div>
                                                                {entity!.head_of_entity_bio && entity!.head_of_entity_bio.startsWith('https') ? (
                                                                    <a
                                                                        href={entity!.head_of_entity_bio}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-un-blue hover:opacity-80 transition-opacity duration-200 text-base font-semibold underline decoration-1 underline-offset-2 leading-relaxed block"
                                                                    >
                                                                        {entity!.head_of_entity_name}
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-gray-700 text-base font-semibold leading-relaxed block">{entity!.head_of_entity_name}</span>
                                                                )}
                                                                {entity!.head_of_entity_title_specific && entity!.head_of_entity_title_specific !== "Not applicable" && (
                                                                    <div className="text-gray-500 text-base leading-tight">{entity!.head_of_entity_title_specific}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                // No photo - content shifts up to align with label but maintains consistent indent
                                                return (
                                                    <div className="ml-0.5">
                                                        {entity!.head_of_entity_bio && entity!.head_of_entity_bio.startsWith('https') ? (
                                                            <a
                                                                href={entity!.head_of_entity_bio}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-un-blue hover:opacity-80 transition-opacity duration-200 text-base font-semibold underline decoration-1 underline-offset-2 leading-relaxed block"
                                                            >
                                                                {entity!.head_of_entity_name}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-700 text-base font-semibold leading-relaxed block">{entity!.head_of_entity_name}</span>
                                                        )}
                                                        {entity!.head_of_entity_title_specific && entity!.head_of_entity_title_specific !== "Not applicable" && (
                                                            <div className="text-gray-500 text-base leading-tight">{entity!.head_of_entity_title_specific}</div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </Field>
                                )}
                                {entity!.head_of_entity_level !== "Not applicable" && (
                                    <Field label="Post Level">
                                        <Badge>{entity!.head_of_entity_level}</Badge>
                                    </Field>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Impact */}
                {(() => {
                    const impacts = getImpactsByEntity(entity!.entity);
                    if (impacts.length === 0) return null;

                    return (
                        <div>
                            <SubHeader>Impact</SubHeader>
                            <div className="space-y-3">
                                {impacts.map(impact => (
                                    <div key={impact.id} className="flex gap-3">
                                        <div className="flex-shrink-0 w-1 bg-un-blue rounded-full mt-1.5"></div>
                                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">
                                            {impact.impact}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* Links */}
                {(() => {
                    const hasLinks =
                        isValidLink(entity!.entity_link) ||
                        isValidLink(entity!.socials_linkedin) ||
                        isValidLink(entity!.entity_wikipedia_page) ||
                        isValidLink(entity!.entity_news_page) ||
                        isValidLink(entity!.entity_branding_page) ||
                        isValidLink(entity!.entity_data_page) ||
                        isValidLink(entity!.annual_reports_link) ||
                        isValidLink(entity!.transparency_portal_link) ||
                        isValidLink(entity!.budget_financial_reporting_link) ||
                        isValidLink(entity!.strategic_plan_link) ||
                        isValidLink(entity!.results_framework_link);

                    if (!hasLinks) {
                        return null;
                    }

                    return (
                        <div>
                            <SubHeader>Links</SubHeader>
                            <div className="space-y-1">
                                {/* Website */}
                                {isValidLink(entity!.entity_link) && (
                                    <LinkItem href={entity!.entity_link} icon={Globe} label="Official Website" />
                                )}

                                {/* LinkedIn */}
                                {isValidLink(entity!.socials_linkedin) && (
                                    <LinkItem href={entity!.socials_linkedin!} icon={Linkedin} label="LinkedIn" />
                                )}

                                {/* Wikipedia */}
                                {isValidLink(entity!.entity_wikipedia_page) && (
                                    <LinkItem href={entity!.entity_wikipedia_page!} icon={BookOpen} label="Wikipedia" />
                                )}

                                {/* News Portal */}
                                {isValidLink(entity!.entity_news_page) && (
                                    <LinkItem href={entity!.entity_news_page!} icon={Newspaper} label="News" />
                                )}

                                {/* Annual Report */}
                                {isValidLink(entity!.annual_reports_link) && (
                                    <LinkItem href={entity!.annual_reports_link} icon={FileText} label="Annual Reports" />
                                )}

                                {/* Financials */}
                                {isValidLink(entity!.budget_financial_reporting_link) && (
                                    <LinkItem href={entity!.budget_financial_reporting_link} icon={DollarSign} label="Financials & Budget" />
                                )}

                                {/* Strategic Plan */}
                                {isValidLink(entity!.strategic_plan_link) && (
                                    <LinkItem href={entity!.strategic_plan_link} icon={Target} label="Strategic Plan" />
                                )}

                                {/* Results Framework */}
                                {isValidLink(entity!.results_framework_link) && (
                                    <LinkItem href={entity!.results_framework_link} icon={BarChart3} label="Results Framework" />
                                )}

                                {/* Transparency Portal */}
                                {isValidLink(entity!.transparency_portal_link) && (
                                    <LinkItem href={entity!.transparency_portal_link} icon={Eye} label="Transparency Portal" />
                                )}

                                {/* Data Page */}
                                {isValidLink(entity!.entity_data_page) && (
                                    <LinkItem href={entity!.entity_data_page!} icon={Database} label="Data Portal" />
                                )}

                                {/* Branding Page */}
                                {isValidLink(entity!.entity_branding_page) && (
                                    <LinkItem href={entity!.entity_branding_page!} icon={Palette} label="Branding" />
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>
        );
    };

    // Single modal wrapper with dynamic content
    return (
        <div
            className={`fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-300 ease-out ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
                }`}
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 sm:min-w-[400px] lg:min-w-[500px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out ${entity ? 'overflow-y-auto' : ''} ${isVisible && !isClosing ? 'translate-x-0' : 'translate-x-full'
                    }`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Header */}
                <div className={`px-6 sm:px-8 pt-4 sm:pt-6 pb-2 sm:pb-3 border-b border-gray-300 ${entity ? 'sticky top-0 bg-white' : ''}`}>
                    {renderHeader()}
                </div>

                {/* Body Content */}
                {renderBody()}
            </div>
        </div>
    );
}
