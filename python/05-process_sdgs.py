import json
import re
from pathlib import Path
from time import sleep

from tqdm import tqdm
import pandas as pd
import requests
from joblib.memory import Memory
from utils import parse_amount
from rich import print

memory = Memory(location=".cache", verbose=0)

SDG_SHORT_TITLES = {
    1: "No Poverty",
    2: "Zero Hunger",
    3: "Good Health and Well-being",
    4: "Quality Education",
    5: "Gender Equality",
    6: "Clean Water and Sanitation",
    7: "Affordable and Clean Energy",
    8: "Decent Work and Economic Growth",
    9: "Industry, Innovation, and Infrastructure",
    10: "Reduced Inequality",
    11: "Sustainable Cities and Communities",
    12: "Responsible Consumption and Production",
    13: "Climate Action",
    14: "Life Below Water",
    15: "Life on Land",
    16: "Peace, Justice, and Strong Institutions",
    17: "Partnerships for the Goals",
}

df = pd.read_excel(
    "data/downloads/sdgs/Global-Indicator-Framework-after-2025-review-English.xlsx",
    sheet_name="A.RES.71.313 Annex",
    header=None,
)

goals = []
current_goal = None
current_target = None

for _, row in df.iterrows():
    goal_text = row[1]
    indicator_text = row[2]
    code = row[3]

    if pd.notna(goal_text) and goal_text.startswith("Goal "):
        # Extract goal number and title
        match = re.match(r"Goal (\d+)\.\s+(.*)", goal_text)
        if match:
            goal_num = int(match.group(1))
            current_goal = {
                "number": goal_num,
                "shortTitle": SDG_SHORT_TITLES[goal_num],
                "title": match.group(2),
                "targets": [],
            }
            goals.append(current_goal)
            current_target = None

    elif pd.notna(goal_text) and current_goal:
        # This is a target
        match = re.match(r"(\d+\.[a-z0-9]+)\s+(.*)", goal_text)
        if match:
            current_target = {
                "number": match.group(1),
                "description": match.group(2),
                "indicators": [],
            }
            current_goal["targets"].append(current_target)

    if pd.notna(indicator_text) and pd.notna(code) and current_target:
        # Extract indicator number from the text
        match = re.match(r"(\d+\.[a-z0-9]+\.\d+)\s+(.*)", indicator_text)
        if match:
            current_target["indicators"].append(
                {
                    "number": match.group(1),
                    "description": match.group(2),
                    "code": code,
                }
            )

with open("public/sdgs.json", "w") as f:
    json.dump(goals, f, indent=2)

# Process SDG expenses data
df_expenses = pd.read_csv("data/downloads/sdgs/expenses-by-sdg.csv")
df_expenses["amount_parsed"] = df_expenses["amount"].apply(parse_amount)

# Group by SDG and entity
sdg_expenses = {}
for sdg_num in range(1, 18):
    sdg_data = df_expenses[df_expenses["SDG goal"] == sdg_num]
    entities = {}
    for _, row in sdg_data.iterrows():
        entity = row["entity code"]
        amount = row["amount_parsed"]
        if entity not in entities:
            entities[entity] = 0
        entities[entity] += amount

    sdg_expenses[str(sdg_num)] = {
        "total": sum(entities.values()),
        "entities": entities,
    }

with open("public/sdg-expenses.json", "w") as f:
    json.dump(sdg_expenses, f, indent=2)

get = memory.cache(requests.get)
map = {}
for id in range(500):
    res = get(f"https://api.uninfo.org/v1.0/workspace/{id}")
    if not res.text:
        continue
    data = res.json()
    countries = [country["name"] for country in data["countries"]]
    for country in countries:
        map[country] = id

Path("data/processed/workspace_ids.json").write_text(
    json.dumps(map, indent=2, ensure_ascii=False)
)

data = []
for country, id in tqdm(list(map.items())):
    workspace = get(f"https://api.uninfo.org/v1.0/workspace/{id}").json()
    if len(workspace["countries"]) > 1:
        print(f"{country} has shared workspace, skipping for now")
    items = get(
        "https://api.uninfo.org/v1.0/planEntity/finance/overview",
        params={
            "financeYears": 2025,
            "grouping": "sdg",
            "workspaceIds": id,
            "year": 2025,
        },
    ).json()
    for item in items:
        res_req = [
            m["total"]
            for m in item["metrics"]
            if m["metricName"] == "Total Required Resources"
        ]
        res_req = res_req[0] if res_req else None
        res_avl = [
            m["total"]
            for m in item["metrics"]
            if m["metricName"] == "Total Available Resources"
        ]
        res_avl = res_avl[0] if res_avl else None
        entry = {
            "country": country,
            "sdg": item["id"],
            "resources_required": res_req,
            "resources_available": res_avl,
        }
        data.append(entry)
Path("data/processed/resources_by_country_and_sdg.json").write_text(
    json.dumps(data, indent=2, ensure_ascii=False)
)
