import Image from "next/image";
import { useState } from "react";

interface EntityLogoProps {
  entityName: string;
  entityLong?: string;
  className?: string;
}

const LOGO_EXTENSIONS = ["svg", "png", "jpg", "jpeg"];

export default function EntityLogo({
  entityName,
  entityLong,
  className = "",
}: EntityLogoProps) {
  const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Try next extension or mark as failed
  const handleError = () => {
    if (currentExtensionIndex < LOGO_EXTENSIONS.length - 1) {
      setCurrentExtensionIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  // Generate logo path for current extension
  const getLogoPath = () => {
    const extension = LOGO_EXTENSIONS[currentExtensionIndex];
    return `/images/logos/${entityName}.${extension}`;
  };

  // Don't render anything if all attempts failed
  if (hasError) {
    return null;
  }

  return (
    <Image
      src={getLogoPath()}
      alt={`${entityLong || entityName} logo`}
      width={192}
      height={64}
      className={`object-contain object-left ${className}`}
      sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 64px"
      priority={false}
      unoptimized={true}
      onError={handleError}
    />
  );
}
