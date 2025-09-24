'use client';

import { Entity } from '@/types/entity';
import { X, ExternalLink } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

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

    if (loading) {
        return (
            <div
                className={`fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-300 ease-out ${
                    isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleBackdropClick}
            >
                <div 
                    ref={modalRef}
                    className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 sm:min-w-[400px] lg:min-w-[500px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out ${
                        isVisible && !isClosing ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse flex-1 mr-4"></div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 touch-manipulation flex-shrink-0"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!entity) {
        return (
            <div
                className={`fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-300 ease-out ${
                    isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleBackdropClick}
            >
                <div 
                    ref={modalRef}
                    className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 sm:min-w-[400px] lg:min-w-[500px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out ${
                        isVisible && !isClosing ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1 pr-4">Entity Not Found</h2>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 touch-manipulation flex-shrink-0"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6">
                        <p className="text-gray-600">The requested entity could not be found.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-300 ease-out ${
                isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 sm:min-w-[400px] lg:min-w-[500px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
                    isVisible && !isClosing ? 'translate-x-0' : 'translate-x-full'
                }`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-4 leading-tight flex-1">{entity.entity_long}</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 touch-manipulation flex-shrink-0"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">Overview</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="font-medium text-sm sm:text-base block sm:inline">Category:</span>
                                <span className="text-sm sm:text-base block sm:inline sm:ml-2">{entity.category}</span>
                            </div>
                            <div>
                                <span className="font-medium text-sm sm:text-base block sm:inline">UN Principal Organ:</span>
                                <span className="text-sm sm:text-base block sm:inline sm:ml-2">{entity.un_principal_organ}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {entity.entity_description && (
                        <div>
                            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{entity.entity_description}</p>
                        </div>
                    )}

                    {/* Links */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">Links</h3>
                        <div className="space-y-4">
                            {/* Website */}
                            {entity.entity_link && entity.entity_link.startsWith('https') && (
                                <a
                                    href={entity.entity_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 p-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                                >
                                    <ExternalLink size={18} className="flex-shrink-0" />
                                    <span className="text-sm sm:text-base">Website</span>
                                </a>
                            )}

                            {/* Annual Report */}
                            {entity.annual_reports_link && entity.annual_reports_link.startsWith('https') && (
                                <a
                                    href={entity.annual_reports_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 p-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                                >
                                    <ExternalLink size={18} className="flex-shrink-0" />
                                    <span className="text-sm sm:text-base">Annual Report</span>
                                </a>
                            )}

                            {/* Financials */}
                            {entity.budget_financial_reporting_link && entity.budget_financial_reporting_link.startsWith('https') && (
                                <a
                                    href={entity.budget_financial_reporting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 p-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                                >
                                    <ExternalLink size={18} className="flex-shrink-0" />
                                    <span className="text-sm sm:text-base">Financial Reporting</span>
                                </a>
                            )}

                            {/* Transparency Portal */}
                            {entity.transparency_portal_link && entity.transparency_portal_link.startsWith('https') && (
                                <a
                                    href={entity.transparency_portal_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 p-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                                >
                                    <ExternalLink size={18} className="flex-shrink-0" />
                                    <span className="text-sm sm:text-base">Transparency Portal</span>
                                </a>
                            )}

                            {/* Strategic Plan */}
                            {entity.strategic_plan_link && entity.strategic_plan_link.startsWith('https') && (
                                <a
                                    href={entity.strategic_plan_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 p-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                                >
                                    <ExternalLink size={18} className="flex-shrink-0" />
                                    <span className="text-sm sm:text-base">Strategic Plan</span>
                                </a>
                            )}

                            {/* Results Framework */}
                            {entity.results_framework_link && entity.results_framework_link.startsWith('https') && (
                                <a
                                    href={entity.results_framework_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-un-blue hover:opacity-80 transition-opacity duration-200 p-3 rounded-lg hover:bg-blue-50 touch-manipulation"
                                >
                                    <ExternalLink size={18} className="flex-shrink-0" />
                                    <span className="text-sm sm:text-base">Results Framework</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
