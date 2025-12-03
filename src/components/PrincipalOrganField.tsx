"use client";

import PrincipalOrganBadge from "./PrincipalOrganBadge";

interface PrincipalOrganFieldProps {
  principalOrgan: string[] | string | null;
  className?: string;
}

/**
 * Helper function to get the count of principal organs
 */
export function getPrincipalOrganCount(
  principalOrgan: string[] | string | null,
): number {
  if (principalOrgan === null) {
    return 0;
  }

  if (typeof principalOrgan === "string") {
    // Check if it's a stringified array
    if (principalOrgan.startsWith("[") && principalOrgan.endsWith("]")) {
      try {
        const parsed = JSON.parse(principalOrgan.replace(/'/g, '"'));
        return Array.isArray(parsed) ? parsed.length : 1;
      } catch {
        return 1;
      }
    }
    return 1;
  }

  if (Array.isArray(principalOrgan)) {
    return principalOrgan.length;
  }

  return 1;
}

/**
 * Helper function to get the appropriate label (singular/plural)
 * Returns empty string for Related Organizations and Specialized Agencies
 */
export function getPrincipalOrganLabel(
  principalOrgan: string[] | string | null,
): string {
  // Check if it's Related Organizations or Specialized Agencies - no label needed
  const organs = Array.isArray(principalOrgan)
    ? principalOrgan
    : principalOrgan
      ? [principalOrgan]
      : [];

  if (
    organs.length === 1 &&
    (organs[0] === "Related Organizations" ||
      organs[0] === "Specialized Agencies")
  ) {
    return "";
  }

  const count = getPrincipalOrganCount(principalOrgan);
  return count === 1 ? "Principal Organ" : "Principal Organs";
}

export default function PrincipalOrganField({
  principalOrgan,
  className = "",
}: PrincipalOrganFieldProps) {
  // Empty badge component for null cases
  const EmptyBadge = () => (
    <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800"></span>
  );

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {(() => {
        // Handle null case - show empty badge
        if (principalOrgan === null) {
          return <EmptyBadge />;
        }

        // Handle string format
        if (typeof principalOrgan === "string") {
          // Check if it's a stringified array
          if (principalOrgan.startsWith("[") && principalOrgan.endsWith("]")) {
            try {
              const parsed = JSON.parse(principalOrgan.replace(/'/g, '"'));
              return Array.isArray(parsed) ? (
                parsed.map((organ: string, index: number) => (
                  <PrincipalOrganBadge key={index} organ={organ} />
                ))
              ) : (
                <PrincipalOrganBadge organ={principalOrgan} />
              );
            } catch {
              return <PrincipalOrganBadge organ={principalOrgan} />;
            }
          }
          return <PrincipalOrganBadge organ={principalOrgan} />;
        }

        // Handle array format
        if (Array.isArray(principalOrgan)) {
          return principalOrgan.map((organ: string, index: number) => (
            <PrincipalOrganBadge key={index} organ={organ} />
          ));
        }

        // Fallback
        return <PrincipalOrganBadge organ={String(principalOrgan)} />;
      })()}
    </div>
  );
}
