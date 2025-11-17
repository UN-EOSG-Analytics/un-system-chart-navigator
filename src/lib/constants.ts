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
  "Other": {
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

export interface CategoryConfig {
  label: string;
  order: number;
}

export const categoryConfigs: Record<string, CategoryConfig> = {
  "Departments and Offices": {
    label: "Departments and Offices",
    order: 1,
  },
  "Departments and Offices (Internal Justice Bodies)": {
    label: "Departments and Offices (Internal Justice Bodies)",
    order: 2,
  },
  "Departments and Offices (Other Entities)": {
    label: "Departments and Offices (Other Entities)",
    order: 3,
  },
  "UN Secretariat": {
    label: "UN Secretariat",
    order: 4,
  },
  "Peacekeeping Operations and Political Missions": {
    label: "Peacekeeping Operations and Political Missions",
    order: 5,
  },
  "Subsidiary Organs (Peacekeeping operations and political missions)": {
    label: "Subsidiary Organs (Peacekeeping operations and political missions)",
    order: 6,
  },
  "Subsidiary Organs (Sanctions Committee)": {
    label: "Subsidiary Organs (Sanctions Committee)",
    order: 7,
  },
  "Subsidiary Organs (Standing committees and ad hoc bodies)": {
    label: "Subsidiary Organs (Standing committees and ad hoc bodies)",
    order: 8,
  },
  "Regional Commissions": {
    label: "Regional Commissions",
    order: 9,
  },
  "Other Bodies": {
    label: "Other Bodies",
    order: 10,
  },
  "Intergovernmental and Expert Bodies": {
    label: "Intergovernmental and Expert Bodies",
    order: 11,
  },
  "Funds and Programmes": {
    label: "Funds and Programmes",
    order: 12,
  },
  "Research and Training": {
    label: "Research and Training",
    order: 13,
  },
  "Other Entities": {
    label: "Other Entities",
    order: 14,
  },
  "International Court of Justice": {
    label: "International Court of Justice",
    order: 15,
  },
  "Specialized Agencies": {
    label: "Specialized Agencies",
    order: 16,
  },
  "Related Organizations": {
    label: "Related Organizations",
    order: 17,
  },
};

/**
 * Get all categories sorted by their order
 */
export function getSortedCategories(categories: string[]): string[] {
  return categories.sort((a, b) => {
    const orderA = categoryConfigs[a]?.order ?? 999;
    const orderB = categoryConfigs[b]?.order ?? 999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Fallback to alphabetical if same order or not configured
    return a.localeCompare(b);
  });
}

/**
 * Get label for a category
 */
export function getCategoryLabel(category: string): string {
  return categoryConfigs[category]?.label || category;
}
