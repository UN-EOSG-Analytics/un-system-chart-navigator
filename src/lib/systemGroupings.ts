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
        bgColor: 'bg-un-gray',
        textColor: 'text-black',
        order: 1
    },
    'Peacekeeping Operations and Political Missions': {
        label: 'Peacekeeping Operations, Political Missions, etc.',
        bgColor: 'bg-un-red',
        textColor: 'text-white',
        order: 2
    },
    'Regional Commissions': {
        label: 'Regional Commissions',
        bgColor: 'bg-un-system-aubergine',
        textColor: 'text-white',
        order: 3
    },
    'Funds and Programmes': {
        label: 'Funds & Programmes',
        bgColor: 'bg-camouflage-green',
        textColor: 'text-white',
        order: 4
    },
    'Research and Training': {
        label: 'Research & Training',
        bgColor: 'bg-camouflage-green',
        textColor: 'text-white',
        order: 5
    },
    'Subsidiary Organs': {
        label: 'Subsidiary Organs',
        bgColor: 'bg-trout',
        textColor: 'text-white',
        order: 6
    },
    'International Court of Justice': {
        label: 'International Court of Justice',
        bgColor: 'bg-shuttle-gray',
        textColor: 'text-white',
        order: 7
    },
    'Specialized Agencies': {
        label: 'Specialized Agencies',
        bgColor: 'bg-shuttle-gray',
        textColor: 'text-white',
        order: 8
    },
    'Related Organizations': {
        label: 'Related Organizations',
        bgColor: 'bg-black',
        textColor: 'text-white',
        order: 9
    },
    'Other Entities': {
        label: 'Other Entities',
        bgColor: 'bg-gray-500',
        textColor: 'text-white',
        order: 10
    },
    'Other Bodies': {
        label: 'Other Bodies',
        bgColor: 'bg-pale-oyster',
        textColor: 'text-white',
        order: 11
    }
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