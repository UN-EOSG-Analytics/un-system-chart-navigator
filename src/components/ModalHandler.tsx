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

export default function ModalHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [entitySlug, setEntitySlug] = useState<string | null>(null);
    const [memberStateSlug, setMemberStateSlug] = useState<string | null>(null);
    const [sdgNumber, setSdgNumber] = useState<string | null>(null);
    const [organSlug, setOrganSlug] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
    const organ = organSlug ? getOrganByShort(organSlug.replace(/-/g, ' ')) : null;

    return (
        <>
            {entitySlug && <EntityModal entity={entity} onClose={handleCloseModal} loading={loading} />}
            {memberStateSlug && <MemberStateModal memberState={memberState} onClose={handleCloseModal} loading={loading} />}
            {sdgNumber && <SDGModal sdgNumber={sdgNumber} onClose={handleCloseModal} loading={loading} />}
            {organSlug && <OrganModal organ={organ} onClose={handleCloseModal} loading={loading} />}
        </>
    );
}