import { Impact } from '@/types/impact';
import impactData from '../../public/impact.json';

export const getAllImpacts = (): Impact[] => {
    return impactData as Impact[];
};

export const getImpactsByEntity = (entityCode: string): Impact[] => {
    return getAllImpacts().filter(impact => impact.entity === entityCode);
};
