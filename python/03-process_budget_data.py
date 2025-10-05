import csv
import json
from pathlib import Path
import pandas as pd

YEAR = 2023

# Mapping from budget CSV entity codes to standardized entity codes
ENTITY_MAPPING = {
    'UN-HABITAT': 'UN-Habitat',
    'UNHABITAT': 'UN-Habitat',
    'UNWOMEN': 'UN-Women',
    'UNWTO': 'UN Tourism',
    'OHRLLS': 'UN-OHRLLS',
    'POE-CAR': 'PoE-CAR',
    'POE-HAITI': 'PoE-Haiti',
    'POE-LIBYA': 'PoE-Libya',
    'POE-SUDAN': 'PoE-Sudan',
    'POE-YEMEN': 'PoE-Yemen',
    'POS-SSUDAN': 'PoE-S.Sudan',
    'SRSG-CAAC': 'OSRSG-CAAC',
    'SRSG-SVC': 'OSRSG-SVC',
    'SRSG-VAC': 'OSRSG-VAC',
    'OSESG-MYAN': 'OSESG-Myanmar',
    'SESG-MYAN': 'OSESG-Myanmar',
    'SESG-HAFRICA': 'OSESG-Horn',
    'SESG-YEMEN': 'OSESG-Yemen',
    'SC-RES1559': 'OSESG-SCRES1559',
    'SASG-CYP': 'OSASG-Cyprus',
    'PESG-WSAHARA': 'PESG-WS',
    'OSESG-BDI': 'OSESG-FG',
    'GEXP-DRC': 'GoE-DRC',
    'UNGCO': 'UNGC',
    'OVRA': 'VRA',
    'ETHICS': 'EO',
    'AOJ': 'OAJ',
    'IM-MYANMAR': 'IIMM',
    'OSET': 'ODET',
    'RCS': 'DCO',
    'UN-RGID': 'UNRGID',
}

def parse_amount(amount_str: str) -> float:
    """Parse amount string to float, removing spaces and commas."""
    return float(amount_str.replace(',', '').replace(' ', '').strip())

def normalize_entity(entity: str) -> str:
    """Normalize entity code to match entities.json."""
    return ENTITY_MAPPING.get(entity, entity)

df_system = pd.read_csv('data/downloads/budget/un-system-expenses.csv')
df_system = df_system[df_system["calendar_year"] == YEAR]
df_system["amount"] = df_system["amount"].apply(parse_amount)
df_system["agency"] = df_system["agency"].apply(normalize_entity)
df_system = df_system.drop(columns=["calendar_year"]).rename(columns={"agency": "entity"}).reset_index(drop=True)
df_secretariat = pd.read_csv('data/downloads/budget/un-secretariat-expenses.csv')
df_secretariat = df_secretariat.groupby("ENTITY").agg({"AMOUNT": "sum"}).reset_index().rename(columns={"ENTITY": "entity", "AMOUNT": "amount"})
df_secretariat["entity"] = df_secretariat["entity"].apply(normalize_entity)

system_total = df_system["amount"].sum()
assert 60e9 < system_total < 70e9
assert 14e9 < df_secretariat["amount"].sum() < 15e9
secretariat_v1 = df_system[df_system["entity"].isin(["UN", "UN-DPO"])]["amount"].sum()
secretariat_v2 = df_secretariat["amount"].sum()
assert abs(secretariat_v1 - secretariat_v2) < 0.5e9
df_system = df_system[~df_system["entity"].isin(["UN", "UN-DPO"])]
df_system.merge(df_secretariat, on="entity", how="inner", suffixes=("_system", "_secretariat"))

df_combined = df_system.merge(df_secretariat, on="entity", how="outer", suffixes=("_system", "_secretariat"))
df_combined["amount"] = df_combined["amount_system"].fillna(df_combined["amount_secretariat"])
df_combined["source"] = df_combined.apply(lambda row: "ceb" if pd.notna(row["amount_system"]) else "secretariat" if pd.notna(row["amount_secretariat"]) else None, axis=1)
assert abs(df_combined["amount"].sum() - system_total) < 2e9

entities = json.loads(Path('public/entities.json').read_text())

a = set([a["entity"] for a in entities])
b = set(df_combined["entity"].values)
print("entities without budget data:", a.difference(b))
print("budget items that are not in entities:", b.difference(a))

df_combined["year"] = YEAR
df_combined[["entity", "source", "year", "amount"]].to_json("public/budget.json", orient="records", indent=2)