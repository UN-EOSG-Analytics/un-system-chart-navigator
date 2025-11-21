// Centralized constants for UN System Chart Navigator
// This file contains all configuration for system groupings, principal organs, and categories

// ============================================================================
// SYSTEM GROUPINGS
// ============================================================================

export interface SystemGroupingStyle {
  bgColor: string;
  textColor: string;
  order: number;
  label: string;
}

export const systemGroupingStyles: Record<string, SystemGroupingStyle> = {
  "UN Secretariat": {
    label: "UN Secretariat",
    bgColor: "bg-un-system-yellow",
    textColor: "text-black",
    order: 1,
  },
  "Peacekeeping Operations and Political Missions": {
    label: "Peacekeeping Operations, Special Political Missions, etc.",
    bgColor: "bg-un-system-red",
    textColor: "text-black",
    order: 2,
  },
  "Regional Commissions": {
    label: "Regional Commissions",
    bgColor: "bg-un-system-blue",
    textColor: "text-black",
    order: 3,
  },
  "Other Bodies": {
    label: "Other Bodies",
    bgColor: "bg-un-system-blue",
    textColor: "text-black",
    order: 4,
  },
  "Intergovernmental and Expert Bodies": {
    label: "Intergovernmental and Expert Bodies",
    bgColor: "bg-un-system-green",
    textColor: "text-black",
    order: 5,
  },
  "Funds and Programmes": {
    label: "Funds & Programmes",
    bgColor: "bg-un-system-green",
    textColor: "text-black",
    order: 6,
  },
  "Research and Training": {
    label: "Research & Training",
    bgColor: "bg-un-system-green",
    textColor: "text-black",
    order: 7,
  },
  "Other Entities": {
    label: "Other Entities",
    bgColor: "bg-un-system-green",
    textColor: "text-black",
    order: 8,
  },
  "International Court of Justice": {
    label: "International Court of Justice",
    bgColor: "bg-un-system-purple",
    textColor: "text-black",
    order: 9,
  },
  "Specialized Agencies": {
    label: "Specialized Agencies",
    bgColor: "bg-un-system-dark-gray",
    textColor: "text-black",
    order: 10,
  },
  "Related Organizations": {
    label: "Related Organizations",
    bgColor: "bg-un-system-dark-gray",
    textColor: "text-black",
    order: 11,
  },
  Unspecified: {
    label: "Unspecified",
    bgColor: "bg-gray-400",
    textColor: "text-black",
    order: 999,
  },
};

/**
 * Get style configuration for a system grouping
 * Falls back to default gray styling if grouping is not found
 */
export function getSystemGroupingStyle(grouping: string): SystemGroupingStyle {
  return (
    systemGroupingStyles[grouping] || {
      bgColor: "bg-gray-400",
      textColor: "text-white",
      order: 999,
      label: grouping,
    }
  );
}

/**
 * Get all system groupings sorted by their order
 */
export function getSortedSystemGroupings(): Array<
  [string, SystemGroupingStyle]
> {
  return Object.entries(systemGroupingStyles).sort(
    ([, a], [, b]) => a.order - b.order,
  );
}

// ============================================================================
// PRINCIPAL ORGANS
// ============================================================================

export interface PrincipalOrganConfig {
  label: string;
  order: number;
  bgColor: string;
  textColor: string;
}

export const principalOrganConfigs: Record<string, PrincipalOrganConfig> = {
  "General Assembly (GA)": {
    label: "General Assembly (GA)",
    order: 1,
    bgColor: "bg-un-system-green",
    textColor: "text-black",
  },
  "Security Council (SC)": {
    label: "Security Council (SC)",
    order: 2,
    bgColor: "bg-un-system-red",
    textColor: "text-black",
  },
  "Economic and Social Council (ECOSOC)": {
    label: "Economic and Social Council (ECOSOC)",
    order: 3,
    bgColor: "bg-un-system-blue",
    textColor: "text-black",
  },
  Secretariat: {
    label: "Secretariat",
    order: 4,
    bgColor: "bg-un-system-yellow",
    textColor: "text-black",
  },
  "International Court of Justice (ICJ)": {
    label: "International Court of Justice (ICJ)",
    order: 5,
    bgColor: "bg-un-system-purple",
    textColor: "text-black",
  },
  "Trusteeship Council": {
    label: "Trusteeship Council",
    order: 6,
    bgColor: "bg-un-system-dark-gray",
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
 * Category footnotes - explanatory text for specific categories
 * Key format: "PrincipalOrgan|Category"
 * Can be a single string or an array of strings (for bullet points)
 */
export const categoryFootnotes: Record<string, string | string[]> = {
  // 1
  "General Assembly (GA)|Funds and Programmes":
    "Member of the United Nations System Chief Executives Board for Coordination (CEB).",

  // 6
  "Economic and Social Council (ECOSOC)|Regional Commissions":
    "The secretariats of these organs are part of the United Nations Secretariat.",
  "Economic and Social Council (ECOSOC)|Specialized Agencies": [
    "Member of the United Nations System Chief Executives Board for Coordination (CEB).",
    "These organizations are separate and independent from the United Nations. They have been brought into relationship with the United Nations through relationship agreements.",
  ],

  // 8
  "Economic and Social Council (ECOSOC)|Other Bodies":
    "For a complete list of ECOSOC subsidiary organs see un.org/ecosoc.",

  // 7
  "Secretariat|Departments and Offices":
    "The Secretariat also includes the following offices: the Ethics Office, United Nations Ombudsman and Mediation Services, and the Office of Administration of Justice.",
  "Other|Related Organizations":
    "These organizations are separate and independent from the United Nations. They have been brought into relationship with the United Nations through relationship agreements.",
};

/**
 * Get footnote text for a category within a principal organ context
 * @param principalOrgan - The principal organ context
 * @param category - The category name
 * @returns Footnote text (string or array) or null if no footnote exists
 */
export function getCategoryFootnote(
  principalOrgan: string | null,
  category: string,
): string | string[] | null {
  if (!principalOrgan) return null;
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
  "General Assembly (GA)": {
    "Intergovernmental and Expert Bodies": 1,
    "Funds and Programmes": 2,
    "Research and Training": 3,
    "Other Entities": 4,
    "Related Organizations": 5,
    "N/A": 999,
  },
  "Security Council (SC)": {
    "Subsidiary Organs": 1,
    "N/A": 999,
  },
  "Economic and Social Council (ECOSOC)": {
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
  "International Court of Justice (ICJ)": {},
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
  "Security Council (SC)": {
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
