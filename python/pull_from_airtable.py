# https://airtable.com/create/tokens

import os
from pathlib import Path

import pandas as pd
from pyairtable import Api

api = Api(os.environ["AIRTABLE_API_KEY"])

BASE_ID = os.environ["AIRTABLE_BASE_ID"]
TABLE_ID = os.environ["AIRTABLE_TABLE_ID"]

table = api.table(BASE_ID, TABLE_ID)

# Fetch all records
records = table.all()

# Extract and print records in a simple format
if records:
    data = [record["fields"] for record in records]
    df = pd.DataFrame(data)


data_folder = Path("data")

output_path = data_folder / "input" / "input_entities.csv"
df.to_csv(output_path)
