import json

import pandas as pd
import requests
from bs4 import BeautifulSoup
from utils import normalize_entity, parse_amount


def normalize_rev_type(rev_type: str) -> str:
    """Normalize revenue type to shorter, consistent labels."""
    lower = rev_type.lower()
    if "assessed" in lower:
        return "Assessed"
    elif "voluntary core" in lower or "un-earmarked" in lower:
        return "Voluntary un-earmarked"
    elif "voluntary non-core" in lower or "earmarked" in lower:
        return "Voluntary earmarked"
    else:
        return "Other"

# Scrape UN member states and observer states
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}
response = requests.get("https://www.un.org/en/about-us/member-states", headers=headers)
soup = BeautifulSoup(response.text, "html.parser")
member_states = [
    h2.get_text().strip()
    for h2 in soup.find_all("h2")
    if h2.get_text().strip()
    and not h2.get_text().strip().startswith("MEMBER STATES")
    and h2.get_text().strip() != "Search the United Nations"
]

response_observers = requests.get(
    "https://www.un.org/en/about-us/non-member-states", headers=headers
)
soup_observers = BeautifulSoup(response_observers.text, "html.parser")
observer_states = [
    h3.get_text().strip()
    for h3 in soup_observers.find_all("h3")
    if h3.get_text().strip() not in ["MEMBER STATES", "Quick links for delegates"]
]

all_states = member_states + observer_states
# Normalize curly apostrophes to straight (UN website is inconsistent)
all_states = [s.replace("\u2019", "'") for s in all_states]

df_donors = pd.read_csv(
    "data/downloads/budget/government-donor-revenue.csv", encoding="utf-8"
)
# Fix corrupted characters in CSV (original file has wrong encoding)
df_donors["government_donor"] = df_donors["government_donor"].replace(
    {
        "C�te d'Ivoire": "Côte D'Ivoire",
        "T�rkiye": "Türkiye",
        "Cura�ao": "Curaçao",
    }
)

# Normalize scraped states to match CSV donor names
STATE_MAPPING = {
    "Bahamas (The)": "Bahamas",
    "Gambia (Republic of The)": "Gambia",
    "Guinea Bissau": "Guinea-Bissau",
    "Netherlands (Kingdom of the)": "Netherlands",
    "Venezuela, Bolivarian Republic of": "Venezuela (Bolivarian Republic of)",
}

all_states_normalized = [STATE_MAPPING.get(s, s) for s in all_states]
all_states_normalized_set = set(all_states_normalized)
donor_names = set(df_donors["government_donor"].unique())

print(
    f"\n{len(member_states)} member states + {len(observer_states)} observer states = {len(all_states)} total states scraped"
)
print(f"{len(donor_names)} unique government donors in CSV")
print(f"\nDonors not in member/observer states (after normalization):")
print(sorted(donor_names - all_states_normalized_set))
print(f"\nMember/observer states without donor data:")
print(sorted(all_states_normalized_set - donor_names))

# Create state status mapping
member_states_normalized = [STATE_MAPPING.get(m, m) for m in member_states]
observer_states_normalized = [STATE_MAPPING.get(o, o) for o in observer_states]
state_status = {}
for state in member_states_normalized:
    state_status[state] = "member"
for state in observer_states_normalized:
    state_status[state] = "observer"
for donor in donor_names:
    if donor not in state_status:
        state_status[donor] = "nonmember"

# Group donor data by government_donor, entity, and rev_type
df_donors["amount_parsed"] = df_donors["amount"].apply(parse_amount)
df_donors["entity_normalized"] = df_donors["entity"].apply(normalize_entity)
# Exclude refunds to donors/miscellaneous
df_donors = df_donors[
    ~df_donors["rev_type"].str.lower().str.contains("refunds to donors", na=False)
    & ~df_donors["rev_type"].str.lower().str.contains("miscellaneous", na=False)
]
donor_contributions = {}
for donor in donor_names:
    donor_data = df_donors[df_donors["government_donor"] == donor]
    contributions = {}
    for _, row in donor_data.iterrows():
        entity = row["entity_normalized"]
        rev_type = normalize_rev_type(row["rev_type"])
        amount = row["amount_parsed"]
        if entity not in contributions:
            contributions[entity] = {}
        if rev_type not in contributions[entity]:
            contributions[entity][rev_type] = 0
        contributions[entity][rev_type] += amount

    donor_contributions[donor] = {
        "status": state_status[donor],
        "contributions": contributions,
    }

with open("public/member-states.json", "w") as f:
    json.dump(donor_contributions, f, indent=2)
