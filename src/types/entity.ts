export interface Entity {
    entity: string;
    entity_long: string;
    entity_link: string;
    system_grouping: string;
    un_pillar: string | null;
    on_display: string; // "TRUE" or "FALSE" as string
    budget_financial_reporting_link: string; // Can be "No link found"
    strategic_plan_link: string; // Can be "No link found"
    results_framework_link: string; // Can be "No link found"
    un_principal_organ: string;
    category: string;
    "ceb_member?": string; // "Yes" or "No"
    head_of_entity_level: string; // Can be "Not applicable"
    head_of_entity_title: string; // Can be "Not applicable"
    head_of_entity_name: string; // Can be "Not applicable"
    entity_description: string | null;
    organizational_chart_link: string | null;
    foundational_mandate: string | null;
    transparency_portal_link: string; // Can be "Not found"
    annual_reports_link: string; // Can be URL or "Not found"
    comment: string | null;
    branding_link: string | null;
    "entity_link_is_un.org": number; // 1 or 0
}

export interface EntityFilters {
    system_grouping?: string;
    // un_pillar?: string;
    // un_principal_organ?: string;
    // category?: string;
}
