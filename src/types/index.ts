export interface Entity {
    entity: string;
    entity_long: string;
    entity_combined: string;
    entity_description: string | null;
    entity_link: string;
    entity_link_is_un_org: number;
    system_grouping: string;
    category: string;
    un_principal_organ: string;
    un_pillar: string | null;
    is_ceb_member: boolean;
    head_of_entity_level: string;
    head_of_entity_title_specific: string | null;
    head_of_entity_title_general: string;
    head_of_entity_name: string;
    head_of_entity_bio: string | null;
    head_of_entity_headshot: string | null;
    global_leadership_team_url: string | null;
    on_display: string;
    foundational_mandate: string | null;
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
    entity_wikipedia_page: string | null;
}

export interface EntityFilters {
    system_grouping?: string;
}

export interface MemberState {
    name: string;
    status: 'member' | 'observer' | 'nonmember';
    contributions: Record<string, Record<string, number>>;
}

export interface Organ {
    short_name: string;
    long_name: string;
    type: string;
    parent_body: string[];
    defunct: boolean;
    url?: string;
}

export interface Impact {
    id: number;
    entity: string;
    highlight: string;
    impact: string;
}
