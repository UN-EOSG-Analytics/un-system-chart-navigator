# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**UN System Chart Navigator** — interactive static site explorer for UN System entities, [systemchart.un.org](https://systemchart.un.org).

## Tech Stack

| Layer           | Technology                                  |
| --------------- | ------------------------------------------- |
| Framework       | Next.js 16 (App Router, `output: "export"`) |
| Language        | TypeScript 5, React 19                      |
| Styling         | Tailwind CSS v4                             |
| UI primitives   | shadcn/ui (Radix UI)                        |
| Icons           | lucide-react                                |
| Font            | Roboto (via `next/font/google`)             |
| Package manager | pnpm (single package; no workspace globs)   |
| Data source     | Airtable API                                |
| Data pipeline   | Python (`uv`) — pandas, python-dotenv       |
| Deployment      | GitHub Pages (static)                       |
| Agent tooling   | `next-devtools` MCP, `agent-browser` CLI    |

## Architecture Overview

**Static Next.js app** — `output: "export"` in [next.config.ts](next.config.ts), deployed to GitHub Pages. No server-side rendering; all data is baked in at build time.

**Data flow (read-only at runtime):**

1. Python scripts fetch from Airtable → process → `public/un-entities.json`
2. [`src/lib/entities.ts`](src/lib/entities.ts) imports JSON statically at build time
3. React components consume pre-filtered entity arrays — no API calls in the browser
4. Built site is exported to `out/` and deployed to GitHub Pages

**[next.config.ts](next.config.ts) settings that shape how code must be written:**

- `output: "export"` + `images.unoptimized` — no server runtime. The repo has no middleware, no route handlers, and no server actions; don't add any.
- `trailingSlash: true` — routes are emitted as `/about/`; keep internal links consistent with that.
- `cacheComponents: true` — Next 16 Cache Components. Per `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`, PPR is now the default (`experimental.ppr` removed) and client-side navigation keeps previously visited routes **mounted** via React `<Activity>` instead of unmounting them. PPR's streaming half is moot under static export — the mount behavior is the part that bites. Read that doc plus `01-app/02-guides/preserving-ui-state.md` before debugging state that unexpectedly survives navigation (modals, dropdowns, form inputs).
- `logging.browserToTerminal: true` — see the agent tooling section below.

## Key Files

| File                                                   | Purpose                                                                                                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/lib/constants.ts`](src/lib/constants.ts)         | **Single source of truth** for all configuration: entity display rules, sort orders, principal organ colors, affiliated entity definitions, footnotes                                 |
| [`src/lib/entities.ts`](src/lib/entities.ts)           | `getAllEntities()`, `searchEntities()`, `getEntityBySlug()` — all entity access goes through here                                                                                     |
| [`src/types/entity.ts`](src/types/entity.ts)           | `Entity` interface — every field from Airtable/JSON                                                                                                                                   |
| [`src/lib/entityAliases.ts`](src/lib/entityAliases.ts) | Slug alias resolution for URL canonicalization                                                                                                                                        |
| [`src/lib/styles.ts`](src/lib/styles.ts)               | Tailwind class strings grouped by layout level (header → filters → layout → organ/category/subcategory sections → chip → modal) — visual tweaks belong here, not inline in components |
| [`public/un-entities.json`](public/un-entities.json)   | Authoritative entity data — never edit manually; always regenerate via scripts                                                                                                        |
| [`src/components/ui/`](src/components/ui/)             | shadcn/ui base components — **do not edit directly**                                                                                                                                  |

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
uv run python/verification/verify_links.py
```

- install and update packages in `package.json` via CLI not file edits (pnpm only — never npm or yarn)
- **No test framework in this repo.** Verification = `pnpm typecheck` + `pnpm lint` + exercising the running dev server with `agent-browser` (below).
- Routine dependency, pnpm, and shadcn/ui maintenance commands live in [docs/MAINTENANCE.md](docs/MAINTENANCE.md).

> **Before any Next.js work**, read the relevant doc in `node_modules/next/dist/docs/` ([AGENTS.md](AGENTS.md) rule) — this is Next.js 16 and training data lags the bundled docs.

> The `main` branch only handles the website and its data pipeline (Airtable → JSON).

**Python tooling uses `uv`** (not pip/venv). Never run Python scripts with plain `python`.

**Required `.env` variables** (Python scripts read these via `python-dotenv`):

