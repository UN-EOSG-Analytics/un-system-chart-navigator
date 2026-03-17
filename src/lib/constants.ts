/**
 * Centralized configuration for the UN System Chart Navigator.
 *
 * This file serves as the single source of truth for all application settings,
 * including:
 * - Entity display behavior (long names, external links, tooltips)
 * - Entity relationships (affiliated entities, dual-organ handling)
 * - Sorting and ordering rules
 * - Principal organ configurations (colors, labels, links)
 * - Category and subcategory settings
 * - Footnotes and special notations
 *
 * When adding new configuration:
 * 1. Add to the appropriate section with clear JSDoc documentation
 * 2. Use TypeScript types for type safety
 * 3. Include examples in comments
 * 4. Keep related settings grouped together
 *
 * @module constants
 */

// Centralized constants for UN System Chart Navigator ------------------------------
// This file contains all configuration for principal organs and categories

/**
 * Minimal shape for display-only placeholder entities.
 * Only the fields needed for card rendering and placement are required.
 * Cast to `Entity` when merging into the entity list (see `entities.ts`).
 */
export interface PlaceholderEntity {
  entity: string;
  entity_link: string;
  un_principal_organ: string[];
  category: string;
  subcategory: string | null;
}

/**
 * Application feature flags.
 *
 * Keep staged or optional UI behind explicit flags here so components can
 * consistently reference a single source of truth.
 */
export const featureFlags = {
  contribute: false,
} as const;

/**
 * Display-only placeholder entities that are NOT real UN entities and should
 * never appear in the dataset (Airtable, PostgreSQL, CSV exports).
 *
 * These represent groups of sub-bodies shown on the chart as link cards
 * pointing to an external index page.
 *
 * Merged into the full entity list at runtime in `entities.ts`.
 */
export const placeholderEntities: PlaceholderEntity[] = [
  // General Assembly — Intergovernmental and Expert Bodies
  {
    entity: "Working Groups",
    entity_link: "https://www.un.org/en/ga/about/subsidiary/other.shtml",
    un_principal_organ: ["General Assembly"],
    category: "Intergovernmental and Expert Bodies",
    subcategory: "Standing Committees and other bodies",
  },
  {
    entity: "Other Committees",
    entity_link: "https://www.un.org/en/ga/about/subsidiary/committees.shtml",
    un_principal_organ: ["General Assembly"],
    category: "Intergovernmental and Expert Bodies",
    subcategory: "Standing Committees and other bodies",
  },
  {
    entity: "Boards",
    entity_link: "https://www.un.org/en/ga/about/subsidiary/boards.shtml",
    un_principal_organ: ["General Assembly"],
    category: "Intergovernmental and Expert Bodies",
    subcategory: "Standing Committees and other bodies",
  },
  // Security Council — Standing committees and ad hoc bodies
  {
    entity: "Standing Committees",
    entity_link:
      "https://main.un.org/securitycouncil/en/content/repertoire/standing-and-ad-hoc-committees#main1",
    un_principal_organ: ["Security Council"],
    category: "Standing committees and ad hoc bodies",
    subcategory: null,
  },
  {
    entity: "Ad Hoc Bodies",
    entity_link:
      "https://main.un.org/securitycouncil/en/content/repertoire/standing-and-ad-hoc-committees#main2",
    un_principal_organ: ["Security Council"],
    category: "Standing committees and ad hoc bodies",
    subcategory: null,
  },
];

/**
 * Entities that should display their long name on the card instead of the short name.
 * Use for entities where the acronym is not well-known.
 */
export const useLongNameOnCard = new Set(["UNDC", "UNPC"]);

/**
 * Entities that should open an external link instead of the modal.
 * Maps entity short name to the external URL.
 *
 * - Placeholder entities (Working Groups, Boards, etc.): link is derived
 *   from `placeholderEntities[].entity_link` — keep in sync.
 * - Main Committees (First–Sixth): real Airtable entities whose cards should
 *   open the corresponding GA page directly.
 */
export const externalLinkEntities: Record<string, string> = Object.fromEntries([
  // Derived from placeholderEntities — link cards for groups of sub-bodies
  ...placeholderEntities
    .filter((e) => e.entity_link)
    .map((e) => [e.entity, e.entity_link!]),
  // Main Committees (real Airtable entities, external-link behaviour only)
  ["First Committee", "https://www.un.org/en/ga/first/index.shtml"],
  ["Second Committee", "https://www.un.org/en/ga/second/index.shtml"],
  ["Third Committee", "https://www.un.org/en/ga/third/index.shtml"],
  ["Fourth Committee", "https://www.un.org/en/ga/fourth/index.shtml"],
  ["Fifth Committee", "https://www.un.org/en/ga/fifth/index.shtml"],
  ["Sixth Committee", "https://www.un.org/en/ga/sixth/index.shtml"],
]);

