"""
Push UN entities data to PostgreSQL Azure database.

Usage:
    uv run python python/04-push_to_postgres.py [--allow-delete]
    
Options:
    --allow-delete    Allow deletion of entities not in CSV (use with caution)
"""

import os
import sys
from pathlib import Path
from urllib.parse import quote_plus

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

# Parse command-line arguments
ALLOW_DELETE = "--allow-delete" in sys.argv

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

# UPSERT data (insert new records, update existing ones)
try:
    with engine.begin() as conn:
        # Check for entities in DB that are not in CSV (potential deletions)
        result = conn.exec_driver_sql(
            "SELECT entity FROM systemchart.entities ORDER BY entity"
        )
        existing_entities = {row[0] for row in result}
        csv_entities = set(df["entity"])

        entities_to_delete = existing_entities - csv_entities
        if entities_to_delete:
            if not ALLOW_DELETE:
                print(
                    f"\n❌ ERROR: {len(entities_to_delete)} entities exist in DB but not in CSV:"
                )
                for entity in sorted(entities_to_delete):
                    print(f"  - {entity}")
                print(
                    "\nCannot proceed - would delete existing entities with potential references."
                )
                print("Re-run with --allow-delete flag to force deletion.")
                raise ValueError(
                    f"Attempting to delete {len(entities_to_delete)} existing entities"
                )
            else:
                print(
                    f"\n⚠️  WARNING: Deleting {len(entities_to_delete)} entities from DB:"
                )
                for entity in sorted(entities_to_delete):
                    print(f"  - {entity}")
                # Delete entities not in CSV
                for entity in entities_to_delete:
                    try:
                        conn.exec_driver_sql(
                            "DELETE FROM systemchart.entities WHERE entity = %s",
                            (entity,),
                        )
                    except Exception as e:
                        print(f"  ✗ Failed to delete {entity}: {e}")
                        raise
                print(f"✓ Deleted {len(entities_to_delete)} entities\n")

        # Prepare UPSERT statement
        upsert_count = 0
        insert_count = 0
        update_count = 0

        for _, row in df.iterrows():
            entity_val = row["entity"]
            entity_long_val = row["entity_long"]

            # Check if entity exists
            check = conn.exec_driver_sql(
                "SELECT entity FROM systemchart.entities WHERE entity = %s",
                (entity_val,),
            )
            exists = check.fetchone() is not None

            # UPSERT: Insert or Update
            conn.exec_driver_sql(
                """
                INSERT INTO systemchart.entities (entity, entity_long, updated_at)
                VALUES (%s, %s, CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')
                ON CONFLICT (entity) 
                DO UPDATE SET 
                    entity_long = EXCLUDED.entity_long,
                    updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York'
                """,
                (entity_val, entity_long_val),
            )

            if exists:
                update_count += 1
            else:
                insert_count += 1
            upsert_count += 1

    print(f"✓ Successfully synchronized {upsert_count:,} entities:")
    print(f"  - Inserted: {insert_count:,}")
    print(f"  - Updated: {update_count:,}")

except Exception as e:
    print(f"✗ Error: {e}")
    raise
finally:
    engine.dispose()
