'use client';

import { ExternalLink } from 'lucide-react';

interface PrincipalOrganBadgeProps {
    organ: string;
    className?: string;
}

// Mapping of UN Principal Organs to their official URLs
const PRINCIPAL_ORGAN_URLS: Record<string, string> = {
    // General Assembly
    'General Assembly (GA)': 'https://www.un.org/ga/',
    
    // Security Council
    'Security Council (SC)': 'https://www.un.org/securitycouncil/',
    
    // Economic and Social Council
    'Economic and Social Council (ECOSOC)': 'https://ecosoc.un.org/',
    
    // International Court of Justice
    'International Court of Justice (ICJ)': 'https://www.icj-cij.org/',
    
    // Secretariat
    'Secretariat': 'https://www.un.org/about-us/secretariat',
    
    // Note: 'Other' and null/NaN values will not have clickable links
};

/**
 * Finds the best matching URL for a given organ name
 * Uses exact match first, then fallback to partial matching
 */
function getOrganUrl(organ: string): string | null {
    // Exact match
    if (PRINCIPAL_ORGAN_URLS[organ]) {
        return PRINCIPAL_ORGAN_URLS[organ];
    }
    
    // Partial match - find if the organ contains any of the known keys
    const organLower = organ.toLowerCase();
    for (const [key, url] of Object.entries(PRINCIPAL_ORGAN_URLS)) {
        if (organLower.includes(key.toLowerCase()) || key.toLowerCase().includes(organLower)) {
            return url;
        }
    }
    
    return null;
}

export default function PrincipalOrganBadge({ organ, className = '' }: PrincipalOrganBadgeProps) {
    const url = getOrganUrl(organ);
    const isClickable = Boolean(url);
    
    const badgeClasses = `
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
        ${isClickable 
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer transition-colors duration-200' 
            : 'bg-gray-200 text-gray-800'
        }
        ${className}
    `.trim();
    
    const content = (
        <>
            {organ}
            {isClickable && <ExternalLink className="w-3 h-3" />}
        </>
    );
    
    if (isClickable && url) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={badgeClasses}
                title={`Visit ${organ} website`}
            >
                {content}
            </a>
        );
    }
    
    return (
        <span className={badgeClasses}>
            {content}
        </span>
    );
}

// Export the URL mapping for easy editing
export { PRINCIPAL_ORGAN_URLS };