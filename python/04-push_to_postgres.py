"""
Push UN entities data to PostgreSQL Azure database.

Usage:
    uv run python python/04-push_to_postgres.py
"""

import os
from pathlib import Path
from urllib.parse import quote_plus

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

# Verify required environment variables
required_vars = [
    "AZURE_POSTGRES_HOST",
    "AZURE_POSTGRES_DB",
    "AZURE_POSTGRES_USER",
    "AZURE_POSTGRES_PASSWORD",
]
missing_vars = [var for var in required_vars if not os.getenv(var)]
if missing_vars:
    raise ValueError(
        f"Missing required environment variables: {', '.join(missing_vars)}"
    )

# Load data
csv_path = Path("data") / "output" / "entities.csv"
df = pd.read_csv(csv_path)
df = df[["entity", "entity_long"]]
print(f"Loaded {len(df):,} entities from CSV")

# Create database connection
user = quote_plus(os.getenv("AZURE_POSTGRES_USER", ""))
password = quote_plus(os.getenv("AZURE_POSTGRES_PASSWORD", ""))
host = os.getenv("AZURE_POSTGRES_HOST", "")
port = os.getenv("AZURE_POSTGRES_PORT", "5432")
db = os.getenv("AZURE_POSTGRES_DB", "")

connection_string = f"postgresql://{user}:{password}@{host}:{port}/{db}?sslmode=require"
engine = create_engine(connection_string)
print(f"Connected to Postgres: {host}/{db}")

# Delete existing data and insert
try:
    with engine.begin() as conn:
        # Use DELETE instead of TRUNCATE to avoid foreign key cascade issues
        conn.exec_driver_sql("DELETE FROM systemchart.entities;")

    df.to_sql(
        "entities",
        engine,
        if_exists="append",
        index=False,
        schema="systemchart",
        method="multi",
        chunksize=1000,
    )
    print(f"✓ Successfully pushed {len(df):,} entities to systemchart.entities")

except Exception as e:
    print(f"✗ Error: {e}")
    raise
finally:
    engine.dispose()
