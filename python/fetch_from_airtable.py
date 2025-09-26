# https://airtable.com/create/tokens

import os
from pathlib import Path

import pandas as pd
from pyairtable import Api

api = Api(os.environ["AIRTABLE_API_KEY"])

BASE_ID = os.environ["AIRTABLE_BASE_ID"]
TABLE_ID = os.environ["AIRTABLE_TABLE_ID"]

table = api.table(BASE_ID, TABLE_ID)
records = table.all(view="API ALL")

if records:
    data = [record["fields"] for record in records]
    df = pd.DataFrame(data)

# df.shape[1]
# df.shape[0]
# df.columns


df = df[
    [
        "entity",
        "entity_long",
        "entity_combined",
        "entity_description",
        "entity_link",
        "entity_link_is_un_org",
        "entity_main_data_portal",
        "system_grouping",
        "category",
        "un_principal_organ",
        "un_pillar",
        "is_ceb_member",
        "head_of_entity_title",
        "head_of_entity_name",
        "head_of_entity_level",
        "head_of_entity_bio",
        "on_display",
        "foundational_mandate",
        "organizational_chart_link",
        "branding_link",
        "budget_financial_reporting_link",
        "results_framework_link",
        "strategic_plan_link",
        "annual_reports_link",
        "transparency_portal_link",
        "socials_linkedin",
        "socials_twitter",
        "socials_instagram",
    ]
]

data_folder = Path("data")

output_path = data_folder / "input" / "input_entities.csv"
df.to_csv(output_path, index=False)
