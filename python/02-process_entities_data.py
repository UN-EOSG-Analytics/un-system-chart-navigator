"""
Process UN entities data from Airtable export.

This script:
1. Loads entity data from CSV (fetched from Airtable)
2. Parses and normalizes un_principal_organ field
3. Links local headshot images to entities
4. Exports processed data to CSV and JSON formats

The JSON output is used by the Next.js frontend for static site generation.
"""

import ast
from pathlib import Path

import pandas as pd

# Load data from csv file (fetched from Airtable)
input_path = Path("data") / "input" / "input_entities.csv"
df = pd.read_csv(input_path)

# Configuration
HEADSHOTS_DIR = Path("public") / "images" / "headshots"


# Wrangle ------------------------------------------------------

df = df.sort_values("entity")

# Parse un_principal_organ from string representation to list
# Airtable exports arrays as string literals like "['General Assembly']"
df["un_principal_organ"] = df["un_principal_organ"].astype(str)
df["un_principal_organ"] = df["un_principal_organ"].apply(
    lambda x: ast.literal_eval(x)
    if x.startswith("[") and x.endswith("]")
    else None
    if x == "nan"
    else x
)


def get_local_headshot_path(entity: str) -> str | None:
    """
    Check if a local headshot exists for the entity and return the web path.
    
    Searches for headshot images in multiple formats (jpg, jpeg, png, gif, webp).
    
    Args:
        entity: The entity short name (e.g., "UNICEF", "WHO")
    
    Returns:
        Web-accessible path like '/images/headshots/ENTITY.png', or None if not found
    
    Example:
        >>> get_local_headshot_path("UNICEF")
        '/images/headshots/UNICEF.jpg'
    """
    for ext in ["jpg", "jpeg", "png", "gif", "webp"]:
        path = HEADSHOTS_DIR / f"{entity}.{ext}"
        if path.exists():
            return f"/images/headshots/{entity}.{ext}"
    return None


# Generate head_of_entity_headshot_link from local files
df["head_of_entity_headshot_link"] = df["entity"].apply(get_local_headshot_path)

# Count headshots found
headshots_found = df["head_of_entity_headshot_link"].notna().sum()
print(f"Local headshots found: {headshots_found}")

# Drop the raw Airtable attachment column (not needed in output)
if "head_of_entity_headshot" in df.columns:
    df = df.drop(columns=["head_of_entity_headshot"])

# len(df)

# Export ------------------------------------------------------

# Export to data directory (for reference)
output_path = Path("data") / "output" / "entities.csv"
df.to_csv(output_path, index=False)

# Export to public directory (for Next.js static site)
output_path = Path("public") / "un-entities.csv"
df.to_csv(output_path, index=False)

# JSON export (primary format for Next.js import)
output_path = Path("public") / "un-entities.json"
df.to_json(output_path, orient="records", indent=2)


# Export for mandates.un.org -----------------------------------

# Create minimal entity list for mandate registry integration
columns_to_select = ["entity", "entity_long"]

df = df[columns_to_select]

output_path = Path("data") / "output" / "mandate_entities.csv"
df.to_csv(output_path, index=False)
