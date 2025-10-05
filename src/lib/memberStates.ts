import { MemberState } from '@/types/entity';
import memberStatesData from '@/../public/member-states.json';

export const getStatusStyle = (status: string) => {
    switch (status) {
        case 'member':
            return { bgColor: 'bg-camouflage-green', textColor: 'text-white', label: 'Member State', order: 1 };
        case 'observer':
            return { bgColor: 'bg-un-system-aubergine', textColor: 'text-white', label: 'Observer State', order: 2 };
        case 'nonmember':
            return { bgColor: 'bg-shuttle-gray', textColor: 'text-white', label: 'Non-Member State', order: 3 };
        default:
            return { bgColor: 'bg-gray-500', textColor: 'text-white', label: 'Unknown', order: 999 };
    }
};

export const getAllMemberStates = (): MemberState[] => {
    return Object.entries(memberStatesData as Record<string, any>).map(([name, data]) => ({
        name,
        status: data.status,
        contributions: data.contributions
    }));
};

export const getTotalContributions = (contributions: Record<string, Record<string, number>>): number => {
    return Object.values(contributions).reduce((total, entityContributions) => {
        return total + Object.values(entityContributions).reduce((sum, amount) => sum + amount, 0);
    }, 0);
};
