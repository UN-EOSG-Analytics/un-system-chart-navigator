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

# Drop rows that are completely empty
df = df.dropna(how="all")

if len(df) < 160:
    raise ValueError(f"Expected more than 160 records, but got {len(df)}")

print(f"Number of entities fetched: {df.shape[0]}")

# Filter out rows where 'added_via_form' is True
if "added_via_form" in df.columns:
    df = df[df["added_via_form"] != "TRUE"]

# Filter out rows where on_display is not TRUE
df = df[df["on_display"] == "TRUE"]

# Check for duplicate entities
duplicates = df[df["entity"].duplicated(keep=False)]["entity"]
if not duplicates.empty:
    raise ValueError(
        f"Duplicate entities found in the input data: {duplicates.to_list()}"
    )
else:
    print("All entities are unique.")


print(f"Number of entities showing: {df.shape[0]}")

# Check if all entity values are URL safe
unsafe_entities = []
for entity in df["entity"]:
    if quote(entity, safe="") != entity:
        unsafe_entities.append(entity)

if unsafe_entities:
    print(f"Warning: Entities not URL safe: {unsafe_entities}")
else:
    print("All entities are URL safe.")

# df.columns
# List of selected columns
selected_columns = [
    # Core entity identifiers
    "entity",
    "entity_long",
    "entity_combined",
    "entity_aliases",
    "entity_description",
    "entity_footnotes",
    # Links and references
    "entity_link",
    "entity_wikipedia_page",
    "entity_news_page",
    "entity_branding_page",
    "entity_data_page",
    "entity_logo_page",
    "entity_logo_url",
    "entity_logo_available",
    "entity_careers_page",
    # UN structure and classification
    "un_principal_organ",
    "category",
    "subcategory",
    "is_ceb_member",
    # Mandate and registry
    "foundational_mandate",
    "entity_mandate_registry",
    "entity_custom_mandate_registry",
    # Leadership
    "head_of_entity_title_general",
    "head_of_entity_title_specific",
    "head_of_entity_name",
    "head_of_entity_level",
    "head_of_entity_bio_link",
    "head_of_entity_headshot_link",
    "global_leadership_team_url",
    # Documents and resources
    "organizational_chart_link",
    "budget_financial_reporting_link",
    "results_framework_link",
    "strategic_plan_link",
    "annual_reports_link",
    "transparency_portal_link",
    # Socials
    "socials_linkedin",
    "socials_twitter",
    "socials_instagram",
    # Misc
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
