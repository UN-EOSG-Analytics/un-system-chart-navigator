from pathlib import Path

import pandas as pd

# Load data from csv file (fetched from Airtable)
input_path = Path("data") / "input" / "input_entities.csv"
df = pd.read_csv(input_path)


# Wrangle ------------------------------------------------------

df = df.sort_values("entity")

# Filter out rows where the on_display column is False
df = df[df["on_display"] != False]

# len(df)

# Export ------------------------------------------------------

output_path = Path("data") / "output" / "entities.csv"
df.to_csv(output_path, index=False)

output_path = Path("public") / "un-entities.csv"
df.to_csv(output_path, index=False)

output_path = Path("public") / "un-entities.json"
df.to_json(output_path, orient="records", indent=2)


# Export for mandates.un.org -----------------------------------

columns_to_select = ["entity", "entity_long"]

df = df[columns_to_select]

output_path = Path("data") / "output" / "mandate_entities.csv"
df.to_csv(output_path, index=False)
