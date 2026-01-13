"""
Fetch UN entities data from Airtable.

This script:
1. Connects to Airtable using API credentials from .env
2. Fetches all records from the specified base and table
3. Validates data quality (checks for duplicates, URL safety)
4. Selects relevant columns for processing
5. Exports raw data to CSV and pickle formats

Environment variables required:
- AIRTABLE_API_KEY: API token from https://airtable.com/create/tokens
- AIRTABLE_BASE_ID: The base ID containing entity data
- AIRTABLE_TABLE_ID: The table ID within the base

The output CSV is consumed by 02-process_entities_data.py for further processing.
"""

import os
from pathlib import Path
from urllib.parse import quote

import pandas as pd
from dotenv import load_dotenv
from pyairtable import Api

# Load environment variables from .env file
load_dotenv()

# Initialize Airtable API connection
# https://airtable.com/create/tokens
api = Api(os.environ["AIRTABLE_API_KEY"])

BASE_ID = os.environ["AIRTABLE_BASE_ID"]
TABLE_ID = os.environ["AIRTABLE_TABLE_ID"]

# Fetch all records from the 'API ALL' view
table = api.table(BASE_ID, TABLE_ID)
records = table.all()

if records:
    data = [record["fields"] for record in records]
    df = pd.DataFrame(data)

# Drop rows that are completely empty
df = df.dropna(how="all")

# Sanity check: ensure we have a reasonable number of entities
if len(df) < 160:
    raise ValueError(f"\nExpected more than 160 records, but got {len(df)}")

print(f"\nNumber of entities fetched: {df.shape[0]}")

# Filter out rows where 'added_via_form' is True (user submissions pending review)
if "added_via_form" in df.columns:
    df = df[df["added_via_form"] != "TRUE"]

# Filter out rows where on_display is not TRUE (hidden entities)
df = df[df["on_display"] == "TRUE"]

# Check for duplicate entities (data integrity validation)
duplicates_mask = df["entity"].duplicated(keep=False)
if duplicates_mask.any():
    duplicate_rows = df[duplicates_mask][["entity", "entity_long"]].drop_duplicates()
    duplicates_info = duplicate_rows.to_string(index=False)
    raise ValueError(f"Duplicate entities found in the input data:\n{duplicates_info}")
else:
    print("\nAll entities are unique.")


print(f"\nNumber of entities showing: {df.shape[0]}")

# Validate that all entity codes are URL-safe (for routing)
unsafe_entities = []
for entity in df["entity"]:
    if quote(entity, safe="") != entity:
        unsafe_entities.append(entity)

if unsafe_entities:
    print(f"\nWarning: Entities not URL safe: {unsafe_entities}")
else:
    print("\nAll entities are URL safe.")

# df.columns
# Define columns to include in the export
# This ensures we only process relevant fields and maintain consistency
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
    "entity_headquarters",
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
    "head_of_entity_headshot",
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

# Compare with all available columns (for debugging)
all_columns = df.columns.tolist()
not_selected_columns = [col for col in all_columns if col not in selected_columns]

# Print columns that are not selected
print("\nColumns not selected:", not_selected_columns)

# Filter the DataFrame to include only selected columns
df = df[selected_columns]

# Export raw data with all fields (including attachments) for backup
output_path = Path("data") / "input" / "input_entities.pkl"
df.to_pickle(output_path)

# Drop head_of_entity_headshot column (large attachment field) before CSV export
if "head_of_entity_headshot" in df.columns:
    df = df.drop(columns=["head_of_entity_headshot"])

# Export to CSV for next processing step
output_path = Path("data") / "input" / "input_entities.csv"
df.to_csv(output_path, index=False)
