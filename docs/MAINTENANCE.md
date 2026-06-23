# Maintenance Guide

Routine maintenance tasks for the UN Morning Briefings app.

## 1. Update pnpm itself

pnpm is pinned via `"packageManager"` in `package.json`. Corepack manages the install.

```bash
corepack up
```

This updates the pin in `package.json` and installs the new version. Also update the version reference in `CLAUDE.md`.

## 2. Audit and fix vulnerabilities

```bash
pnpm audit
pnpm audit --fix
```

`--fix` auto-updates packages to the minimum non-vulnerable version. Review the diff before committing — it may bump minor or patch versions outside your explicit ranges.

## 3. Update packages

### Check what's outdated

```bash
pnpm outdated
```

### Safe updates (patch + minor, respects semver ranges)

```bash
pnpm update
```

### Update everything to latest (including major bumps)

> **Caution with majors:** `lucide-react`, `typescript`, `eslint`, and `@types/node` have had breaking changes in recent major versions. Test the build after updating these.

```bash
pnpm update --latest
```

### Update a single package

```bash
pnpm update next --latest
pnpm update lucide-react --latest
```

### After any update — verify nothing broke

```bash
pnpm tsc --noEmit
pnpm build
pnpm lint
```

## 4. shadcn/ui components

### Check for updates to existing components

```bash
npx shadcn@latest diff
```

Shows a diff of every installed component against the current upstream registry version. Run this before adding new components so you're building on fresh primitives.

### Apply updates to a specific component

```bash
npx shadcn@latest diff <component-name>   # preview diff
npx shadcn@latest add <component-name>    # overwrite with latest
```

> **Warning:** adding overwrites the file — any local edits are lost. shadcn components in `src/components/ui/` should not be edited directly; compose on top so overwrites are safe.

### Add a new component

```bash
npx shadcn@latest add <component-name>
```

## 5. Format

```bash
pnpm format          # write changes
pnpm format:check    # CI-safe dry run (exits non-zero if unformatted)
```

Uses Prettier with `prettier-plugin-tailwindcss` (auto-sorts Tailwind classes).
