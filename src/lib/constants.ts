// Centralized constants for UN System Chart Navigator ------------------------------
// This file contains all configuration for principal organs and categories

export interface PrincipalOrganConfig {
  label: string;
  order: number;
  bgColor: string;
  textColor: string;
  sectionHeading?: string; // Optional higher-level heading for the organ
}

// NOTE: keys here need to match entity.un_principal_organ
export const principalOrganConfigs: Record<string, PrincipalOrganConfig> = {
  "General Assembly": {
    label: "General Assembly",
    sectionHeading: "SUBSIDIARY ORGANS",
    order: 1,
    bgColor: "bg-un-system-green",
    textColor: "text-black",
  },
  "Security Council": {
    label: "Security Council",
    sectionHeading: "SUBSIDIARY ORGANS",
    order: 2,
    bgColor: "bg-un-system-red",
    textColor: "text-black",
  },
  "Economic and Social Council": {
    label: "Economic and Social Council",
    sectionHeading: "COMMISSIONS AND OTHER SUBSIDIARY ORGANS",
    order: 3,
    bgColor: "bg-un-system-blue",
    textColor: "text-black",
  },
  Secretariat: {
    label: "Secretariat",
    sectionHeading: "DEPARTMENTS AND OFFICES",
    order: 4,
    bgColor: "bg-un-system-yellow",
    textColor: "text-black",
  },
  "International Court of Justice": {
    label: "International Court of Justice",
    sectionHeading: "",
    order: 5,
    bgColor: "bg-un-system-purple",
    textColor: "text-black",
  },
  "Trusteeship Council": {
    label: "Trusteeship Council",
    sectionHeading: "",
    order: 6,
    bgColor: "bg-un-system-brown",
    textColor: "text-black",
  },
  Other: {
    label: "Other",
    order: 998,
    bgColor: "bg-gray-300",
    textColor: "text-black",
  },
  "N/A": {
    label: "N/A",
    order: 999,
    bgColor: "bg-gray-300",
    textColor: "text-gray-600",
  },
};

/**
 * Get all principal organs sorted by their order
 */
export function getSortedPrincipalOrgans(): Array<
  [string, PrincipalOrganConfig]
> {
  return Object.entries(principalOrganConfigs).sort(
    ([, a], [, b]) => a.order - b.order,
  );
}

/**
 * Get label for a principal organ
 */
export function getPrincipalOrganLabel(organ: string | null): string {
  if (!organ) return "Other";
  return principalOrganConfigs[organ]?.label || organ;
}

/**
 * Normalize principal organ value (handle arrays and null)
 */
export function normalizePrincipalOrgan(
  organ: string[] | string | null,
): string | null {
  if (!organ) return null;
  if (Array.isArray(organ)) {
    return organ[0] || null;
  }
  return organ;
}

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Numbered footnote definitions
 * These are the actual footnote texts that will be displayed at the bottom
 */
export const footnoteDefinitions: Record<number, string> = {
  1: "Member of the United Nations System Chief Executives Board for Coordination (CEB).",
  2: "The United Nations Office for Partnerships is the focal point vis-à-vis the United Nations Foundation, Inc.",
  3: "These organizations are separate and independent from the United Nations. They have been brought into relationship with the United Nations through relationship agreements.",
  4: "The Trusteeship Council suspended operations on 1 November 1994, as Palau, the last United Nations Trust Territory, became independent on 1 October 1994.",
  5: "International Centre for Settlement of Investment Disputes (ICSID) and Multilateral Investment Guarantee Agency (MIGA) are not specialized agencies in accordance with Articles 57 and 63 of the Charter, but are part of the World Bank Group.",
  6: "The secretariats of these organs are part of the United Nations Secretariat.",
  7: "The Secretariat also includes the following offices: the Ethics Office, United Nations Ombudsman and Mediation Services, and the Office of Administration of Justice.",
  8: "For a complete list of ECOSOC subsidiary organs see un.org/ecosoc.",
  9: "HLPF was established by the General Assembly. Meetings of HLPF are separately convened under the auspices of the General Assembly and of the Economic and Social Council.",
};

/**
 * Category footnotes - maps categories to footnote numbers
 * Key format: "PrincipalOrgan|Category"
 * Value is an array of footnote numbers that apply to this category
 */
