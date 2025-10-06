'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EntityModal from '@/components/EntityModal';
import MemberStateModal from '@/components/MemberStateModal';
import SDGModal from '@/components/SDGModal';
import OrganModal from '@/components/OrganModal';
import { getEntityBySlug } from '@/lib/entities';
import { getMemberStateBySlug } from '@/lib/memberStates';
import { getOrganByShort } from '@/lib/organs';

interface SDG {
    number: number;
    shortTitle: string;
    title: string;
    targets: Array<{
        number: string;
        description: string;
        indicators: Array<{
            number: string;
            description: string;
            code: string;
        }>;
    }>;
}

const SDG_COLORS: Record<number, string> = {
    1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D', 5: '#FF3A21',
    6: '#26BDE2', 7: '#FCC30B', 8: '#A21942', 9: '#FD6925', 10: '#DD1367',
    11: '#FD9D24', 12: '#BF8B2E', 13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B',
    16: '#00689D', 17: '#19486A',
};

export default function ModalHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [entitySlug, setEntitySlug] = useState<string | null>(null);
    const [memberStateSlug, setMemberStateSlug] = useState<string | null>(null);
    const [sdgNumber, setSdgNumber] = useState<string | null>(null);
    const [organSlug, setOrganSlug] = useState<string | null>(null);
    const [sdgs, setSdgs] = useState<SDG[]>([]);

    useEffect(() => {
        fetch('/sdgs.json')
            .then((res) => res.json())
            .then(setSdgs);
    }, []);

    useEffect(() => {
        const entityParam = searchParams.get('entity');
        const stateParam = searchParams.get('state');
        const sdgParam = searchParams.get('sdg');
        const organParam = searchParams.get('organ');

        if (entityParam) {
            setEntitySlug(entityParam);
            setMemberStateSlug(null);
            setSdgNumber(null);
            setOrganSlug(null);
        } else if (stateParam) {
            setMemberStateSlug(stateParam);
            setEntitySlug(null);
            setSdgNumber(null);
            setOrganSlug(null);
        } else if (sdgParam) {
            setSdgNumber(sdgParam);
            setEntitySlug(null);
            setMemberStateSlug(null);
            setOrganSlug(null);
        } else if (organParam) {
            setOrganSlug(organParam);
            setEntitySlug(null);
            setMemberStateSlug(null);
            setSdgNumber(null);
        } else {
            setEntitySlug(null);
            setMemberStateSlug(null);
            setSdgNumber(null);
            setOrganSlug(null);
        }
    }, [searchParams]);

    const handleCloseModal = () => {
        router.replace('/', { scroll: false });
    };

    const entity = entitySlug ? getEntityBySlug(entitySlug) : null;
    const memberState = memberStateSlug ? getMemberStateBySlug(memberStateSlug) : null;
    const organ = organSlug ? getOrganByShort(organSlug.replace(/-/g, ' ')) || null : null;
    const sdg = sdgNumber ? sdgs.find(s => s.number === parseInt(sdgNumber)) || null : null;

    return (
        <>
            {entitySlug && <EntityModal entity={entity} onClose={handleCloseModal} />}
            {memberStateSlug && <MemberStateModal memberState={memberState} onClose={handleCloseModal} />}
            {sdgNumber && sdg && <SDGModal sdg={sdg} onClose={handleCloseModal} color={SDG_COLORS[sdg.number]} />}
            {organSlug && <OrganModal organ={organ} onClose={handleCloseModal} />}
        </>
    );
}