/**
 * Entities that should always be sorted last within their subcategory.
 */
export const sortLastEntities = new Set(["Other Committees"]);

/**
 * Entities for which tooltips should not be shown.
 * Automatically includes all placeholder entities (they have no meaningful tooltip data).
 */
export const hideTooltipEntities = new Set(
  placeholderEntities.map((e) => e.entity),
);

/**
 * Entities that are affiliated with a parent entity and should:
 * 1. Be sorted immediately after the parent entity (breaking alpha order)
 * 2. Display a subtitle on the card (e.g., "UNDP-affiliated")
 *
 * The affiliated entities are sorted alphabetically among themselves,
 * but always appear after the parent entity.
 */
export const affiliatedEntities: Record<
  string,
  { parent: string; subtitle: string }
> = {
  UNCDF: { parent: "UNDP", subtitle: "UNDP-affiliated" },
  UNV: { parent: "UNDP", subtitle: "UNDP-affiliated" },
  UNOSSC: { parent: "UNDP", subtitle: "UNDP-affiliated" },
};

/**
 * Entities that should display an empty category section gap above them.
 * This creates visual spacing with a blank category header.
 * Only use this for entities that explicitly need to be visually separated.
 */
export const showEmptyCategoryGap = new Set<string>(["HLPF", "UNPC"]);

/**
 * Dual-organ entities where category/subcategory should be hidden for specific organs.
 * Key format: "entity|principalOrgan"
 * When a dual-organ entity appears in the specified organ's section, it will be
 * rendered without category/subcategory grouping (appears at the root level).
 *
 * Use case: UNPC reports to both GA and SC, but should only show its category
 * ("Intergovernmental and Expert Bodies" / "Commissions") when displayed under GA.
 */
export const hideCategoryForOrgan: Set<string> = new Set([
  "UNPC|Security Council",
]);

/**
 * Custom sort order for specific entities within their category.
 * Higher values appear later. Entities not listed use default alphabetical sorting.
 */
export const entitySortOrder: Record<string, number> = {
  // Secretariat - EOSG first
  EOSG: -1,
  // Security Council - Standing committees and ad hoc bodies
  "Standing Committees": 1,
  "Ad Hoc Bodies": 2,
};

/**
 * Subcategories with custom sort order within their category.
 * Higher values appear later. Subcategories not listed use order 0 (alphabetical first).
 */
export const subcategorySortOrder: Record<string, number> = {
  // General Assembly - Main Committees
  "Main Committees": 998, // Second to last
  Committees: 999, // Last
  // Security Council - Peacekeeping operations and special political missions
  "Peacekeeping Operations": 1,
  "Special Political Missions (SPMs)": 2,
  Other: 999, // Last
};

export interface PrincipalOrganConfig {
  label: string;
  order: number;
  bgColor: string;
  textColor: string;
  sectionHeading?: string; // Optional higher-level heading for the organ
  labelLink?: string; //
  sectionHeadingLink?: string; // Optional link for the section heading
  borderColor?: string; // Optional border color override
  skipCategoryLayer?: boolean; // If true, render entities directly without category grouping
  smallCategoryHeaders?: boolean; // If true, use smaller category header styling
}

// NOTE: keys here need to match entity.un_principal_organ
export const principalOrganConfigs: Record<string, PrincipalOrganConfig> = {
  "General Assembly": {
    label: "General Assembly",
    labelLink: "https://www.un.org/ga/",
    sectionHeading: "SUBSIDIARY ORGANS",
    sectionHeadingLink: "https://www.un.org/en/ga/about/subsidiary/index.shtml",
    order: 1,
    bgColor: "bg-un-system-green",
    textColor: "text-black",
  },
  "Security Council": {
    label: "Security Council",
    labelLink: "https://main.un.org/securitycouncil/",
    sectionHeading: "SUBSIDIARY ORGANS",
    sectionHeadingLink:
      "https://main.un.org/securitycouncil/content/repertoire/subsidiary-organs-overview",
    order: 2,
    bgColor: "bg-un-system-red",
    textColor: "text-black",
    smallCategoryHeaders: true,
  },
  "Economic and Social Council": {
    label: "Economic and Social Council",
    labelLink: "https://ecosoc.un.org/",
    sectionHeading: "COMMISSIONS AND OTHER SUBSIDIARY ORGANS",
    sectionHeadingLink:
      "https://ecosoc.un.org/about-us/ecosoc-subsidiary-bodies",
    order: 3,
    bgColor: "bg-un-system-blue",
    textColor: "text-black",
  },
  Secretariat: {
    label: "Secretariat",
    labelLink: "https://www.un.org/about-us/secretariat",
    sectionHeading: "DEPARTMENTS AND OFFICES",
    sectionHeadingLink: "https://www.un.org/about-us/secretariat",
    order: 4,
    bgColor: "bg-un-system-yellow",
    textColor: "text-black",
    // skipCategoryLayer: true,
  },

  "International Court of Justice": {
    label: "International Court of Justice",
    labelLink: "https://www.icj-cij.org/home",
    sectionHeading: "",
    order: 5,
    bgColor: "bg-un-system-purple",
    textColor: "text-black",
    skipCategoryLayer: true,
  },
  "Trusteeship Council": {
    label: "Trusteeship Council",
    labelLink: "https://www.un.org/about-us/trusteeship-council",
    sectionHeading: "",
    order: 6,
    bgColor: "bg-un-system-brown",
    textColor: "text-black",
    skipCategoryLayer: true,
  },

  "Related Organizations": {
    label: "Related Organizations",
    sectionHeading: "",
    skipCategoryLayer: true,
    order: 7,
    bgColor: "bg-gray-300",
    borderColor: "un-system-gray-dark",
    textColor: "text-black",
  },

  "Specialized Agencies": {
    label: "Specialized Agencies",
    labelLink: "https://www.un.org/about-us/specialized-agencies",
    sectionHeading: "",
    skipCategoryLayer: true,
    order: 8,
    // bgColor: "bg-un-system-gray",
    bgColor: "bg-gray-300",
    borderColor: "un-system-gray-dark",
    textColor: "text-black",
  },

  //   Other: {
  //     label: "Other",
  //     order: 998,
  //     bgColor: "bg-gray-300",
  //     textColor: "text-black",
  //   },
  //   "N/A": {
  //     label: "N/A [WIP]",
  //     order: 999,
  //     bgColor: "bg-gray-300",
  //     textColor: "text-gray-600",
  //   },
};

