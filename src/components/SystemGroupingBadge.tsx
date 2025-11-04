'use client';

import { getSystemGroupingStyle } from '@/lib/systemGroupings';
import { useRouter } from 'next/navigation';

interface SystemGroupingBadgeProps {
    grouping: string;
    className?: string;
    onClick?: (grouping: string) => void;
    clickable?: boolean;
}

/**
 * A badge component that displays system grouping with consistent colors
 * across the application
 */
export function SystemGroupingBadge({ 
    grouping, 
    className = '', 
    onClick, 
    clickable = false 
}: SystemGroupingBadgeProps) {
    const styles = getSystemGroupingStyle(grouping);
    const router = useRouter();

    const handleClick = () => {
        if (onClick && clickable) {
            onClick(grouping);
        } else if (clickable) {
            // Fallback: navigate to home and add filter parameter
            router.push(`/?filter=${encodeURIComponent(grouping)}`);
        }
    };

    return (
        <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${styles.bgColor} ${styles.textColor} ${className} ${
                clickable ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''
            }`}
            onClick={handleClick}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={clickable ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            } : undefined}
        >
            {styles.label}
        </span>
    );
}
