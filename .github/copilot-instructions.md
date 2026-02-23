# Copilot Instructions: UN System Chart Navigator

Interactive static site explorer for UN System entities — [systemchart.un.org](https://systemchart.un.org).

## Tech Stack

| Layer           | Technology                                        |
| --------------- | ------------------------------------------------- |
| Framework       | Next.js 16 (App Router, `output: "export"`)       |
| Language        | TypeScript 5, React 19                            |
| Styling         | Tailwind CSS v4                                   |
| UI primitives   | shadcn/ui (Radix UI)                              |
| Icons           | lucide-react                                      |
| Font            | Roboto (via `next/font/google`)                   |
| Package manager | pnpm (workspaces)                                 |
| Data source     | Airtable API                                      |
| Data pipeline   | Python (`uv`) — pandas, python-dotenv, sqlalchemy |
| Database        | Azure PostgreSQL (shared, read by other UN apps)  |
| Deployment      | GitHub Pages (static)                             |

## Architecture Overview

**Static Next.js app** — `output: "export"` in [next.config.ts](../next.config.ts), deployed to GitHub Pages. No server-side rendering; all data is baked in at build time.

**Data flow (read-only at runtime):**

1. Python scripts fetch from Airtable → process → `public/un-entities.json` + push to Azure PostgreSQL
2. [`src/lib/entities.ts`](../src/lib/entities.ts) imports JSON statically at build time
3. React components consume pre-filtered entity arrays — no API calls in the browser
4. Built site is exported to `out/` and deployed to GitHub Pages

## Key Files

| File                                                      | Purpose                                                                                                                                               |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/lib/constants.ts`](../src/lib/constants.ts)         | **Single source of truth** for all configuration: entity display rules, sort orders, principal organ colors, affiliated entity definitions, footnotes |
| [`src/lib/entities.ts`](../src/lib/entities.ts)           | `getAllEntities()`, `searchEntities()`, `getEntityBySlug()` — all entity access goes through here                                                     |
| [`src/types/entity.ts`](../src/types/entity.ts)           | `Entity` interface — every field from Airtable/JSON                                                                                                   |
| [`src/lib/entityAliases.ts`](../src/lib/entityAliases.ts) | Slug alias resolution for URL canonicalization                                                                                                        |
| [`public/un-entities.json`](../public/un-entities.json)   | Authoritative entity data — never edit manually; always regenerate via scripts                                                                        |
| [`src/components/ui/`](../src/components/ui/)             | shadcn/ui base components — **do not edit directly**                                                                                                  |

## Developer Workflows

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Next.js static export → out/ (includes pre-release password wrap)
pnpm typecheck    # TypeScript check (no emit)
pnpm lint         # ESLint on src/
pnpm format       # Prettier on src/

./update_data.sh  # Full data refresh: Airtable → un-entities.json (uses `uv` for Python)
# Optional extras:
uv run python/03-download_headshots.py [--force]
uv run python/04-push_to_postgres.py              # Push entity list to Azure PostgreSQL
uv run python/04-push_to_postgres.py --allow-delete  # Also remove deleted entities (caution)
uv run python/verification/verify_links.py
```

**Python tooling uses `uv`** (not pip/venv). Never run Python scripts with plain `python`.

**Required `.env` variables** (Python scripts read these via `python-dotenv`):

```
PYTHONPATH=./python
AIRTABLE_API_KEY=       # from https://airtable.com/create/tokens
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_ID=
AZURE_POSTGRES_HOST=    # Azure PostgreSQL host
AZURE_POSTGRES_PORT=5432
AZURE_POSTGRES_DB=
AZURE_POSTGRES_USER=
AZURE_POSTGRES_PASSWORD=
```

## URL State & Navigation Pattern

All interactive state lives in URL params — no global state store:

- `?q=unicef` — search query
- `?organs=GA,SC` — active principal organ filter (comma-separated, unencoded)
- `?entity=unicef` — open entity modal (lowercase slug)

`EntityModalHandler` reads `?entity=` via `useSearchParams`, resolves aliases, and renders `EntityModal`. `EntityGrid` manages search/filter state and syncs to URL using the **native history API** (not `router.push`) to avoid Next.js re-renders:

```ts
window.history.replaceState({}, "", buildFilterUrl(searchQuery, activePrincipalOrgans, ...));
```

## Configuration Patterns in `constants.ts`

When changing entity display behavior, always use `constants.ts` — never hardcode in components:

- `useLongNameOnCard` — Set of entity acronyms that show full name on card (e.g., `"UNDC"`)
- `externalLinkEntities` — entities that open an external URL instead of the modal
- `affiliatedEntities` — child entities that sort after a parent entity (e.g., UNCDF/UNV after UNDP)
- `hideCategoryForOrgan` — hide category/subcategory for dual-organ entities in specific sections (key format: `"ENTITY|Principal Organ"`)
- `principalOrganConfigs` — colors, labels, and links for each UN principal organ section

## Styling Conventions

Design language: **clean, modern, minimal**. When adding or editing UI, follow these principles:

- **Font**: Always use Roboto (loaded via `next/font/google`). Never introduce other typefaces.
- **Alignment**: Default to left-aligned text; center-align only for standalone UI elements (e.g., empty states, icons). Maintain consistent, equal spacing between elements.
- **Visual hierarchy**: Use font weight, size, uppercase, and color to create clear hierarchy. Respect margins — don't crowd elements.
- **Color**: UN Blue (`#009edb`, `--color-un-blue`) is the primary brand color. Principal organ sections each have a dedicated pastel + dark pair defined as CSS variables in [`src/app/globals.css`](../src/app/globals.css) and mirrored in `principalOrganConfigs` in `constants.ts` — always use these tokens, never hardcode hex values in components. Example pairs:
  - Yellow: `--color-un-system-yellow` / `--color-un-system-yellow-dark`
  - Blue: `--color-un-system-blue` / `--color-un-system-blue-dark`
- **Tailwind v4**: Use Tailwind utility classes. Custom theme tokens (e.g., `bg-un-blue`, `text-un-system-yellow`) are registered in `globals.css` under `@theme` and are available as Tailwind classes.
- **No focus rings**: Global CSS removes all focus outlines (`outline: none`) — do not re-introduce them.

## Component Conventions

- **All interactive components are `"use client"`** — the project doesn't use React Server Components for UI
- **`components/ui/`** — shadcn/ui primitives; use `npx shadcn@latest diff` to check for upstream updates
- Entity cards use `entity.entity` (acronym) as the React `key`, not an ID field
- `parseUnPrincipalOrgan()` in `entities.ts` normalizes Airtable's inconsistent array/string/JSON-string formats on load — always expect `string[] | null` downstream

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

## Build & Deploy

Production site is a **static export** (`out/`) deployed to **GitHub Pages**. `pnpm build` runs `next build` then `node scripts/encrypt-site.js` — the encrypt step is **pre-release only** (password-protects the staging build) and will be removed before public launch.
