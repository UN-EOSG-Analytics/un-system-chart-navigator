export interface Entity {
  entity_long: string;
  entity: string;
  combined: string;
  show: "Yes" | "No";
  budget: string | null;
  results_framework: string | null;
  strategic_plan: string | null;
  outcomes_processed: boolean | null;
  group: string;
  sub_group: string | null;
  un_principal_organ: string;
  category: string;
  "ceb_member?": "Yes" | "No";
  head_of_entity_level: string;
  head_of_entity_title: string;
  head_of_entity_name: string;
  entity_url: string | null;
  comment: string | null;
  description: string | null;
  annual_report_link: string | null;
  transparency_portal_link: string | null;
  organizational_chart: string | null;
}
