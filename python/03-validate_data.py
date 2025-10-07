import ast
from pathlib import Path

import pandas as pd

data_folder = Path("data")

# Load data from csv file (fetched from Airtable)
csv_path = data_folder / "input" / "input_entities.csv"
df = pd.read_csv(csv_path)

df["un_principal_organ"] = df["un_principal_organ"].astype(str)
df["un_principal_organ"] = df["un_principal_organ"].apply(
    lambda x: ast.literal_eval(x) if x.startswith("[") and x.endswith("]") else x
)

# Include empty values in the counts
df["un_principal_organ"] = df["un_principal_organ"].replace("nan", None)

un_principal_organ = df.explode("un_principal_organ")
summary_table = (
    un_principal_organ.groupby("un_principal_organ", dropna=False)
    .size()
    .reset_index(name="count")
    .sort_values(by="count", ascending=False)
)
print(summary_table["un_principal_organ"])
