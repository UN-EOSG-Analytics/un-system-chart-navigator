import { Entity } from "@/types/entity";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a URL-safe slug from an entity name for use in routing and identification.
 * Normalizes special characters, spaces, and punctuation to create consistent slugs.
 *
 * @param entityName - The entity name to convert (e.g., "UN-Women", "UNICEF")
 * @returns A lowercase, hyphen-separated slug (e.g., "un-women", "unicef")
 *
 * @example
 * createEntitySlug("UN-Women") // Returns: "un-women"
 * createEntitySlug("UNHCR") // Returns: "unhcr"
 * createEntitySlug("World Bank Group") // Returns: "world-bank-group"
 */
export function createEntitySlug(entityName: string): string {
  return (
    entityName
      .toLowerCase()
      // Replace special characters and symbols (including underscores) with hyphens
      .replace(/[^a-z0-9\s-]/g, "-")
      // Replace multiple spaces or hyphens with single hyphen
      .replace(/[\s-]+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * Parses entity aliases from Airtable string format to an array.
 * Handles JSON-like string representations with single quotes.
 *
 * @param aliasString - String representation of aliases (e.g., "['RCS','UNDCO']")
 * @returns Array of alias strings, or empty array if parsing fails
 *
 * @example
 * parseEntityAliases("['RCS','UNDCO']") // Returns: ['RCS', 'UNDCO']
 * parseEntityAliases(null) // Returns: []
 * parseEntityAliases("invalid") // Returns: []
 */
export function parseEntityAliases(
  aliasString: string | null | undefined,
): string[] {
  if (!aliasString || typeof aliasString !== "string") return [];

  try {
    const parsed = JSON.parse(aliasString.replace(/'/g, '"'));
    if (Array.isArray(parsed)) {
      return parsed.filter((alias) => typeof alias === "string");
    }
  } catch {
    // Silently skip invalid formats
  }

  return [];
}

/**
 * Converts a Tailwind CSS color class to a CSS custom property variable.
 * Used for accessing theme colors in inline styles and gradients.
 *
 * @param bgColorClass - Tailwind background color class (e.g., "bg-blue-500")
 * @returns CSS custom property string (e.g., "var(--color-blue-500)")
 *
 * @example
 * getCssColorVar("bg-blue-500") // Returns: "var(--color-blue-500)"
 * getCssColorVar("bg-gray-100") // Returns: "var(--color-gray-100)"
 */
export function getCssColorVar(bgColorClass: string): string {
  const colorName = bgColorClass.replace("bg-", "");
  return `var(--color-${colorName})`;
}

/**
 * Converts a Tailwind CSS color class to its dark mode CSS custom property.
 * Enables dark mode color theming in inline styles.
 *
 * @param bgColorClass - Tailwind background color class (e.g., "bg-blue-500")
 * @returns CSS custom property string for dark variant (e.g., "var(--color-blue-500-dark)")
 *
 * @example
 * getCssColorVarDark("bg-blue-500") // Returns: "var(--color-blue-500-dark)"
 */
export function getCssColorVarDark(bgColorClass: string): string {
  const colorName = bgColorClass.replace("bg-", "");
  return `var(--color-${colorName}-dark)`;
}

/**
 * Compares strings naturally by ignoring special characters for sorting.
 * Ensures logical alphabetical order for entity names with punctuation.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns Negative if a < b, positive if a > b, 0 if equal
 *
 * @example
 * naturalCompare("UN-Women", "UNWRA") // Treats as "UNWomen" vs "UNWRA"
 * ['UN-Women', 'UNWRA', 'UNICEF'].sort(naturalCompare)
 * // Returns: ['UNICEF', 'UNWRA', 'UN-Women']
 */
export function naturalCompare(a: string, b: string): number {
  // Remove special characters (hyphens, underscores, etc.) for comparison
  const cleanA = a.replace(/[-_\s]/g, "").toLowerCase();
  const cleanB = b.replace(/[-_\s]/g, "").toLowerCase();
  return cleanA.localeCompare(cleanB);
}

/**
 * Compares entity names using natural string comparison.
 * Semantic alias for naturalCompare to improve code readability.
 *
 * @param a - First entity name
 * @param b - Second entity name
 * @returns Negative if a < b, positive if a > b, 0 if equal
 *
 * @see naturalCompare
 */
export function naturalCompareEntities(a: string, b: string): number {
  return naturalCompare(a, b);
}

/**
 * Ordinal word to number mapping for sorting (First, Second, etc.)
 */
const ordinalOrder: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
};

/**
 * Extracts numeric order from ordinal text for sorting committees.
 * Used to sort "First Committee", "Second Committee", etc. numerically.
 *
 * @param str - String potentially containing an ordinal word
 * @returns Numeric position (1-10), or Infinity if no ordinal found
 *
 * @example
 * getOrdinalOrder("First Committee") // Returns: 1
 * getOrdinalOrder("Third Committee") // Returns: 3
 * getOrdinalOrder("Other Committees") // Returns: Infinity (sorts last)
 */
export function getOrdinalOrder(str: string): number {
  const firstWord = str.toLowerCase().split(/\s+/)[0];
  return ordinalOrder[firstWord] ?? Infinity;
}

/**
 * Generates a URL for the contribution form with entity data prefilled.
 * Used to allow users to suggest updates to entity information.
 *
 * @param entity - Optional entity to prefill form with
 * @returns URL string with query parameters for prefilled form fields
 *
 * @example
 * generateContributeUrl() // Returns: "/contribute"
 * generateContributeUrl(unicefEntity) // Returns: "/contribute?prefill_entity=UNICEF&..."
 */
export function generateContributeUrl(entity?: Entity): string {
  const baseUrl = "/contribute";

  if (!entity) {
    return baseUrl;
  }

  const params = new URLSearchParams();

  // Helper function to add parameter if value is not null/empty
  const addParam = (
    key: string,
    value: string | number | boolean | string[] | null | undefined,
  ) => {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      value !== "Not applicable" &&
      value !== "Not found" &&
      value !== "No link found"
    ) {
      // Handle arrays by joining them
      if (Array.isArray(value)) {
        params.set(`prefill_${key}`, value.join(", "));
      } else {
        params.set(`prefill_${key}`, String(value));
      }
    }
  };

  // Always set form contribution type
  params.set("prefill_form_contribution", "Edit existing Entity Data");

  // Add all entity fields
  addParam("edited_entity", entity.record_id);
  addParam("entity", entity.entity);
  addParam("entity_long", entity.entity_long);
  addParam("entity_combined", entity.entity_combined);
  addParam("entity_description", entity.entity_description);
  addParam("entity_link", entity.entity_link);
  addParam("category", entity.category);
  addParam("un_principal_organ", entity.un_principal_organ);
  addParam("is_ceb_member", entity.is_ceb_member);
  addParam("head_of_entity_level", entity.head_of_entity_level);
  addParam(
    "head_of_entity_title_specific",
    entity.head_of_entity_title_specific,
  );
  addParam("head_of_entity_title_general", entity.head_of_entity_title_general);
  addParam("head_of_entity_name", entity.head_of_entity_name);
  addParam("head_of_entity_bio_link", entity.head_of_entity_bio_link);
  addParam("head_of_entity_headshot_link", entity.head_of_entity_headshot_link);
  addParam("global_leadership_team_url", entity.global_leadership_team_url);
  addParam("foundational_mandate", entity.foundational_mandate);
  addParam("entity_logo_url", entity.entity_logo_url);
  addParam("entity_logo_available", entity.entity_logo_available);
  addParam("organizational_chart_link", entity.organizational_chart_link);
  addParam(
    "budget_financial_reporting_link",
    entity.budget_financial_reporting_link,
  );
  addParam("results_framework_link", entity.results_framework_link);
  addParam("strategic_plan_link", entity.strategic_plan_link);
  addParam("annual_reports_link", entity.annual_reports_link);
  addParam("transparency_portal_link", entity.transparency_portal_link);
  addParam("socials_linkedin", entity.socials_linkedin);
  addParam("socials_twitter", entity.socials_twitter);
  addParam("socials_instagram", entity.socials_instagram);
  addParam("entity_news_page", entity.entity_news_page);
  addParam("entity_branding_page", entity.entity_branding_page);
  addParam("entity_data_page", entity.entity_data_page);
  addParam("entity_logo_page", entity.entity_logo_page);
  addParam("entity_careers_page", entity.entity_careers_page);
  addParam("entity_wikipedia_page", entity.entity_wikipedia_page);
  addParam("entity_footnotes", entity.entity_footnotes);
  addParam("entity_aliases", entity.entity_aliases);
  addParam("entity_mandate_registry", entity.entity_mandate_registry);
  addParam(
    "entity_custom_mandate_registry",
    entity.entity_custom_mandate_registry,
  );
  addParam("review_needed", entity.review_needed);

  return `${baseUrl}?${params.toString()}`;
}
