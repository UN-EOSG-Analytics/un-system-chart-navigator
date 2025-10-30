- use Next.js v15.4 (https://nextjs.org/docs)
- ALWAYS use code for Tailwind CSS v4
  - make sure to consult https://tailwindcss.com/docs/ to update your knowledge since many things that you think would work are actually outdated
- if you want to test run, use `npm run dev`
- use `shadcn/ui` components (https://ui.shadcn.com/docs/components)
  - install via `npx shadcn@latest add`
- follow best practices for UI/UX and web development
- use colors from `globals.css` integrated into Tailwind CSS theme
- make sure to understand the general api and page structure before making singular changes
- do not create parallel infrastructures, prefer global solutions, do not hardcode things where it would be hard to find.
- always keep in mind that this site is deployed as a static page on GitHub Pages
- do not repeat helper functions, instead put them into `src/lib/utils.ts` and import

## Python
- always use `uv run python` to run scripts
- avoid lots of print statements and summaries
- always install packages with `uv add`
