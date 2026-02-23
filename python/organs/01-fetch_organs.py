from pathlib import Path

from api.airtable import fetch_airtable_table
from dotenv import load_dotenv

load_dotenv()

AIRTABLE_TABLE_ID = "tbl4mlFmIH4H7QVoX"

df = fetch_airtable_table(AIRTABLE_TABLE_ID)

df = df.dropna(how="all")
df = df.sort_values("entity", ascending=True)

df = df[df["is_displayed"] == "True"]


df = df[
    [
        "entity",
        "entity_long",
        "governing_bodies",
        "intergov_bodies_link",
        "secretariats",
        "order",
        "system_grouping"
    ]
]

output_path = Path("data/output/organ_contacts.json")
output_path.parent.mkdir(parents=True, exist_ok=True)
df.to_json(output_path, orient="records", indent=2)

len(df)