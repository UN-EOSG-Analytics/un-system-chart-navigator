# TODO

- check review border for OLA
- add llms.txt
- fix the about and methodology page headers
- add feedback button

## Nice to Have

- [ ] **Add OG image**
      The `openGraph.images` block in `layout.tsx` is commented out. Create an OG image (`public/images/og-image.png`, 1200×630) and uncomment the config for social sharing previews.

- improve SEO, add keywords?


## Dev

- fix excel generation, 

- check typescript version bump
    - tsconfig options
    - Tooling that imports the compiler API?
- check ESLint 9 → 10 -- NOPE!- 

- check - Experiments (use with caution): ✓ optimizeCss

---

# ISSUES

- The redirect effect is inert — kept it with a comment recording exactly that, since it becomes live again if the EntityGrid clobber is fixed.
- Hydration mismatch in EntitiesGrid/FilterControls, from getInitialSearch() reading window.location.search during useState init. Not in this component's tree.
    - Possibly fixed: `getInitialSearch()` no longer exists, and EntityGrid now applies URL params after mount. Re-check in dev, then remove this item.
- `next-dev-loop` skill exists twice, byte-identical: `.claude/skills/next-dev-loop/SKILL.md` and `.agents/skills/next-dev-loop/SKILL.md`. Update both together. It is vendored from next.js `v16.4.5` while the installed `next` is 16.3.2, so local edits get lost on re-sync.
- CLAUDE.md points at `python/02-process_entities_data.py` "lines 162–177" for the `last_updated` logic. Accurate today, but it drifts with any edit to that script. Reference the block by its comment instead.

Two notes: loading={false} makes EntityModal's skeleton branches (lines 261, 297) unreachable — dead code now, but removing them means changing EntityModal's props.

