import ast

import pandas as pd


def parse_airtable_list_literal(value):
    """
    Parse Airtable-exported array literals into native Python lists.

    Airtable CSV exports array fields as string literals like
    "['General Assembly']". Missing values are normalized to None.
    """
    if pd.isna(value):
        return None

    if isinstance(value, str) and value.startswith("[") and value.endswith("]"):
        return ast.literal_eval(value)

    return value
