# Contributing to UN System Chart Navigator

Thank you for your interest in contributing to the UN System Chart Navigator! This guide will help you understand the project structure and development workflow.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) (for [Next.js](https://nextjs.org/docs))
- Python with [`uv`](https://docs.astral.sh/uv/getting-started/installation/) package manager
- [Git](https://git-scm.com/)

### Initial Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/kleinlennart/un-system-chart-navigator.git
   cd un-system-chart-navigator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (for data fetching):

   ```bash
   cp .env.example .env
   # Add your Airtable API credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── src/
│   ├── app/                    # Next.js pages and routes
│   ├── components/             # React components
│   │   └── ui/                 # shadcn/ui components (don't edit)
│   ├── lib/
│   │   ├── constants.ts        # Configuration hub
│   │   ├── entities.ts         # Data loading and filtering
│   │   └── utils.ts            # Helper functions
│   └── types/
│       └── entity.ts           # TypeScript definitions
├── public/
│   ├── un-entities.json        # Entity data (generated)
│   └── images/                 # Static assets
├── python/                     # Data processing scripts
└── data/                       # Raw and processed data
```

**Key Files:**
- [`src/lib/constants.ts`](src/lib/constants.ts) - Configuration hub
- [`src/lib/entities.ts`](src/lib/entities.ts) - Data loading and filtering
- [`src/lib/utils.ts`](src/lib/utils.ts) - Helper functions
- [`src/types/entity.ts`](src/types/entity.ts) - TypeScript definitions
- [`src/app/globals.css`](src/app/globals.css) - Global styles and theme

## Development Guidelines

### Code Style

- **TypeScript**: Use strict type checking
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS v4 utility classes
- **Colors**: Use theme colors from [`src/app/globals.css`](src/app/globals.css)
- **Imports**: Absolute paths with `@/` prefix

### Documentation Standards

1. **JSDoc Comments**: All functions should have JSDoc documentation

   ```typescript
   /**
    * Brief description of what the function does.
    *
    * @param paramName - Description of parameter
    * @returns Description of return value
    */
   ```

2. **Inline Comments**: Explain "why", not "what"
   - Good: `// Handle dual-organ entities with split background gradient`
   - Bad: `// Loop through organs`

3. **Component Props**: Document interfaces
   ```typescript
   /**
    * Props for the ComponentName component.
    */
   interface ComponentProps {
     /** Description of what this prop controls */
     propName: string;
   }
   ```

### Naming Conventions

- **Components**: PascalCase (`EntityCard.tsx`)
- **Functions**: camelCase (`getEntityBySlug`)
- **Constants**: UPPER_SNAKE_CASE or camelCase for objects
- **Files**: kebab-case for utilities, PascalCase for components
- **CSS Classes**: Tailwind utilities (no custom classes)

### Adding New Features

1. **Configuration First**: Add settings to [`src/lib/constants.ts`](src/lib/constants.ts)
2. **Types Second**: Define TypeScript interfaces in [`src/types/`](src/types/)
3. **Utilities Third**: Create helpers in [`src/lib/utils.ts`](src/lib/utils.ts)
4. **Components Last**: Build UI components using established patterns

### Working with Data

#### Updating Entity Data

1. Make changes in Airtable
2. Run the data update process:

   **Option A: Using VS Code Task**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Tasks: Run Task"
   - Select "Update Data"

   **Option B: Manual Terminal Command**

   ```bash
   bash update_data.sh
   ```

3. Verify the output in [`public/un-entities.json`](public/un-entities.json)
4. Commit the updated JSON file

#### Adding New Fields

1. Add the field in Airtable
2. Update `selected_columns` in [`python/01-fetch_from_airtable.py`](python/01-fetch_from_airtable.py)
3. Update the `Entity` interface in [`src/types/entity.ts`](src/types/entity.ts)
4. Process and export with [`update_data.sh`](update_data.sh)

### Component Development

#### Using shadcn/ui

- Base components live in `src/components/ui/`
- **Never edit these directly**
- Create wrapper components in `src/components/` instead

Example:

```tsx
// ✅ Good: Composition
import { Button } from '@/components/ui/button';

export function CustomButton({ children }) {
  return <Button variant="outline">{children}</Button>;
}

// ❌ Bad: Editing ui/button.tsx directly
```

### Testing

#### Manual Testing

- Test on different screen sizes (mobile, tablet, desktop)
- Verify filter and search functionality
- Check modal interactions and external links

#### Type Checking

```bash
npx tsc --noEmit
```

#### Linting

```bash
npm run lint
```

### Git Workflow

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes with descriptive commits:

   ```bash
   git commit -m "add utility function"
   ```

3. Push and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

## Maintenance Tasks

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies (respects semver ranges)
npm update

# Update specific package
npm update <package-name>

# Interactive update to latest versions
npx npm-check-updates -i

# Update all to latest (use with caution)
npx npm-check-updates -u
npm install
```

### Checking Tool Versions

```bash
# Check shadcn/ui version
npx shadcn --version

# Check Next.js version
npx next --version

# Check for shadcn/ui component updates
npx shadcn@latest diff
```

### Styling and Theme

Global styles are defined in [`src/app/globals.css`](src/app/globals.css):

- **Custom Colors**: UN System color palette defined in `@theme`
- **CSS Variables**: Runtime-accessible colors with light/dark variants
- **Animations**: Keyframe definitions for corner logo animations
- **Global Utilities**: Scrollbar behavior, focus ring removal, etc.

When adding new colors:

1. Add to the `@theme` block for Tailwind usage
2. Add as CSS custom properties in `:root` for runtime access
3. Include dark mode variants if needed (e.g., `--color-name-dark`)

## Deployment

The site deploys automatically to GitHub Pages when changes are pushed to `main`:

1. GitHub Actions runs `npm run build`
2. Static files are exported and published
3. Available at https://systemchart.un.org via CNAME

## Getting Help

- Check existing documentation and resourcesØ in `/docs`
- Review code comments and JSDoc
- Look at similar implementations in the codebase
- Open an issue for questions or bugs

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All functions have JSDoc documentation
- [ ] TypeScript types are properly defined
- [ ] No console.log statements (except intentional)
- [ ] Components are responsive
- [ ] Configuration is in [`constants.ts`](src/lib/constants.ts)
- [ ] Utilities are in [`utils.ts`](src/lib/utils.ts)
- [ ] Tests pass (`npm run lint`, `npx tsc --noEmit`)
- [ ] Changes work with static export

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Thank you for contributing to making the UN System more accessible and understandable!