export const categoryFootnotes: Record<string, number[]> = {
  "Trusteeship Council": [4],
  "General Assembly|Funds and Programmes": [1],
  "Economic and Social Council|Regional Commissions": [6],
  "Economic and Social Council|Specialized Agencies": [1, 3],
  "Economic and Social Council|Other Bodies": [8],
  "Secretariat|Departments and Offices": [7],
  "Other|Related Organizations": [3],
};

/**
 * Get footnote numbers for a category within a principal organ context
 * @param principalOrgan - The principal organ context
 * @param category - The category name (optional - if omitted, returns organ-level footnotes)
 * @returns Array of footnote numbers or null if no footnotes exist
 */
export function getCategoryFootnote(
  principalOrgan: string | null,
  category?: string,
): number[] | null {
  if (!principalOrgan) return null;

  // If no category provided, look for organ-level footnotes
  if (!category) {
    return categoryFootnotes[principalOrgan] || null;
  }

  // Look for category-level footnotes
  const key = `${principalOrgan}|${category}`;
  return categoryFootnotes[key] || null;
}

/**
 * Hierarchical category ordering by principal organ
 * Each principal organ has its own category order
 */
export const categoryOrderByPrincipalOrgan: Record<
  string,
  Record<string, number>
> = {
  "General Assembly": {
    "Intergovernmental and Expert Bodies": 1,
    "Funds and Programmes": 2,
    "Research and Training": 3,
    "Other Entities": 4,
    "Related Organizations": 5,
    "N/A": 999,
  },
  "Security Council": {
    "": 1,
  },
  "Economic and Social Council": {
    "Functional Commissions": 1,
    "Regional Commissions": 2,
    "Other Bodies": 3,
    "Research and Training": 4,
    "Specialized Agencies": 5,
    "N/A": 999,
  },
  Secretariat: {
    "Departments and Offices": 1,
    "N/A": 999,
  },
  "International Court of Justice": {},
  "Trusteeship Council": {
    "N/A": 999,
  },
  Other: {
    "Related Organizations": 1,
    "N/A": 999,
  },
  "N/A": {
    "Related Organizations": 1,
    "N/A": 999,
  },
};

/**
 * Get all categories sorted by their order within a principal organ context
 * @param categories - Array of category names to sort
 * @param principalOrgan - The principal organ context for hierarchical sorting
 * @returns Sorted array of category names
 */
export function getSortedCategories(
  categories: string[],
  principalOrgan: string | null,
): string[] {
  return categories.sort((a, b) => {
    let orderA = 999;
    let orderB = 999;

    if (principalOrgan && categoryOrderByPrincipalOrgan[principalOrgan]) {
      orderA = categoryOrderByPrincipalOrgan[principalOrgan][a] ?? 999;
      orderB = categoryOrderByPrincipalOrgan[principalOrgan][b] ?? 999;
    }

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Fallback to alphabetical if same order or not configured
    return a.localeCompare(b);
  });
}

// ============================================================================
// SUBCATEGORIES
// ============================================================================

/**
 * Subcategory ordering by principal organ
 * Allows fine-grained control over subcategory display order
 *
 * For Security Council (SC):
 * - Category is always "Subsidiary Organs"
 * - Subcategories are what matter and need ordering (alphabetically)
 */
export const subcategoryOrderByPrincipalOrgan: Record<
  string,
  Record<string, number>
> = {
  "Security Council": {
    "Counter-Terrorism Committee": 1,
    "International Residual Mechanism for Criminal Tribunals": 2,
    "Military Staff Committee": 3,
    "Peacekeeping operations and special political missions": 4,
    "Standing committees and ad hoc bodies": 5,
    "Sanctions Committees": 6,
    "": 999, // Empty subcategory (entities without subcategory)
  },
};

/**
 * Get all subcategories sorted by their order within a principal organ context
 * @param subcategories - Array of subcategory names to sort
 * @param principalOrgan - The principal organ context for hierarchical sorting
 * @returns Sorted array of subcategory names
 */
export function getSortedSubcategories(
  subcategories: string[],
  principalOrgan: string | null,
): string[] {
  return subcategories.sort((a, b) => {
    let orderA = 999;
    let orderB = 999;

    if (principalOrgan && subcategoryOrderByPrincipalOrgan[principalOrgan]) {
      orderA = subcategoryOrderByPrincipalOrgan[principalOrgan][a] ?? 999;
      orderB = subcategoryOrderByPrincipalOrgan[principalOrgan][b] ?? 999;
    }

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Fallback: empty string goes last, then alphabetical
    if (a === "" && b !== "") return 1;
    if (a !== "" && b === "") return -1;
    return a.localeCompare(b);
  });
}
