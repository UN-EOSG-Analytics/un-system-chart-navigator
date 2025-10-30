export interface Entity {
    entity: string;
    entity_long: string;
    entity_combined: string;
    entity_description: string | null;
    entity_link: string;
    entity_link_is_un_org: number; // 1 or 0
    system_grouping: string;
    category: string;
    un_principal_organ: string[] | string | null;
    un_pillar: string | null;
    is_ceb_member: boolean | null;
    head_of_entity_level: string; // Can be "Not applicable"
    head_of_entity_title_specific: string | null; // Can be "Not applicable" or null
    head_of_entity_title_general: string; // Can be "Not applicable"
    head_of_entity_name: string; // Can be "Not applicable"
    head_of_entity_bio: string | null;
    head_of_entity_headshot: string | null; // New field
    global_leadership_team_url: string | null; // New field
    on_display: string; // "TRUE" or "FALSE" as string
    foundational_mandate: string | null;
    organizational_chart_link: string | null;
    budget_financial_reporting_link: string; // Can be "No link found"
    results_framework_link: string; // Can be "No link found"
    strategic_plan_link: string; // Can be "No link found"
    annual_reports_link: string; // Can be URL or "Not found"
    transparency_portal_link: string; // Can be "Not found"
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
    entity_mandate_registry_custom: string | null;
    is_primary_entity: boolean | null;
    entity_aliases: string | null; // String format like "['RCS','UNDCO']"
}

export interface EntityFilters {
    system_grouping?: string;
    // un_principal_organ?: string; # TODO
}
