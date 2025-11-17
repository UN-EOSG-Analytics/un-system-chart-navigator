import { Entity } from "@/types/entity";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Create a safe, consistent slug from entity names
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
 * Parse entity aliases from string format like "['RCS','UNDCO']" to array
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
 * Generate Airtable contribution form URL with prefilled entity data
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
    value: string | number | boolean | null | undefined,
  ) => {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      value !== "Not applicable" &&
      value !== "Not found" &&
      value !== "No link found"
    ) {
      params.set(`prefill_${key}`, String(value));
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
  addParam("entity_link_is_un_org", entity.entity_link_is_un_org);
  addParam("system_grouping", entity.system_grouping);
  addParam("category", entity.category);
  addParam("un_principal_organ", entity.un_principal_organ);
  addParam("un_pillar", entity.un_pillar);
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
  addParam("entity_footnotes", entity.entity_footnotes);
  addParam("is_primary_entity", entity.is_primary_entity);
  addParam("entity_aliases", entity.entity_aliases);
  addParam("entity_mandate_registry", entity.entity_mandate_registry);
  addParam(
    "entity_custom_mandate_registry",
    entity.entity_custom_mandate_registry,
  );

  return `${baseUrl}?${params.toString()}`;
}
