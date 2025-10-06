'use client';

import { useEffect, useState } from 'react';
import SDGModal from './SDGModal';
import SDGExpensesTreemap from './SDGExpensesTreemap';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';

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

const SDG_COLORS: Record<number, string> = {
  1: '#E5243B',
  2: '#DDA63A',
  3: '#4C9F38',
  4: '#C5192D',
  5: '#FF3A21',
  6: '#26BDE2',
  7: '#FCC30B',
  8: '#A21942',
  9: '#FD6925',
  10: '#DD1367',
  11: '#FD9D24',
  12: '#BF8B2E',
  13: '#3F7E44',
  14: '#0A97D9',
  15: '#56C02B',
  16: '#00689D',
  17: '#19486A',
};

export default function SDGsGrid() {
  const [sdgs, setSdgs] = useState<SDG[]>([]);
  const [selectedSDG, setSelectedSDG] = useState<SDG | null>(null);
  const [showExpenses, setShowExpenses] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [displayExpenses, setDisplayExpenses] = useState<boolean>(false);

  useEffect(() => {
    fetch('/sdgs.json')
      .then((res) => res.json())
      .then(setSdgs);
  }, []);

  const toggleExpenses = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDisplayExpenses((prev) => !prev);
    setTimeout(() => setShowExpenses((prev) => !prev), 400);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const handleSDGClick = (sdgNumber: number) => {
    const sdg = sdgs.find((s) => s.number === sdgNumber);
    if (sdg) setSelectedSDG(sdg);
  };

  return (
    <>
      {/* Toggle */}
      <div className="flex justify-start mb-3 sm:mb-4">
        <div className="flex items-center gap-2 h-10">
          <label className="text-sm text-gray-600 cursor-pointer" onClick={toggleExpenses}>
            Expenses
          </label>
          <Switch checked={showExpenses} onCheckedChange={toggleExpenses} />
        </div>
      </div>

      {/* Animated View Container */}
      <div className="relative w-full" data-view-container>
        <div
          className="transition-opacity duration-500 ease-in-out"
          style={{ opacity: displayExpenses === showExpenses ? 1 : 0 }}
        >
          {showExpenses ? (
            <SDGExpensesTreemap onSDGClick={handleSDGClick} />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {sdgs.map((sdg) => (
          <Tooltip key={sdg.number} delayDuration={50} disableHoverableContent>
            <TooltipTrigger asChild>
              <div
                className="aspect-square cursor-pointer relative hover:scale-105 hover:shadow-xl active:scale-95 touch-manipulation transition-all overflow-hidden"
                onClick={() => setSelectedSDG(sdg)}
              >
                <img
                  src={`https://www.un.org/sustainabledevelopment/wp-content/uploads/2018/05/E_SDG-goals_icons-individual-rgb-${sdg.number.toString().padStart(2, '0')}.png`}
                  alt={`SDG ${sdg.number}: ${sdg.shortTitle}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div
                  className="hidden w-full h-full items-start p-4 text-white"
                  style={{ backgroundColor: SDG_COLORS[sdg.number] }}
                >
                  <div className="text-2xl sm:text-3xl font-bold mr-2">{sdg.number}</div>
                  <div className="text-xs sm:text-sm font-semibold text-left leading-tight pt-0.5">
                    {sdg.shortTitle}
                  </div>
                </div>
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
                <p className="font-bold text-xs sm:text-sm leading-tight mb-1">{sdg.shortTitle}</p>
                <p className="font-medium text-xs sm:text-sm leading-tight text-slate-600">{sdg.title}</p>
                <p className="text-xs text-slate-500 mt-1 hidden sm:block">Click to view targets and indicators</p>
                <p className="text-xs text-slate-500 mt-1 sm:hidden">Tap to view details</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
              </div>
              <div className="mt-4 mb-8 text-left">
                <p className="text-base text-gray-600">As of September 2025</p>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedSDG && (
        <SDGModal
          sdg={selectedSDG}
          onClose={() => setSelectedSDG(null)}
          color={SDG_COLORS[selectedSDG.number]}
        />
      )}
    </>
  );
}
