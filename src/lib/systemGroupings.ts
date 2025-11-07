// Centralized system grouping configuration
// This defines the visual styling and metadata for each system grouping used across the app

export interface SystemGroupingStyle {
    bgColor: string;
    textColor: string;
    order: number;
    label: string;
}

export const systemGroupingStyles: Record<string, SystemGroupingStyle> = {
    'UN Secretariat': {
        label: 'UN Secretariat',
        bgColor: 'bg-un-system-yellow',
        textColor: 'text-black',
        order: 1
    },
    'Peacekeeping Operations and Political Missions': {
        label: 'Peacekeeping Operations, Special Political Missions, etc.',
        bgColor: 'bg-un-system-red',
        textColor: 'text-black',
        order: 2
    },
    'Regional Commissions': {
        label: 'Regional Commissions',
        bgColor: 'bg-un-system-blue',
        textColor: 'text-black',
        order: 3
    },
    'Other Bodies': {
        label: 'Other Bodies',
        bgColor: 'bg-un-system-blue',
        textColor: 'text-black',
        order: 4
    },
    'Intergovernmental and Expert Bodies': {
        label: 'Intergovernmental and Expert Bodies',
        bgColor: 'bg-un-system-green',
        textColor: 'text-black',
        order: 5
    },
    'Funds and Programmes': {
        label: 'Funds & Programmes',
        bgColor: 'bg-un-system-green',
        textColor: 'text-black',
        order: 6
    },
    'Research and Training': {
        label: 'Research & Training',
        bgColor: 'bg-un-system-green',
        textColor: 'text-black',
        order: 7
    },
    'Other Entities': {
        label: 'Other Entities',
        bgColor: 'bg-un-system-green',
        textColor: 'text-black',
        order: 8
    },
    'International Court of Justice': {
        label: 'International Court of Justice',
        bgColor: 'bg-un-system-purple',
        textColor: 'text-black',
        order: 9
    },
    'Specialized Agencies': {
        label: 'Specialized Agencies',
        bgColor: 'bg-un-system-dark-gray',
        textColor: 'text-black',
        order: 10
    },
    'Related Organizations': {
        label: 'Related Organizations',
        bgColor: 'bg-un-system-dark-gray',
        textColor: 'text-black',
        order: 11
    },
};

/**
 * Get style configuration for a system grouping
 * Falls back to default gray styling if grouping is not found
 */
export function getSystemGroupingStyle(grouping: string): SystemGroupingStyle {
    return systemGroupingStyles[grouping] || {
        bgColor: 'bg-gray-400',
        textColor: 'text-white',
        order: 999,
        label: grouping
    };
}

/**
 * Get all system groupings sorted by their order
 */
export function getSortedSystemGroupings(): Array<[string, SystemGroupingStyle]> {
    return Object.entries(systemGroupingStyles).sort(([, a], [, b]) => a.order - b.order);
}