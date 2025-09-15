from pathlib import Path

import pandas as pd

data_folder = Path("data")

# Load data from CSV file (exported from Airtable)
csv_path = data_folder / "input" / "un_entities.csv"
df = pd.read_csv(csv_path)


# Wrangle ------------------------------------------------------

df.columns = df.columns.str.lower().str.replace(r"[ -]", "_", regex=True)

df = df.sort_values("entity")

len(df)

# Filter out rows where the entity column matches "Other"
df = df[df["entity"] != "Other"]


# Export ------------------------------------------------------

output_path = data_folder / "input" / "entities.csv"
df.to_csv(output_path)

output_path = Path("public") / "entities.json"
df.to_json(output_path, orient="records", indent=2)
