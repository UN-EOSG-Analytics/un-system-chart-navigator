'use client';

import { Organ } from '@/types';
import { Globe, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrganSlug } from '@/lib/organs';

interface OrganModalProps {
    organ: Organ | null;
    onClose: () => void;
    loading?: boolean;
}

export default function OrganModal({ organ, onClose, loading = false }: OrganModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [handleClose]);

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

        if (isRightSwipe) {
            handleClose();
        }
    };

    useEffect(() => {
        const originalOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.documentElement.style.overflow = originalOverflow;
        };
    }, []);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const CloseButton = () => (
        <button
            onClick={handleClose}
            className="flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 ease-out touch-manipulation text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-gray-100 cursor-pointer focus:outline-none focus:bg-gray-400 focus:text-gray-100 flex-shrink-0"
            aria-label="Close modal"
            title="Close modal"
        >
            <X className="h-3 w-3" />
        </button>
    );

    const SubHeader = ({ children }: { children: React.ReactNode }) => (
        <h3 className="text-lg sm:text-xl font-normal text-gray-900 mb-3 uppercase tracking-wider">{children}</h3>
    );

    const FieldLabel = ({ children }: { children: React.ReactNode }) => (
        <span className="font-normal text-gray-600 text-sm uppercase tracking-wide">{children}</span>
    );

    const Badge = ({ children, clickable, onClick }: { children: React.ReactNode; clickable?: boolean; onClick?: () => void }) => (
        <span 
            className={`inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium ${clickable ? 'cursor-pointer hover:bg-gray-300 transition-colors' : ''}`}
            onClick={onClick}
        >
            {children}
        </span>
    );

    const FieldValue = ({ children }: { children: React.ReactNode }) => (
        <div className="mt-0.5">{children}</div>
    );

    const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <FieldValue>{children}</FieldValue>
        </div>
    );

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

    const renderHeader = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-48 animate-pulse flex-1 mr-4"></div>
                    <CloseButton />
                </div>
            );
        }

        if (!organ) {
            return (
                <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1 pr-4">Organ Not Found</h2>
                    <CloseButton />
                </div>
            );
        }

        return (
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 leading-tight flex-1">
                    {organ.short_name}: {organ.long_name}
                </h2>
                <CloseButton />
            </div>
        );
    };

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

        if (!organ) {
            return (
                <div className="p-4 sm:p-6">
                    <p className="text-gray-600">The requested organ could not be found.</p>
                </div>
            );
        }

        return (
            <div className="px-6 sm:px-8 pt-4 sm:pt-5 pb-6 sm:pb-8 space-y-6">
                <div>
                    <SubHeader>Overview</SubHeader>
                    <div className="space-y-4">
                        <Field label="Type">
                            <Badge>{organ.type}</Badge>
                        </Field>
                        {organ.parent_body.length > 0 && (
                            <Field label="Parent Body">
                                <div className="flex flex-wrap gap-2">
                                    {organ.parent_body.map(parent => (
                                        <Badge 
                                            key={parent}
                                            clickable
                                            onClick={() => {
                                                const slug = createOrganSlug(parent);
                                                router.replace(`/?organ=${slug}`, { scroll: false });
                                            }}
                                        >
                                            {parent}
                                        </Badge>
                                    ))}
                                </div>
                            </Field>
                        )}
                    </div>
                </div>

                {organ.url && (
                    <div>
                        <SubHeader>Links</SubHeader>
                        <div className="space-y-1">
                            <LinkItem href={organ.url} icon={Globe} label="Official Website" />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={`fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-300 ease-out ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 sm:min-w-[400px] lg:min-w-[500px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out ${organ ? 'overflow-y-auto' : ''} ${isVisible && !isClosing ? 'translate-x-0' : 'translate-x-full'}`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className={`px-6 sm:px-8 pt-4 sm:pt-6 pb-2 sm:pb-3 border-b border-gray-300 ${organ ? 'sticky top-0 bg-white' : ''}`}>
                    {renderHeader()}
                </div>
                {renderBody()}
            </div>
        </div>
    );
}
