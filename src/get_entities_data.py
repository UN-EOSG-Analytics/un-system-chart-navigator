from pathlib import Path

import pandas as pd

data_folder = Path("data")


# Load Data ------------------------------------------------------

# https://docs.google.com/spreadsheets/d/1OZw5VdCeYwju4Y19W9nuQJXF-u0f5BhYIZpeEdmBDyY/edit?gid=431089069#gid=431089069
URL = "https://docs.google.com/spreadsheets/d/1OZw5VdCeYwju4Y19W9nuQJXF-u0f5BhYIZpeEdmBDyY/export?format=csv&gid=431089069"
df = pd.read_csv(URL)

# Wrangle ------------------------------------------------------

df.columns = df.columns.str.lower().str.replace(r"[ -]", "_", regex=True)

df = df.sort_values("entity")

len(df)

# Filter out rows where the entity column matches "Other"
df = df[df["entity"] != "Other"]


# Export ------------------------------------------------------

# output_path = data_folder / "input" / "entities.csv"
# df.to_csv(output_path)

# output_path = data_folder / "input" / "entities.json"
output_path = Path("web") / "public" / "entities.json"
df.to_json(output_path, orient="records", indent=2)
