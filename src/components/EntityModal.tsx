'use client';

import EntityLogo from '@/components/EntityLogo';
import PrincipalOrganField, { getPrincipalOrganLabel } from '@/components/PrincipalOrganField';
import { SystemGroupingBadge } from '@/components/SystemGroupingBadge';
import CloseButton from '@/components/CloseButton';
import ShareButton from '@/components/ShareButton';
import { generateContributeUrl } from '@/lib/utils';
import { Entity } from '@/types/entity';
import { BarChart3, Book, Briefcase, Database, DollarSign, Eye, FileEdit, Globe, Instagram, Linkedin, Network, Newspaper, Palette, ScrollText, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

// Custom X (Twitter) icon component to match lucide-react style
const XTwitterIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
);

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



    // Close modal on escape key and open Airtable on 'e' key
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            } else if (e.key === 'e' && entity?.record_id) {
                // Open Airtable record in new tab
                window.open(`https://airtable.com/appJtP9H7xvsl3yAN/tblUbh0OZdOiZyrZ3/${entity.record_id}`, '_blank');
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [handleClose, entity]);

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
                    <CloseButton onClick={handleClose} />
                </div>
            );
        }

        if (!entity) {
            return (
                <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1 pr-4">Entity Not Found</h2>
                    <CloseButton onClick={handleClose} />
                </div>
            );
        }

        return (
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 leading-tight flex-1">
                    {entity.entity}: {entity.entity_long}
                </h2>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        <ShareButton entityName={entity.entity} />
                        <CloseButton onClick={handleClose} />
                    </div>
                    <Link
                        href={generateContributeUrl(entity)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-start gap-2 h-8 px-2 sm:px-3 rounded-md transition-colors text-sm text-gray-500 bg-white hover:bg-un-blue/10 hover:text-un-blue border border-gray-200 hover:border-un-blue flex-shrink-0 font-normal w-full"
                        aria-label={`Contribute information about ${entity.entity}`}
                    >
                        <FileEdit className="h-4 w-4" />
                        <span className="hidden sm:inline">Contribute</span>
                    </Link>
                </div>
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
                {/* Logo */}
                {entity!.entity_logo_available && (
                    <EntityLogo
                        entityName={entity!.entity}
                        entityLong={entity!.entity_long}
                        className="h-12 sm:h-14 lg:h-16 w-auto max-w-48"
                    />
                )}

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
                        {/* System Grouping */}
                        <Field label="System Grouping">
                            <SystemGroupingBadge
                                grouping={entity!.system_grouping}
                                clickable={true}
                            />
                        </Field>
                        {/* Principal Organ(s) */}
                        <Field label={getPrincipalOrganLabel(entity!.un_principal_organ)}>
                            <PrincipalOrganField principalOrgan={entity!.un_principal_organ} />
                        </Field>
                    </div>
                </div>

                {/* Leadership */}
                {(() => {
                    // Check if there's any actual displayable leadership information
                    const hasName = entity!.head_of_entity_name && entity!.head_of_entity_name !== "Not applicable";
                    const hasLevel = entity!.head_of_entity_level && entity!.head_of_entity_level !== "Not applicable";

                    // Only show the section if there's at least a name or level to display
                    if (!hasName && !hasLevel) {
                        return null;
                    }

                    return (
                        <div>
                            <SubHeader>Leadership</SubHeader>
                            <div className="space-y-4">
                                {hasName && (
                                    <Field label="Head of Entity">
                                        {(() => {
                                            // Temporarily hidden until headshot links are fixed
                                            const hasPhoto = false; // entity!.head_of_entity_headshot_link && entity!.head_of_entity_headshot_link.trim() !== '';

                                            if (hasPhoto) {
                                                return (
                                                    <div className="flex items-start gap-4 ml-0.5">
                                                        <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <Image
                                                                src={entity!.head_of_entity_headshot_link!}
                                                                alt={`Portrait of ${entity!.head_of_entity_name}`}
                                                                fill
                                                                className="object-cover object-top"
                                                                unoptimized={true}
                                                                onError={(e) => {
                                                                    console.log('Image failed to load:', entity!.head_of_entity_headshot_link);
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col justify-center min-h-[5rem]">
                                                            <div>
                                                                {/* Temporarily disabled link */}
                                                                {/* {entity!.head_of_entity_bio_link && entity!.head_of_entity_bio_link.startsWith('https') ? (
                                                                    <a
                                                                        href={entity!.head_of_entity_bio_link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-un-blue hover:opacity-80 transition-opacity duration-200 text-base font-semibold underline decoration-1 underline-offset-2 leading-relaxed block"
                                                                    >
                                                                        {entity!.head_of_entity_name}
                                                                    </a>
                                                                ) : ( */}
                                                                <span className="text-un-blue text-base font-semibold leading-relaxed block">{entity!.head_of_entity_name}</span>
                                                                {/* )} */}
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
                                                        {/* Temporarily disabled link */}
                                                        {/* {entity!.head_of_entity_bio_link && entity!.head_of_entity_bio_link.startsWith('https') ? (
                                                            <a
                                                                href={entity!.head_of_entity_bio_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-un-blue hover:opacity-80 transition-opacity duration-200 text-base font-semibold underline decoration-1 underline-offset-2 leading-relaxed block"
                                                            >
                                                                {entity!.head_of_entity_name}
                                                            </a>
                                                        ) : ( */}
                                                        <span className="text-un-blue text-base font-semibold leading-relaxed block">{entity!.head_of_entity_name}</span>
                                                        {/* )} */}
                                                        {entity!.head_of_entity_title_specific && entity!.head_of_entity_title_specific !== "Not applicable" && (
                                                            <div className="text-gray-500 text-base leading-tight">{entity!.head_of_entity_title_specific}</div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </Field>
                                )}
                                {hasLevel && (
                                    <Field label="Post Level">
                                        <Badge>{entity!.head_of_entity_level}</Badge>
                                    </Field>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Links */}
                {(() => {
                    const hasLinks =
                        isValidLink(entity!.entity_link) ||
                        isValidLink(entity!.entity_news_page) ||
                        isValidLink(entity!.entity_branding_page) ||
                        isValidLink(entity!.entity_data_page) ||
                        isValidLink(entity!.entity_careers_page) ||
                        isValidLink(entity!.annual_reports_link) ||
                        isValidLink(entity!.transparency_portal_link) ||
                        isValidLink(entity!.budget_financial_reporting_link) ||
                        isValidLink(entity!.strategic_plan_link) ||
                        isValidLink(entity!.results_framework_link) ||
                        isValidLink(entity!.organizational_chart_link) ||
                        isValidLink(entity!.entity_custom_mandate_registry);

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


                                {/* Annual Report */}
                                {isValidLink(entity!.annual_reports_link) && (
                                    <LinkItem href={entity!.annual_reports_link} icon={Book} label="Reports" />
                                )}

                                {/* UN Mandate Source Registry - Always show */}
                                {(() => {
                                    const mandateUrl = isValidLink(entity!.entity_mandate_registry)
                                        ? entity!.entity_mandate_registry!
                                        : `https://mandates.un.org/entity/${entity!.entity.toUpperCase()}`;

                                    return <LinkItem href={mandateUrl} icon={ScrollText} label="UN Mandate Source Registry" />;
                                })()}

                                {/* Entity Mandate Registry - Only show if custom mandate registry exists */}
                                {isValidLink(entity!.entity_custom_mandate_registry) && (
                                    <LinkItem href={entity!.entity_custom_mandate_registry!} icon={ScrollText} label="Custom Mandate Registry" />
                                )}

                                {/* Financials */}
                                {isValidLink(entity!.budget_financial_reporting_link) && (
                                    <LinkItem href={entity!.budget_financial_reporting_link} icon={DollarSign} label="Financials & Budget" />
                                )}

                                {/* Transparency Portal */}
                                {isValidLink(entity!.transparency_portal_link) && (
                                    <LinkItem href={entity!.transparency_portal_link} icon={Eye} label="Transparency Portal" />
                                )}

                                {/* Strategic Plan */}
                                {isValidLink(entity!.strategic_plan_link) && (
                                    <LinkItem href={entity!.strategic_plan_link} icon={Target} label="Strategic Plan" />
                                )}

                                {/* Results Framework */}
                                {isValidLink(entity!.results_framework_link) && (
                                    <LinkItem href={entity!.results_framework_link} icon={BarChart3} label="Results Framework" />
                                )}

                                {/* Organizational Chart */}
                                {isValidLink(entity!.organizational_chart_link) && (
                                    <LinkItem href={entity!.organizational_chart_link!} icon={Network} label="Organizational Chart" />
                                )}

                                {/* Data Page */}
                                {isValidLink(entity!.entity_data_page) && (
                                    <LinkItem href={entity!.entity_data_page!} icon={Database} label="Data Portal" />
                                )}

                                {/* News Portal */}
                                {isValidLink(entity!.entity_news_page) && (
                                    <LinkItem href={entity!.entity_news_page!} icon={Newspaper} label="News" />
                                )}

                                {/* Branding Page */}
                                {isValidLink(entity!.entity_branding_page) && (
                                    <LinkItem href={entity!.entity_branding_page!} icon={Palette} label="Branding" />
                                )}

                                {/* Jobs Page */}
                                {isValidLink(entity!.entity_careers_page) && (
                                    <LinkItem href={entity!.entity_careers_page!} icon={Briefcase} label="Careers" />
                                )}

                            </div>
                        </div>
                    );
                })()}

                {/* Socials */}
                {(() => {
                    const hasSocials =
                        isValidLink(entity!.socials_linkedin) ||
                        isValidLink(entity!.socials_twitter) ||
                        isValidLink(entity!.socials_instagram);

                    if (!hasSocials) {
                        return null;
                    }

                    return (
                        <div>
                            <SubHeader>Socials</SubHeader>
                            <div className="space-y-1">
                                {/* LinkedIn */}
                                {isValidLink(entity!.socials_linkedin) && (
                                    <LinkItem href={entity!.socials_linkedin!} icon={Linkedin} label="LinkedIn" />
                                )}

                                {/* X (formerly Twitter) */}
                                {isValidLink(entity!.socials_twitter) && (
                                    <LinkItem href={entity!.socials_twitter!} icon={XTwitterIcon} label="X (formerly Twitter)" />
                                )}

                                {/* Instagram */}
                                {isValidLink(entity!.socials_instagram) && (
                                    <LinkItem href={entity!.socials_instagram!} icon={Instagram} label="Instagram" />
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Footnotes */}
                {entity!.entity_footnotes && entity!.entity_footnotes.trim() !== '' && (
                    <div className="border-t border-gray-100 pt-2 mt-6">
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Notes</div>
                        <div className="text-xs text-gray-500 leading-snug space-y-0.5 ml-1.5">
                            {entity!.entity_footnotes.split('\n').filter(line => line.trim()).map((line, index) => (
                                <div key={index} className="flex items-start">
                                    <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                                    <span>{line.replace(/^-\s*/, '').trim()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
