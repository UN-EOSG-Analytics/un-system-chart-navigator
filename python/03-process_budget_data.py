import json
from pathlib import Path

import pandas as pd
from utils import normalize_entity, parse_amount

YEAR = 2023


df_system = pd.read_csv("data/downloads/budget/un-system-expenses.csv")
df_system = df_system[df_system["calendar_year"] == YEAR]
df_system["amount"] = df_system["amount"].apply(parse_amount)
df_system["agency"] = df_system["agency"].apply(normalize_entity)
df_system = (
    df_system.drop(columns=["calendar_year"])
    .rename(columns={"agency": "entity"})
    .reset_index(drop=True)
)
df_secretariat = pd.read_csv("data/downloads/budget/un-secretariat-expenses.csv")
df_secretariat = (
    df_secretariat.groupby("ENTITY")
    .agg({"AMOUNT": "sum"})
    .reset_index()
    .rename(columns={"ENTITY": "entity", "AMOUNT": "amount"})
)
df_secretariat["entity"] = df_secretariat["entity"].apply(normalize_entity)

system_total = df_system["amount"].sum()
assert 60e9 < system_total < 70e9
assert 14e9 < df_secretariat["amount"].sum() < 15e9
secretariat_v1 = df_system[df_system["entity"].isin(["UN", "UN-DPO"])]["amount"].sum()
secretariat_v2 = df_secretariat["amount"].sum()
assert abs(secretariat_v1 - secretariat_v2) < 0.5e9
df_system = df_system[~df_system["entity"].isin(["UN", "UN-DPO"])]
df_system.merge(
    df_secretariat, on="entity", how="inner", suffixes=("_system", "_secretariat")
)

df_combined = df_system.merge(
    df_secretariat, on="entity", how="outer", suffixes=("_system", "_secretariat")
)
df_combined["amount"] = df_combined["amount_system"].fillna(
    df_combined["amount_secretariat"]
)
df_combined["source"] = df_combined.apply(
    lambda row: "ceb"
    if pd.notna(row["amount_system"])
    else "secretariat"
    if pd.notna(row["amount_secretariat"])
    else None,
    axis=1,
)
assert abs(df_combined["amount"].sum() - system_total) < 2e9

entities = json.loads(Path("public/entities.json").read_text())

a = set([a["entity"] for a in entities])
b = set(df_combined["entity"].values)
print("entities without budget data:", a.difference(b))
print("budget items that are not in entities:", b.difference(a))

df_combined["year"] = YEAR
df_combined[["entity", "source", "year", "amount"]].to_json(
    "public/budget.json", orient="records", indent=2
)
