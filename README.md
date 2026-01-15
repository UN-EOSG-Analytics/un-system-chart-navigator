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

- **Framework**: Next.js(Static Site Generation)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Database**: Airtable API
- **Data Processing**: Python (`uv` for package management)
- **Deployment**: GitHub Pages (static export)

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
2. **Process**: [`python/02-process_entities_data.py`](python/02-process_entities_data.py) cleans and enriches data
3. **Export**: Data saved to [`public/un-entities.json`](public/un-entities.json) for static import
4. **Load**: [`src/lib/entities.ts`](src/lib/entities.ts) imports JSON at build time
5. **Render**: Components consume entity data through filtering functions

### Design Principles

- **Global Configuration**: All settings centralized in [`src/lib/constants.ts`](src/lib/constants.ts)
- **Component Composition**: shadcn/ui base components in `components/ui/`, custom compositions in `src/components/`
- **Type Safety**: Comprehensive TypeScript types for all entity data
- **Static Generation**: All pages pre-rendered for optimal performance
- **Utility-First**: Reusable helper functions in [`src/lib/utils.ts`](src/lib/utils.ts)

## Dev & Deploy

1. **Install Dependencies**  
   Run the following command to install all required dependencies:

   ```bash
   npm install
   ```

2. **Run Development Server**  
   Start the development server with:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

3. **Build for Production**  
   To create a production build, use:
   ```bash
   npm run build
   ```

## Data

Entity data is fetched from Airtable and processed with Python scripts.

### Quick Update

You can run the data update process in VS Code using the built-in task:

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Tasks: Run Task"
3. Select "Update Data"

Or run manually from the terminal:

```shell
bash update_data.sh
```

This [`update_data.sh`](update_data.sh) script:

1. Fetches latest data from Airtable API
2. Processes and enriches entity information
3. Downloads headshots for entity leaders
4. Exports to JSON format for static site

### Python Environment

- Uses `uv` for fast package management
- Run scripts with: `uv run python <script_name>.py`
- Install packages with: `uv add <package_name>`

## GitHub Actions

- **Daily Data Fetch**: Automated data updates at 00:00 UTC
- **Continuous Deploy**: Automatic deployment to GitHub Pages on push to main

## Maintenance

### Code Quality

```bash
npm run lint
npx eslint . --ext .js,.jsx,.ts,.tsx
npx tsc --noEmit
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies to latest versions
npm update

# Update specific package
npm update <package-name>

# Update to latest major versions (use with caution)
npx npm-check-updates -u
npm install
```

### Version Checking

```bash
npx shadcn --version
npx next --version
npx shadcn@latest diff
```

### Formatting

```bash
npm run format
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

- **Tailwind CSS**: Always use Tailwind v4 syntax (consult https://tailwindcss.com/docs/)
- **Colors**: Use colors from [`src/app/globals.css`](src/app/globals.css) integrated into Tailwind CSS theme
- **Components**: Keep shadcn/ui files in `components/ui/` unchanged; compose on top in `src/components/`
- **Configuration**: Add all settings to [`src/lib/constants.ts`](src/lib/constants.ts) for easy maintenance
- **Utilities**: Place helper functions in [`src/lib/utils.ts`](src/lib/utils.ts) for reuse
- **Static-First**: Remember this deploys as a static site on GitHub Pages

## Read more

See the Wiki [here](https://github.com/UN-EOSG-Analytics/un-system-chart-navigator/wiki).