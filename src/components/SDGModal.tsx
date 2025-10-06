'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Indicator {
  number: string;
  description: string;
  code: string;
}

interface Target {
  number: string;
  description: string;
  indicators: Indicator[];
}

interface SDG {
  number: number;
  shortTitle: string;
  title: string;
  targets: Target[];
}

interface SDGModalProps {
  sdg: SDG | null;
  onClose: () => void;
  color: string;
}

export default function SDGModal({ sdg, onClose, color }: SDGModalProps) {
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

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isRightSwipe) handleClose();
  };

  useEffect(() => {
    const originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = originalOverflow;
    };
  }, []);

  if (!sdg) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-300 ease-out ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 sm:min-w-[400px] lg:min-w-[500px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${isVisible && !isClosing ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b border-gray-300 sticky top-0 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {sdg.number}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  {sdg.shortTitle}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{sdg.title}</p>
            </div>
            <button
              onClick={handleClose}
              className="flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 ease-out touch-manipulation text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-gray-100 cursor-pointer focus:outline-none focus:bg-gray-400 focus:text-gray-100 flex-shrink-0"
              aria-label="Close modal"
              title="Close modal"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-6 space-y-4">
          {sdg.targets.map((target) => (
            <div key={target.number}>
              <h3 className="text-base sm:text-lg font-normal text-gray-900 mb-2 uppercase tracking-wider">
                Target {target.number}
              </h3>
              <p className="text-gray-700 leading-relaxed text-xs sm:text-sm mb-3">
                {target.description}
              </p>
              {target.indicators.length > 0 && (
                <div className="space-y-2 ml-3">
                  {target.indicators.map((indicator) => (
                    <div key={indicator.number} className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className="font-semibold text-gray-900 whitespace-nowrap">
                        {indicator.number}
                      </span>
                      <span className="text-gray-700 leading-relaxed">
                        {indicator.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
