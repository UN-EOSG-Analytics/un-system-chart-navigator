import json
import re

import pandas as pd
from utils import parse_amount

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
