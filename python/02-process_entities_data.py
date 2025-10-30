from pathlib import Path

import pandas as pd

data_folder = Path("data")

# Load data from csv file (fetched from Airtable)
csv_path = data_folder / "input" / "input_entities.csv"
df = pd.read_csv(csv_path)


# Wrangle ------------------------------------------------------

# df.columns = df.columns.str.lower().str.replace(r"[ -]", "_", regex=True)

df = df.sort_values("entity")

len(df)

# Filter out rows where the entity column matches "Other"
df = df[df["entity"] != "Other"]

# Filter out rows where the on_display column is False
df = df[df["on_display"] != False]


# Export ------------------------------------------------------

output_path = data_folder / "output" / "entities.csv"
df.to_csv(output_path, index=False)

output_path = Path("public") / "entities.csv"
df.to_csv(output_path, index=False)

output_path = Path("public") / "entities.json"
df.to_json(output_path, orient="records", indent=2)


# Export for mandates.un.org -----------------------------------

columns_to_select = [
    "entity",
    "entity_long"
]

df = df[columns_to_select]

output_path = data_folder / "output" / "mandate_entities.csv"
df.to_csv(output_path, index=False)


