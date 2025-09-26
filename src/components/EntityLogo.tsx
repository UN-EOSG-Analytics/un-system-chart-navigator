import Image from 'next/image';
import { useState } from 'react';

interface EntityLogoProps {
    entityName: string;
    entityLong?: string;
    className?: string;
    fallback?: React.ReactNode;
}

const LOGO_EXTENSIONS = ['svg', 'png', 'jpg', 'jpeg'];

export default function EntityLogo({ entityName, entityLong, className = '', fallback }: EntityLogoProps) {
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0);
    const [hasError, setHasError] = useState(false);

    // Reset error state when entity changes
    const resetError = () => {
        setCurrentExtensionIndex(0);
        setHasError(false);
    };

    // Try next extension or mark as failed
    const handleError = () => {
        if (currentExtensionIndex < LOGO_EXTENSIONS.length - 1) {
            setCurrentExtensionIndex(prev => prev + 1);
        } else {
            setHasError(true);
        }
    };

    // Generate logo path for current extension
    const getLogoPath = () => {
        const extension = LOGO_EXTENSIONS[currentExtensionIndex];
        return `/images/logos/${entityName}.${extension}`;
    };

    // Don't render anything if all attempts failed and no fallback
    if (hasError && !fallback) {
        return null;
    }

    // Render fallback if all attempts failed
    if (hasError) {
        return <>{fallback}</>;
    }

    return (
        <Image
            src={getLogoPath()}
            alt={`${entityLong || entityName} logo`}
            width={192}
            height={64}
            className={`object-contain object-left ${className}`}
            onError={handleError}
            onLoad={resetError}
            sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 64px"
            priority={false}
        />
    );
}