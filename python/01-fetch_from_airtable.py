# https://airtable.com/create/tokens

import os
import re
from pathlib import Path
from urllib.parse import quote

import pandas as pd
from dotenv import load_dotenv
from pyairtable import Api

# Load environment variables from .env file
load_dotenv()

api = Api(os.environ["AIRTABLE_API_KEY"])

BASE_ID = os.environ["AIRTABLE_BASE_ID"]
TABLE_ID = os.environ["AIRTABLE_TABLE_ID"]

table = api.table(BASE_ID, TABLE_ID)
records = table.all(view="API ALL")

if records:
    data = [record["fields"] for record in records]
    df = pd.DataFrame(data)


# Filter out rows where 'added_via_form' is True
if "added_via_form" in df.columns:
    df = df[df["added_via_form"] != "TRUE"]

# Check for duplicate entities
duplicates = df[df["entity"].duplicated(keep=False)]["entity"]
if not duplicates.empty:
    raise ValueError(
        f"Duplicate entities found in the input data: {duplicates.to_list()}"
    )
else:
    print("All entities are unique.")


# Filter out rows where the on_display column is False
df = df[df["on_display"] != "FALSE"]

print(f"Number of entities: {df.shape[0]}")

# Check if all entity values are URL safe
unsafe_entities = []
for entity in df["entity"]:
    if quote(entity, safe="") != entity:
        unsafe_entities.append(entity)

if unsafe_entities:
    print(f"Warning: Entities not URL safe: {unsafe_entities}")
else:
    print("All entities are URL safe.")

# df.shape[1]
# df.shape[0]
# df.columns
# List of selected columns
selected_columns = [
    "entity",
    "entity_long",
    "entity_combined",
    "entity_description",
    "entity_link",
    "entity_link_is_un_org",
    "system_grouping",
    "category",
    "un_principal_organ",
    "un_pillar",
    "is_ceb_member",
    "head_of_entity_title_general",
    "head_of_entity_title_specific",
    "head_of_entity_name",
    "head_of_entity_level",
    "head_of_entity_bio_link",
    "head_of_entity_headshot_link",
    "global_leadership_team_url",
    "is_primary_entity",
    "foundational_mandate",
    "entity_logo_url",
    "organizational_chart_link",
    "budget_financial_reporting_link",
    "results_framework_link",
    "strategic_plan_link",
    "annual_reports_link",
    "transparency_portal_link",
    "socials_linkedin",
    "socials_twitter",
    "socials_instagram",
    "entity_news_page",
    "entity_branding_page",
    "entity_data_page",
    "entity_logo_page",
    "entity_logo_available",
    "entity_careers_page",
    "entity_wikipedia_page",
    "entity_footnotes",
    "entity_aliases",
    "entity_mandate_registry",
    "entity_custom_mandate_registry",
    "record_id",
    "review_needed",
]

# Compare with all available columns
all_columns = df.columns.tolist()
not_selected_columns = [col for col in all_columns if col not in selected_columns]

# Print columns that are not selected
print("Columns not selected:", not_selected_columns)

# Filter the DataFrame to include only selected columns
df = df[selected_columns]

output_path = Path("data") / "input" / "input_entities.csv"
df.to_csv(output_path, index=False)
