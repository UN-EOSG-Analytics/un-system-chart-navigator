'use client';

import { Entity } from '@/types/entity';
import { X, ExternalLink } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { SystemGroupingBadge } from '@/components/ui/SystemGroupingBadge';
import Image from 'next/image';

interface EntityModalProps {
    entity: Entity | null;
    onClose: () => void;
    loading: boolean;
}

export default function EntityModal({ entity, onClose, loading }: EntityModalProps) {
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
            <div className="p-6 sm:p-8 space-y-6">
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

                {/* Links */}
                <div>
                    <SubHeader>Links</SubHeader>
                    <div className="space-y-1">
                        {/* Website */}
                        {entity!.entity_link && entity!.entity_link.startsWith('https') && (
                            <a
                                href={entity!.entity_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 py-2 px-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                            >
                                <ExternalLink size={18} className="flex-shrink-0" />
                                <span className="text-sm sm:text-base">Website</span>
                            </a>
                        )}

                        {/* Annual Report */}
                        {entity!.annual_reports_link && entity!.annual_reports_link.startsWith('https') && (
                            <a
                                href={entity!.annual_reports_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 py-2 px-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                            >
                                <ExternalLink size={18} className="flex-shrink-0" />
                                <span className="text-sm sm:text-base">Annual Reports</span>
                            </a>
                        )}

                        {/* Financials */}
                        {entity!.budget_financial_reporting_link && entity!.budget_financial_reporting_link.startsWith('https') && (
                            <a
                                href={entity!.budget_financial_reporting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 py-2 px-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                            >
                                <ExternalLink size={18} className="flex-shrink-0" />
                                <span className="text-sm sm:text-base">Financial Reporting</span>
                            </a>
                        )}

                        {/* Transparency Portal */}
                        {entity!.transparency_portal_link && entity!.transparency_portal_link.startsWith('https') && (
                            <a
                                href={entity!.transparency_portal_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 py-2 px-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                            >
                                <ExternalLink size={18} className="flex-shrink-0" />
                                <span className="text-sm sm:text-base">Transparency Portal</span>
                            </a>
                        )}

                        {/* Strategic Plan */}
                        {entity!.strategic_plan_link && entity!.strategic_plan_link.startsWith('https') && (
                            <a
                                href={entity!.strategic_plan_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 py-2 px-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                            >
                                <ExternalLink size={18} className="flex-shrink-0" />
                                <span className="text-sm sm:text-base">Strategic Plan</span>
                            </a>
                        )}

                        {/* Results Framework */}
                        {entity!.results_framework_link && entity!.results_framework_link.startsWith('https') && (
                            <a
                                href={entity!.results_framework_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 py-2 px-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                            >
                                <ExternalLink size={18} className="flex-shrink-0" />
                                <span className="text-sm sm:text-base">Results Framework</span>
                            </a>
                        )}
                    </div>
                </div>
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
                <div className={`px-6 sm:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-300 ${entity ? 'sticky top-0 bg-white' : ''}`}>
                    {renderHeader()}
                </div>

                {/* Body Content */}
                {renderBody()}
            </div>
        </div>
    );
}
