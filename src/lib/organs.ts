import { Organ } from '@/types/organ';

let organs: Organ[] | null = null;

export const getAllOrgans = (): Organ[] => {
    if (!organs) {
        try {
            organs = require('../../public/organs.json');
        } catch (error) {
            console.error('Failed to load organs data:', error);
            organs = [];
        }
    }
    return organs.filter(organ => !organ.defunct);
};

export const getOrganByShort = (short: string): Organ | undefined => {
    return getAllOrgans().find(organ => organ.short_name.toLowerCase() === short.toLowerCase());
};

export const createOrganSlug = (short: string): string => {
    return short.toLowerCase().replace(/\s+/g, '-');
};

export const getOrganTypeStyle = (type: string) => {
    switch (type) {
        case 'Principal Organ':
            return { bgColor: 'bg-un-blue', textColor: 'text-white', order: 1 };
        case 'Regional Commission':
            return { bgColor: 'bg-camouflage-green', textColor: 'text-white', order: 2 };
        case 'Functional Commission':
            return { bgColor: 'bg-faded-jade', textColor: 'text-white', order: 3 };
        case 'Subsidiary Organ':
            return { bgColor: 'bg-shuttle-gray', textColor: 'text-white', order: 4 };
        case 'Mechanism':
            return { bgColor: 'bg-un-system-aubergine', textColor: 'text-white', order: 5 };
        default:
            return { bgColor: 'bg-trout', textColor: 'text-white', order: 999 };
    }
};
