export interface Entity {
  entity: string;
  entity_long: string;
  entity_combined: string;
  entity_description: string | null;
  entity_link: string;
  entity_link_is_un_org: number;
  system_grouping: string;
  category: string;
  un_principal_organ: string | null;
  un_pillar: string | null;
  is_ceb_member: boolean | null;
  head_of_entity_level: string;
  head_of_entity_title_specific: string | null;
  head_of_entity_title_general: string;
  head_of_entity_name: string;
  head_of_entity_bio_link: string | null;
  head_of_entity_headshot_link: string | null;
  global_leadership_team_url: string | null;
  on_display: string | null;
  foundational_mandate: string | null;
  entity_logo_url: string | null;
  entity_logo_available: boolean | null;
  organizational_chart_link: string | null;
  budget_financial_reporting_link: string;
  results_framework_link: string;
  strategic_plan_link: string;
  annual_reports_link: string;
  transparency_portal_link: string;
  socials_linkedin: string | null;
  socials_twitter: string | null;
  socials_instagram: string | null;
  entity_news_page: string | null;
  entity_branding_page: string | null;
  entity_data_page: string | null;
  entity_logo_page: string | null;
  entity_careers_page: string | null;
  entity_wikipedia_page: string | null;
  entity_footnotes: string | null;
  is_primary_entity: boolean | null;
  entity_aliases: string | null;
  entity_mandate_registry: string | null;
  entity_custom_mandate_registry: string | null;
  record_id: string;
  review_needed: boolean | null;
}

export interface EntityFilters {
  system_grouping?: string;
  // TODO: what about others?
}
