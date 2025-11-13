// UN Principal Organs configuration

export interface PrincipalOrganConfig {
  label: string;
  order: number;
}

export const principalOrganConfigs: Record<string, PrincipalOrganConfig> = {
  "General Assembly (GA)": {
    label: "General Assembly (GA)",
    order: 1,
  },
  "Security Council (SC)": {
    label: "Security Council (SC)",
    order: 2,
  },
  "Economic and Social Council (ECOSOC)": {
    label: "Economic and Social Council (ECOSOC)",
    order: 3,
  },
  Secretariat: {
    label: "Secretariat",
    order: 5,
  },
  "International Court of Justice (ICJ)": {
    label: "International Court of Justice (ICJ)",
    order: 6,
  },
  "Trusteeship Council": {
    label: "Trusteeship Council",
    order: 7,
  },
  Other: {
    label: "Other / Not Affiliated",
    order: 999,
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
