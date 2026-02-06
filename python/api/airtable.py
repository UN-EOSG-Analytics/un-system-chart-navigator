import os

import pandas as pd
from dotenv import load_dotenv
from pyairtable import Api

# Load environment variables from .env file
load_dotenv()

# Initialize Airtable API connection
api = Api(os.environ["AIRTABLE_API_KEY"])


def fetch_airtable_table(
    table_id: str, base_id: str = os.environ["AIRTABLE_BASE_ID"]
) -> pd.DataFrame:
    """
    Fetch all records from an Airtable table and return as a pandas DataFrame.

    Args:
        table_id: The ID of the Airtable table
        base_id: The ID of the Airtable base. Uses AIRTABLE_BASE_ID from .env by default.

    Returns:
        DataFrame containing all records from the table

    Raises:
        ValueError: If no records found in the table.
    """
    table = api.table(
        base_id,
        table_id,
    )

    # Docs: https://pyairtable.readthedocs.io/en/stable/api.html?highlight=cell_format#pyairtable.Table.all
    records = table.all(
        cell_format="string", user_locale="en-ca", time_zone="America/New_York"
    )

    # cell_format – The cell format to request from the Airtable API. Supported options are json (the default) and string. json will return cells as a JSON object. string will return the cell as a string. user_locale and time_zone must be set when using string.

    if not records:
        raise ValueError(f"No records found in Airtable table {table_id}")

    data = [record["fields"] for record in records]
    return pd.DataFrame(data)