/**
 * URL-friendly slugs for principal organs
 * Used to create shorter, cleaner URLs
 */
export const principalOrganSlugs: Record<string, string> = {
  "General Assembly": "ga",
  "Security Council": "sc",
  "Economic and Social Council": "ecosoc",
  Secretariat: "secretariat",
  "Specialized Agencies": "agencies",
  "International Court of Justice": "icj",
  "Trusteeship Council": "trusteeship",
  "Related Organizations": "related",
  Other: "other",
};

/**
 * Reverse mapping: slug -> principal organ key
 */
export const slugToPrincipalOrgan: Record<string, string> = Object.fromEntries(
  Object.entries(principalOrganSlugs).map(([organ, slug]) => [slug, organ]),
);

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
  "Specialized Agencies": [1, 3],
  "Related Organizations": [3],
  "General Assembly|Funds and Programmes": [1],
  "Economic and Social Council|Regional Commissions": [6],
  "Economic and Social Council|Specialized Agencies": [1, 3],
  "Economic and Social Council|Other Bodies": [8],
  "Secretariat|Departments and Offices": [7],
  "Other|Related Organizations": [3],
};

/**
 * Entity-specific footnotes - maps entity short names to footnote numbers
 */
// FIXME: maybe keep in a variable on dataset?
export const entityFootnotes: Record<string, number[]> = {
  HLPF: [9],
  UNCTAD: [1, 6],
  "UN-Habitat": [6],
  UNEP: [6],
  UNHCR: [1],
  UNOPS: [1],
  UNRWA: [1],
  "UN-Women": [1],
  IAEA: [1],
  IOM: [1],
  WTO: [1],
  UNOP: [2],
  UNODC: [1],
  //   "WORLD BANK GROUP": [5],
};

/**
 * Hierarchical category ordering by principal organ
 * Each principal organ has its own category order
 *
 * Convention:
 * - " " (space) = Fallback for entities without category (shows section with blank header)
 * - To skip category layer entirely for an organ, use `skipCategoryLayer: true` in principalOrganConfigs
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
    "Other Mechanisms": 5,
    " ": 999, // Fallback for entities without category (shows section, blank header)
  },
  "Security Council": {
    "Counter-Terrorism Committee": 1,
    "International Residual Mechanism for Criminal Tribunals": 2,
    "Military Staff Committee": 3,
    "Peacekeeping operations and special political missions": 4,
    "Standing committees and ad hoc bodies": 5,
    "Sanctions Committees": 6,
    " ": 999, // Fallback for entities without category
  },
  "Economic and Social Council": {
    "Functional Commissions": 1,
    "Regional Commissions": 2,
    "Other Bodies": 3,
    "Research and Training": 4,
    "Specialized Agencies": 5,
    " ": 999, // Fallback for entities without category
  },
  Secretariat: {
    "": 999, // Fallback for entities without category
  },
  // ICJ and Trusteeship Council use skipCategoryLayer in principalOrganConfigs
  "Related Organizations": {
    " ": 999, // Fallback for entities without category
  },
  //   Other: {
  //     "Related Organizations": 1,
  //     " ": 999, // Fallback for entities without category
  //   },
  //   "N/A": {
  //     "Related Organizations": 1,
  //     " ": 999, // Fallback for entities without category
  //   },
};
