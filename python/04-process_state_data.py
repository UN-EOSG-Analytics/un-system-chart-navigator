import json
from datetime import datetime

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


def scrape_payment_status() -> dict[str, dict]:
    """Scrape payment status from UN honour roll."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    response = requests.get(
        "https://www.un.org/en/ga/contributions/honourroll.shtml", headers=headers
    )
    soup = BeautifulSoup(response.text, "html.parser")

    payment_data = {}
    
    # Find all tables
    tables = soup.find_all("table")
    
    # Deadline is 30 days after January 1, 2025 = February 6, 2025
    deadline_date = datetime(2025, 2, 6)
    
    for table in tables:
        rows = table.find_all("tr")
        for row in rows[1:]:  # Skip header
            cells = row.find_all("td")
            if len(cells) >= 4:
                state_name = cells[1].get_text().strip()
                payment_date_str = cells[3].get_text().strip()
                if state_name and payment_date_str and state_name != "Member State":
                    # Parse payment date to determine if punctual or late
                    try:
                        # Parse date like "7-Jan-25" or "10-Jan-25"
                        payment_date = datetime.strptime(payment_date_str, "%d-%b-%y")
                        status = "punctual" if payment_date <= deadline_date else "late"
                    except:
                        # Default to punctual if can't parse
                        status = "punctual"
                    
                    if state_name not in payment_data:
                        payment_data[state_name] = {
                            "payment_date": payment_date_str,
                            "payment_status": status,
                        }

    return payment_data

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

# Normalize curly apostrophes to straight (UN website is inconsistent)
member_states = [s.replace("\u2019", "'") for s in member_states]
observer_states = [s.replace("\u2019", "'") for s in observer_states]
all_states = member_states + observer_states

# Scrape payment status
print("\nScraping payment status from honour roll...")
payment_status_raw = scrape_payment_status()
print(f"Found payment data for {len(payment_status_raw)} states")

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

# Mapping for payment status names that differ from member states list
PAYMENT_STATE_MAPPING = {
    "Cote d'Ivoire": "Côte D'Ivoire",
    "United Kingdom": "United Kingdom of Great Britain and Northern Ireland",
    "United States": "United States of America",
}

# Normalize payment status state names
payment_status = {}
for raw_name, data in payment_status_raw.items():
    normalized_name = PAYMENT_STATE_MAPPING.get(raw_name, raw_name)
    payment_status[normalized_name] = data

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

    donor_entry = {
        "status": state_status[donor],
        "contributions": contributions,
    }

    # Add payment status if available (only for member/observer states)
    if donor in payment_status:
        donor_entry["payment_date"] = payment_status[donor]["payment_date"]
        donor_entry["payment_status"] = payment_status[donor]["payment_status"]
    elif state_status[donor] in ["member", "observer"]:
        # State has not paid yet
        donor_entry["payment_status"] = "missing"

    donor_contributions[donor] = donor_entry

print(f"\nPayment status coverage:")
print(f"  Punctual: {sum(1 for d in donor_contributions.values() if d.get('payment_status') == 'punctual')}")
print(f"  Late: {sum(1 for d in donor_contributions.values() if d.get('payment_status') == 'late')}")
print(f"  Missing: {sum(1 for d in donor_contributions.values() if d.get('payment_status') == 'missing')}")

with open("public/member-states.json", "w") as f:
    json.dump(donor_contributions, f, indent=2)
