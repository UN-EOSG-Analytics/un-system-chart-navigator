'use client';

import { MemberState } from '@/types/entity';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatusStyle, getTotalContributions } from '@/lib/memberStates';
import { formatBudget } from '@/lib/entities';

interface MemberStateModalProps {
    memberState: MemberState | null;
    onClose: () => void;
}

export default function MemberStateModal({ memberState, onClose }: MemberStateModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    }, [onClose]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [handleClose]);

    const minSwipeDistance = 50;
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        if (touchStart - touchEnd < -minSwipeDistance) handleClose();
    };

    useEffect(() => {
        const originalOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        return () => { document.documentElement.style.overflow = originalOverflow; };
    }, []);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) handleClose();
    };

    if (!memberState) return null;

    const statusStyle = getStatusStyle(memberState.status);
    const totalContributions = getTotalContributions(memberState.contributions);

    return (
        <div
            className={`fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-300 ease-out ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 sm:min-w-[400px] lg:min-w-[500px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${isVisible && !isClosing ? 'translate-x-0' : 'translate-x-full'}`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="px-6 sm:px-8 pt-4 sm:pt-6 pb-2 sm:pb-3 border-b border-gray-300 sticky top-0 bg-white">
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 leading-tight flex-1">
                            {memberState.name}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 ease-out touch-manipulation text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-gray-100 cursor-pointer focus:outline-none focus:bg-gray-400 focus:text-gray-100 flex-shrink-0"
                            aria-label="Close modal"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                <div className="px-6 sm:px-8 pt-4 sm:pt-5 pb-6 sm:pb-8 space-y-4">
                    <div>
                        <span className="font-normal text-gray-600 text-sm uppercase tracking-wide">Status</span>
                        <div className="mt-0.5">
                            <span className={`inline-block px-3 py-1 ${statusStyle.bgColor} ${statusStyle.textColor} rounded-full text-sm font-medium`}>
                                {statusStyle.label}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="font-normal text-gray-600 text-sm uppercase tracking-wide">Total Contributions</span>
                        <div className="mt-0.5">
                            <div className="text-gray-700 text-base font-semibold">{formatBudget(totalContributions)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
