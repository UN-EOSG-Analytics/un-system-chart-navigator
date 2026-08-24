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

- check typescript version bump
    - tsconfig options
    - Tooling that imports the compiler API?
- check ESLint 9 → 10 -- NOPE!- 

- check - Experiments (use with caution): ✓ optimizeCss

---

# ISSUES

- The redirect effect is inert — kept it with a comment recording exactly that, since it becomes live again if the EntityGrid clobber is fixed.
- Hydration mismatch in EntitiesGrid/FilterControls, from getInitialSearch() reading window.location.search during useState init. Not in this component's tree.

Two notes: loading={false} makes EntityModal's skeleton branches (lines 261, 297) unreachable — dead code now, but removing them means changing EntityModal's props.

