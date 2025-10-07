import { MemberState } from '@/types';
import memberStatesData from '@/../public/member-states.json';
import { createEntitySlug } from '@/lib/utils';

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

export const getPaymentStatusStyle = (paymentStatus?: 'punctual' | 'late' | 'missing') => {
    switch (paymentStatus) {
        case 'punctual':
            return { bgColor: 'bg-camouflage-green', textColor: 'text-white', label: 'Paid on time' };
        case 'late':
            return { bgColor: 'bg-amber-600', textColor: 'text-white', label: 'Paid late' };
        case 'missing':
            return { bgColor: 'bg-un-red', textColor: 'text-white', label: 'Not paid' };
        default:
            return null;
    }
};

export const getAllMemberStates = (): MemberState[] => {
    return Object.entries(memberStatesData as Record<string, { status: 'member' | 'observer' | 'nonmember'; contributions: Record<string, Record<string, number>>; payment_date?: string; payment_status?: 'punctual' | 'late' | 'missing' }>).map(([name, data]) => ({
        name,
        status: data.status,
        contributions: data.contributions,
        payment_date: data.payment_date,
        payment_status: data.payment_status
    }));
};

export const getTotalContributions = (contributions: Record<string, Record<string, number>>): number => {
    return Object.values(contributions).reduce((total, entityContributions) => {
        return total + Object.values(entityContributions).reduce((sum, amount) => sum + amount, 0);
    }, 0);
};

export const getMemberStateBySlug = (slug: string): MemberState | null => {
    const decodedSlug = decodeURIComponent(slug).toLowerCase();
    const states = getAllMemberStates();
    return states.find(state => createEntitySlug(state.name) === decodedSlug) || null;
};
