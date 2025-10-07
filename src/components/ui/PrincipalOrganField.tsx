'use client';

import PrincipalOrganBadge from './PrincipalOrganBadge';

interface PrincipalOrganFieldProps {
    principalOrgan: string[] | string | null;
    className?: string;
}

/**
 * Helper function to get the count of principal organs
 */
export function getPrincipalOrganCount(principalOrgan: string[] | string | null): number {
    if (principalOrgan === null) {
        return 0;
    }
    
    if (typeof principalOrgan === 'string') {
        // Check if it's a stringified array
        if (principalOrgan.startsWith('[') && principalOrgan.endsWith(']')) {
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
 */
export function getPrincipalOrganLabel(principalOrgan: string[] | string | null): string {
    const count = getPrincipalOrganCount(principalOrgan);
    return count === 1 ? 'UN Principal Organ' : 'UN Principal Organs';
}

export default function PrincipalOrganField({ principalOrgan, className = '' }: PrincipalOrganFieldProps) {
    // Empty badge component for null cases
    const EmptyBadge = () => (
        <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium"></span>
    );

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {(() => {
                // Handle null case - show empty badge
                if (principalOrgan === null) {
                    return <EmptyBadge />;
                }
                
                // Handle string format
                if (typeof principalOrgan === 'string') {
                    // Check if it's a stringified array
                    if (principalOrgan.startsWith('[') && principalOrgan.endsWith(']')) {
                        try {
                            const parsed = JSON.parse(principalOrgan.replace(/'/g, '"'));
                            return Array.isArray(parsed) 
                                ? parsed.map((organ: string, index: number) => (
                                    <PrincipalOrganBadge key={index} organ={organ} />
                                ))
                                : <PrincipalOrganBadge organ={principalOrgan} />;
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