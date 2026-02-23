# [systemchart.un.org](https://systemchart.un.org)

An interactive explorer for the United Nations System, making all UN entities, their leadership, and resources easily discoverable.

## Overview

This project provides a visual, searchable interface to navigate the UN System Chart. Users can explore entities by principal organ, search by name, and access comprehensive information about each organization.

### Key Features

- **Interactive Filtering**: Filter entities by UN Principal Organ (General Assembly, Security Council, etc.)
- **Full-Text Search**: Search across entity name and aliases
- **Detailed Entity Cards**: View descriptions, leadership, mandates, and organizational links
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Static Site**: Deployed to GitHub Pages for fast, reliable access

## Resources

- https://www.un.org/en/delegate/page/un-system-chart
- https://www.un.org/un80-initiative/en/shifting-paradigms-1

## Project Architecture

### Tech Stack

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

### Directory Structure

```
├── src/
│   ├── app/                    # Next.js app router pages
│   ├── components/             # React components
│   │   └── ui/                 # shadcn/ui base components (don't edit directly)
│   ├── lib/
│   │   ├── constants.ts        # All configuration and settings
│   │   ├── entities.ts         # Entity data loading and filtering
│   │   └── utils.ts            # Helper functions
│   └── types/
│       └── entity.ts           # TypeScript type definitions
├── public/
│   ├── un-entities.json        # Processed entity data
│   └── images/                 # Logos and headshots
├── python/                     # Data fetching and processing scripts
├── data/                       # Raw and processed data files
└── docs/                       # Project documentation
```

**Key Files:**

- [`src/lib/constants.ts`](src/lib/constants.ts) - All configuration and settings
- [`src/lib/entities.ts`](src/lib/entities.ts) - Entity data loading and filtering
- [`src/lib/utils.ts`](src/lib/utils.ts) - Helper functions
- [`src/types/entity.ts`](src/types/entity.ts) - TypeScript type definitions
- [`src/app/globals.css`](src/app/globals.css) - Global styles and theme colors

### Data Flow

1. **Fetch**: [`python/01-fetch_from_airtable.py`](python/01-fetch_from_airtable.py) retrieves entity data from Airtable
2. **Process**: [`python/02-process_entities_data.py`](python/02-process_entities_data.py) cleans and enriches data → outputs `public/un-entities.json`
3. **Load**: [`src/lib/entities.ts`](src/lib/entities.ts) imports JSON at build time (no runtime API calls)
4. **Render**: Components consume pre-filtered entity arrays
5. **Push** *(optional)*: [`python/04-push_to_postgres.py`](python/04-push_to_postgres.py) syncs entity list to Azure PostgreSQL (read by other UN apps)

### Design Principles

- **Global Configuration**: All settings centralized in [`src/lib/constants.ts`](src/lib/constants.ts)
- **Component Composition**: shadcn/ui base components in `components/ui/`, custom compositions in `src/components/`
- **Type Safety**: Comprehensive TypeScript types for all entity data
- **Static Generation**: All pages pre-rendered for optimal performance
- **Utility-First**: Reusable helper functions in [`src/lib/utils.ts`](src/lib/utils.ts)

## Dev & Deploy

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Run Development Server**

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`.

3. **Build for Production**

   ```bash
   pnpm build
   ```

   Outputs a static export to `out/`. Note: the build currently also runs a password-protection step (`scripts/encrypt-site.js`) for pre-release staging — this will be removed before public launch.

4. **Type check / Lint / Format**

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm format
   ```

## Data

Entity data is fetched from Airtable and processed with Python scripts. **Never edit `public/un-entities.json` manually** — always regenerate via scripts.

### Quick Update

You can run the data update process in VS Code using the built-in task:

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Tasks: Run Task"
3. Select "Update Data"

Or run manually:

```bash
./update_data.sh
```

This runs scripts 01 and 02 in sequence (Airtable fetch → process → `public/un-entities.json`).

| Script                        | Input                           | Output                                              |
| ----------------------------- | ------------------------------- | --------------------------------------------------- |
| `01-fetch_from_airtable.py`   | Airtable API                    | `data/input/input_entities.csv`                     |
| `02-process_entities_data.py` | `data/input/input_entities.csv` | `public/un-entities.json`, `public/un-entities.csv` |
| `03-download_headshots.py`    | entity data                     | `public/images/headshots/`                          |
| `04-push_to_postgres.py`      | `data/output/entities.csv`      | Azure PostgreSQL `systemchart.entities`             |

Scripts 03 and 04 are optional and run separately:

```bash
uv run python/03-download_headshots.py [--force]
uv run python/04-push_to_postgres.py              # push to shared Azure PostgreSQL
uv run python/04-push_to_postgres.py --allow-delete  # also remove deleted entities (caution)
```

> ⚠️ `04-push_to_postgres.py` writes to a shared Azure PostgreSQL database read by other UN applications. Do not rename columns or use `--allow-delete` without checking downstream dependencies.

### Python Environment

- Uses `uv` for package management — never run scripts with plain `python`
- Run scripts with: `uv run python/<script>.py`
- Install packages with: `uv add <package>`

## GitHub Actions

- **Daily Data Fetch**: Automated data updates at 00:00 UTC
- **Continuous Deploy**: Automatic deployment to GitHub Pages on push to main

## Maintenance

### Code Quality

```bash
pnpm lint
pnpm typecheck
```

### Updating Dependencies

```bash
pnpm outdated
pnpm update
npx shadcn@latest diff  # check for shadcn/ui component updates
```

### Formatting

```bash
pnpm format
```

### Styling

Global styles and Tailwind CSS configuration are in [`src/app/globals.css`](src/app/globals.css):

- Custom color palette (UN System colors)
- CSS custom properties for runtime color access
- Animation keyframes
- Global utility styles

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information on how to get started.

To suggest updates or additions to entity data, use the [contribution form](https://systemchart.un.org/contribute/) or the edit button available on each entity's page. Submissions will be submitted to our Airtable database for peer-review.

## Development Guidelines

- **Package manager**: Use `pnpm`. Never use `npm` or `yarn`.
- **Tailwind CSS v4**: Use Tailwind utility classes. Custom theme tokens (e.g., `bg-un-blue`) are defined in [`src/app/globals.css`](src/app/globals.css) under `@theme`.
- **Colors**: Always use CSS variable tokens — never hardcode hex values in components.
- **Components**: Keep `components/ui/` files unchanged; compose on top in `src/components/`.
- **Configuration**: Add all display/behaviour settings to [`src/lib/constants.ts`](src/lib/constants.ts).
- **Utilities**: Place helper functions in [`src/lib/utils.ts`](src/lib/utils.ts).
- **Static-First**: No server-side logic. Everything must work as a static export on GitHub Pages.

## Read more

See the Wiki [here](https://github.com/UN-EOSG-Analytics/un-system-chart-navigator/wiki).