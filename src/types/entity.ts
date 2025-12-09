/**
 * Represents a UN System entity with all associated metadata.
 * Data is sourced from Airtable and processed into JSON format.
 */
export interface Entity {
  /** Short name/acronym (e.g., \"UNICEF\", \"WHO\") */
  entity: string;
  /** Full official name of the entity */
  entity_long: string | null;
  /** Combined display name (typically same as entity_long) */
  entity_combined: string;
  /** Brief description of the entity's purpose and work */
  entity_description: string | null;
  /** Official website URL */
  entity_link: string | null;
  /** Organizational category (e.g., \"Specialized Agencies\") */
  category: string | null;
  /** Sub-classification within category */
  subcategory: string | null;
  /** Array of principal organs this entity reports to */
  un_principal_organ: string[] | null;
  /** Whether entity is a CEB (Chief Executives Board) member */
  is_ceb_member: boolean | null;
  /** Leadership level (e.g., \"SG\", \"USG\", \"ASG\") */
  head_of_entity_level: string;
  /** Specific title of the current leader */
  head_of_entity_title_specific: string | null;
  /** Generic leadership title (e.g., \"Executive Director\") */
  head_of_entity_title_general: string | null;
  /** Current leader's full name */
  head_of_entity_name: string | null;
  /** URL to leader's biography page */
  head_of_entity_bio_link: string | null;
  /** URL or path to leader's headshot image */
  head_of_entity_headshot_link: string | null;
  /** URL to global leadership team page */
  global_leadership_team_url: string | null;
  /** Foundational mandate or legal basis for the entity */
  foundational_mandate: string | null;
  /** URL to entity's logo image */
  entity_logo_url: string | null;
  /** Whether a logo is available for this entity */
  entity_logo_available: boolean | null;
  /** URL to organizational chart */
  organizational_chart_link: string | null;
  /** URL to budget and financial reporting */
  budget_financial_reporting_link: string;
  /** URL to results framework documentation */
  results_framework_link: string | null;
  /** URL to strategic plan */
  strategic_plan_link: string | null;
  /** URL to annual reports */
  annual_reports_link: string | null;
  /** URL to transparency portal */
  transparency_portal_link: string;
  /** LinkedIn profile URL */
  socials_linkedin: string | null;
  /** Twitter/X profile URL */
  socials_twitter: string | null;
  /** Instagram profile URL */
  socials_instagram: string | null;
  /** URL to entity's news page */
  entity_news_page: string | null;
  /** URL to branding guidelines */
  entity_branding_page: string | null;
  /** URL to data/statistics page */
  entity_data_page: string | null;
  /** URL to page with downloadable logos */
  entity_logo_page: string | null;
  /** URL to careers/jobs page */
  entity_careers_page: string | null;
  /** Wikipedia article URL */
  entity_wikipedia_page: string | null;
  /** Special notes or footnotes about this entity */
  entity_footnotes: string | null;
  /** Alternative names or acronyms (JSON string format) */
  entity_aliases: string | null;
  /** Link to UN mandate registry */
  entity_mandate_registry: string | null;
  /** Custom mandate registry link (if different from standard) */
  entity_custom_mandate_registry: string | null;
  /** Headquarters location */
  entity_headquarters: string | null;
  /** Airtable record ID for reference */
  record_id: string;
  /** Flag indicating if entity data needs review/verification */
  review_needed: boolean | null;
}

/**
 * Filter criteria for querying entities.
 * Currently a placeholder for future filter functionality.
 */
export interface EntityFilters {
  // Future filters can be added here as needed
}
