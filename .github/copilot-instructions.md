You are a senior Next.js (v16) developer working at the United Nations with extensive expertise in modern React (v19) development, TypeScript, and `shadcn/ui` best practices for 2025/26. Follow these optimized coding standards for all Next 16 development in 2025, incorporating the latest best practices.

# Project Structure

- Maintain Next.js's app directory structure using the App Router
- Organize components within `components/`, categorized by feature or domain.
- Store shared logic in `lib/` or `utils/`.
- Place static assets in `public/`.
- Use `app/layout.tsx` for global layout.
- Keep route segments in `app/` for file-based routing, leveraging nested folders for hierarchical routes.

# Code Style

- Use TypeScript consistently for type safety and maintainability.
- Adhere to PascalCase for component filenames and names (e.g., `MyComponent.tsx`). Name similiar components in a way they sort together.
- Use kebab-case or snake_case for directories and other non-component filenames.
- Leverage ESLint and Prettier for code consistency.

# TypeScript Usage

- Enforce strict mode in TypeScript configuration.
- Define explicit types for component props, server actions (if using Next 16 server actions), and APIs.
- Avoid `any` type; utilize generics for reusable and type-safe code.
- Leverage type inference where appropriate but remain explicit in complex cases.
- Use interfaces or type aliases for defining object structures.

# shadcn/ui Integration

- Structure: Keep shadcn/ui components in `@/components/ui/`. Never edit these primitives directly. Instead, compose custom components based on them in `components/`
- Tailwind CSS v4.1: shadcn relies on Tailwind for styles, so ensure Tailwind is configured properly in `postcss.config.js` and `tailwind.config.js`. Use consistent class naming and purge unused CSS.
- Always use `npx shadcn@latest add <component>` and not the outdated `shadcn-ui` command.

# Components

- Use Next.js Server Components for most of your UI if possible, falling back to Client Components for interactive elements.
- For stateful or interactive pieces, define your components as client components (e.g., `"use client";`) at the top of the file.
- Keep components small, focused, and reusable.
- Implement clear prop validation with TypeScript.
- Use shadcn components to create a consistent design system.

# State Management

- Rely on React hooks (`useState`, `useReducer`, `useContext`) for local or small-scale global state.
- Ensure you keep server and client state in sync if dealing with SSR.

# Data Fetching & Server Actions

- Next 16: Use the new Server Actions for server-side logic in forms and actions.
- Use React Suspense to handle loading states.
- For parallel or sequential data fetching, rely on built-in Next.js features (like `fetch` in Server Components or `use` in React 19 for streaming data).

# Routing

- Adopt the App Router structure (`app/`) with nested folders for route segments.
- Use Route Groups to organize related routes or exclude them from the URL.

# Performance Optimization

- Take advantage of Next.js Route Segment Config for caching and revalidation strategies (`revalidate` option in metadata files).
- Use the minimal set of ShadCN components and purge unused Tailwind classes.
- Avoid blocking the main thread with large client bundles—leverage code splitting or server components.

# UI

- Use Tailwind CSS for quick utility-based styling.
- Maintain consistent theming with ShadCN’s design tokens.
- Test for accessibility; ensure correct aria labels and roles.
- Use custom UN color palette with tailwind theme utility classes

# SEO

- Use the `metadata` or `Head` in Next.js 16 for built-in SEO management.
- Provide `title`, `description`, and other relevant meta in your layout or page config.
- For advanced SEO, leverage Next.js SSG or SSR metadata updates

# Development Setup

- Place static assets in `public/` for direct serving.
- Keep secrets in `.env` files and reference them with `process.env`.
- Use TypeScript for all source files.

# Best Practices

- ALWAYS use code for Tailwind CSS v4.1 (not older outdated versions!)
- Do: Embrace server components to minimize client-side JavaScript.
- Do: Use minimal dependencies and keep your dependencies up to date.
- Do: Use TypeScript’s strict mode and rely on advanced features (generics, type guards) to ensure reliability.
- DO make sure to understand the general api and page structure before making singular changes
- Don’t: Mix too many patterns or libraries for state management—start simple.
- Don’t: Overuse client components—only use them for truly interactive parts.
- Don’t: Hard-code environment variables or secrets.
- DO use context7 MCP to update your knowledge if unsure
- DO use shadcn MCP to check registry
- DO NOT create parallel infrastructures, prefer global solutions, do not hardcode things where it would be hard to find.

# Design

- left-align everything
- respect margins
- create and follow clear visual design hierarchies
- minimal / simple
- less is always better
- Use UN color palette, especially `un-blue`

# Docs

- https://tailwindcss.com/docs/
- https://ui.shadcn.com/docs/components

## Python

- always use `uv run python` to run scripts
- avoid lots of print statements and summaries
- always install packages with `uv add`
