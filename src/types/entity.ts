export interface Entity {
    entity: string;
    entity_long: string;
    entity_link: string;
    system_grouping: string;
    un_pillar: string | null;
    on_display: string | boolean;
    budget_financial_reporting_link: string | null;
    strategic_plan_link: string | null;
    results_framework_link: string | null;
    un_principal_organ: string;
    category: string;
    "ceb_member?": string;
    head_of_entity_level: string;
    head_of_entity_title: string;
    head_of_entity_name: string;
    entity_description: string | null;
    organizational_chart_link: string | null;
    foundational_mandate: string | null;
    transparency_portal_link: string | null;
    annual_reports_link: string | null;
    comment: string | null;
    branding_link: string | null;
    "entity_link_is_un.org": number;
}
