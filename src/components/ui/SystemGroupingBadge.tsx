'use client';

import { getSystemGroupingStyle } from '@/lib/systemGroupings';

interface SystemGroupingBadgeProps {
    grouping: string;
    className?: string;
}

/**
 * A badge component that displays system grouping with consistent colors
 * across the application
 */
export function SystemGroupingBadge({ grouping, className = '' }: SystemGroupingBadgeProps) {
    const styles = getSystemGroupingStyle(grouping);

    return (
        <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${styles.bgColor} ${styles.textColor} ${className}`}
        >
            {styles.label}
        </span>
    );
}