```
# from https://airtable.com/create/tokens
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_ID=
```

## Agent Tooling (Development Only)

Set up per the Next.js [AI agents guide](https://nextjs.org/docs/app/guides/ai-agents). None of it is a runtime dependency — it doesn't affect the static export, CI, or the deployed site.

**Framework knowledge comes from the bundled docs** (`node_modules/next/dist/docs/`, version-matched to the installed `next`), not from skills. On the installed Next that block is **generated and re-added by `next dev`** (`node_modules/next/dist/server/lib/generate-agent-files.js`), so keep project-specific instructions **outside** the `BEGIN`/`END` markers and commit the regenerated block with your work rather than reverting it.

### Next.js MCP — `next-devtools`

Next.js 16 ships a built-in MCP endpoint at `/_next/mcp` inside the dev server. [`.mcp.json`](.mcp.json) registers the [`next-devtools-mcp`](https://github.com/vercel/next-devtools-mcp) bridge that discovers it ([guide](https://nextjs.org/docs/app/guides/mcp), mirrored at `node_modules/next/dist/docs/01-app/02-guides/mcp.md`).

**`pnpm dev` must be running** — the bridge proxies to the live dev server; with nothing on the port, tool calls come back empty.

- Prefer `get_errors` over asking what broke, or over running a full `pnpm build` just to surface a failure.
- Browser `console.*` output reaches the dev terminal via `logging.browserToTerminal` in [next.config.ts](next.config.ts); the same stream is on disk at `.next/dev/logs/next-development.log`.
- `.next/dev/lock` holds the running dev server's `pid`, `port`, and `appUrl` — **read it and reuse that server** instead of starting a second one (Next 16.3+ additionally makes a second `next dev` print the existing URL and PID rather than spawning a duplicate).
- The server is **project-scoped** in `.mcp.json`. A newly registered server only loads in a fresh agent session.

### Browser automation — `agent-browser`

[vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) — the browser's view (DOM, console, network, Web Vitals) as structured text. Installed **globally** (`npm i -g agent-browser`), deliberately not a `package.json` dependency.

**Start here:** `agent-browser skills get core --full` — the usage guide ships version-matched with the CLI; read it instead of guessing commands from `--help`. `agent-browser skills list` shows specialized ones (`dogfood` for exploratory testing, etc.).

```bash
agent-browser open http://localhost:3000 --enable react-devtools
agent-browser snapshot                     # accessibility tree with @refs (best for agents)
agent-browser read                         # agent-readable page text
agent-browser console / errors             # client-side logs and page errors
agent-browser click <sel|@ref>             # interact
agent-browser react tree|inspect <id>|suspense   # component tree (needs the flag above)
agent-browser a11y                         # axe-core audit
agent-browser screenshot out.png           # visual check
agent-browser close --all                  # tear down sessions
```

Verify UI changes against the running dev server rather than reasoning about JSX alone. Since **all interactive state lives in URL params** (see below), any view opens directly instead of being clicked into:

```bash
agent-browser open "http://localhost:3000/?q=unicef&organs=GA&entity=unicef"
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

- `chipDisplayNames` — display-label overrides for chips whose visible text differs from the internal `entity` id
- `externalLinkEntities` — entities that open an external URL instead of the modal
- `affiliatedEntities` — child entities that sort after (and render as a lighter shade of) a parent entity, with a `subtitle` shown in the hover tooltip (e.g., UNCDF/UNV/UNOSSC after UNDP)
- `hideCategoryForOrgan` — hide category/subcategory for dual-organ entities in specific sections (key format: `"ENTITY|Principal Organ"`)
- `principalOrganConfigs` — colors, labels, and links for each UN principal organ section
- `featureFlags` — staged UI behind a single switch; currently `contribute: false`, which gates the `/contribute` page, its header link, and the modal's contribute affordance
- `placeholderEntities` — **display-only fake cards** (e.g., "Working Groups") not in Airtable/DB, merged into the entity list at runtime in `entities.ts`. Use these for group link cards pointing to external index pages.

## Styling Conventions

Design language: **clean, modern, minimal**. When adding or editing UI, follow these principles:

- **Font**: Always use Roboto (loaded via `next/font/google`). Never introduce other typefaces.
- **Alignment**: Default to left-aligned text; center-align only for standalone UI elements (e.g., empty states, icons). Maintain consistent, equal spacing between elements.
- **Visual hierarchy**: Use font weight, size, uppercase, and color to create clear hierarchy. Respect margins — don't crowd elements.
- **Color**: UN Blue (`#009edb`, `--color-un-blue`) is the primary brand color. Principal organ sections each have a dedicated pastel + dark pair defined as CSS variables in [`src/app/globals.css`](src/app/globals.css) and mirrored in `principalOrganConfigs` in `constants.ts` — always use these tokens, never hardcode hex values in components. Example pairs:
  - Yellow: `--color-un-system-yellow` / `--color-un-system-yellow-dark`
  - Blue: `--color-un-system-blue` / `--color-un-system-blue-dark`
- **Tailwind v4**: Use Tailwind utility classes. Custom theme tokens (e.g., `bg-un-blue`, `text-un-system-yellow`) are registered in `globals.css` under `@theme` and are available as Tailwind classes.
- **No focus rings**: Global CSS removes all focus outlines (`outline: none`) — do not re-introduce them.

## Component Conventions

- **All interactive components are `"use client"`** — the project doesn't use React Server Components for UI
- **`components/ui/`** — shadcn/ui primitives; use `npx shadcn@latest diff` to check for upstream updates
- Entity cards use `entity.entity` (acronym) as the React `key`, not an ID field
- `parseUnPrincipalOrgan()` in `entities.ts` normalizes Airtable's inconsistent array/string/JSON-string formats on load — always expect `string[] | null` downstream
- **Import alias**: `@/` resolves to `src/` — e.g., `import { Entity } from "@/types/entity"`, `import { cn } from "@/lib/utils"`
- **`src/lib/utils.ts`**: shared helpers — `cn()` (clsx + twMerge), `createEntitySlug()`, `getCssColorVar()`, `normalizePrincipalOrgan()` — prefer these over ad-hoc implementations

## Python Data Pipeline

Scripts run in numbered order via `./update_data.sh`:

| Script                        | Input                           | Output                                                               |
| ----------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| `01-fetch_from_airtable.py`   | Airtable API                    | `data/input/input_entities.csv`                                      |
| `02-process_entities_data.py` | `data/input/input_entities.csv` | `public/un-entities.{json,csv,xlsx}`, `public/un-entities-meta.json` |
| `03-download_headshots.py`    | entity data                     | `public/images/headshots/`                                           |

Not part of `update_data.sh`:

- `python/validate_data.py` — data sanity checks
- `python/verification/verify_links.py [--screenshots]` — writes `public/entity_link_verification_results.json`, which the dev-only page [`/dev/entity_link`](src/app/dev/entity_link/page.tsx) renders as a sortable table
- `python/data_collection/`, `python/organs/` — one-off enrichment helpers, not in the nightly path

`un-entities-meta.json` carries `last_updated`; the date only advances when the JSON content actually changed ([02-process_entities_data.py](python/02-process_entities_data.py) lines 162–177), so an unchanged Airtable pull leaves the displayed date alone.

## Automation & CI (`.github/workflows/`)

| Workflow                            | Trigger                                                  | Effect                                                                                 |
| ----------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `fetch_data_from_airtable.yml`      | Nightly 05:00 UTC (midnight NY) + manual                 | `uv sync --frozen`, runs scripts 01 + 02, **commits regenerated data files to `main`** |
| `deploy_nextjs_to_github_pages.yml` | Push to `main`, completion of the fetch workflow, manual | Builds the static export and deploys to GitHub Pages                                   |
| `verify_entity_links.yml`           | Mondays 10:00 UTC + manual                               | Runs `verify_links.py` and commits the results JSON                                    |

Airtable credentials live in GitHub repository secrets (`AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID`).

Because a bot commits `public/un-entities.json` to `main` every night, hand-edits to that file are silently overwritten and can conflict with bot commits — always regenerate through the Python scripts.

## PostgreSQL Database — Separate Branch

PostgreSQL ingestion lives on the **`database` branch**. The `main` branch does not interact with Azure PostgreSQL. For DB-related work, switch to the `database` branch.

## Build & Deploy

Production site is a **static export** (`out/`) deployed to **GitHub Pages**. `pnpm build` runs `next build` then `node scripts/encrypt-site.js` — the encrypt step is **pre-release only** (password-protects the staging build) and will be removed before public launch.

@AGENTS.md
