## Python Data Pipeline

Scripts run in numbered order via `./update_data.sh`; `04-push_to_postgres.py` is separate (not called by the shell script):

| Script                        | Input                           | Output                                              |
| ----------------------------- | ------------------------------- | --------------------------------------------------- |
| `01-fetch_from_airtable.py`   | Airtable API                    | `data/input/input_entities.csv`                     |
| `02-process_entities_data.py` | `data/input/input_entities.csv` | `public/un-entities.json`, `public/un-entities.csv` |
| `03-download_headshots.py`    | entity data                     | `public/images/headshots/`                          |
| `04-push_to_postgres.py`      | `data/output/entities.csv`      | Azure PostgreSQL `systemchart.entities`             |

## PostgreSQL Database — Handle With Care

`04-push_to_postgres.py` pushes the canonical entity list (`entity`, `entity_long`) to the shared **Azure PostgreSQL** database (`systemchart.entities`). This database is read by **other UN applications** — do not rename columns, change the schema, or run `--allow-delete` without confirming no downstream app depends on the affected rows. Schema is defined in [`sql/entities_schema.sql`](../sql/entities_schema.sql).
