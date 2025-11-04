import Image from 'next/image';

interface EntityLogoProps {
    logoUrl: string;
    entityName: string;
    entityLong?: string;
    className?: string;
}

export default function EntityLogo({ logoUrl, entityName, entityLong, className = '' }: EntityLogoProps) {
    return (
        <Image
            src={logoUrl}
            alt={`${entityLong || entityName} logo`}
            width={192}
            height={64}
            className={`object-contain object-left ${className}`}
            sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 64px"
            priority={false}
            unoptimized={true}
        />
    );
}