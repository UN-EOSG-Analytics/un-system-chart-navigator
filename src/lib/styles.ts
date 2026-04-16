/**
 * Centralized styling constants for the UN System Chart Navigator.
 *
 * Organized by component/layout level so visual adjustments happen in one place.
 * All values are Tailwind utility class strings consumed via `className={...}`.
 *
 * Hierarchy:
 *   appHeader → filterControls → layout
 *   organSection → categorySection → subcategorySection
 *   entityChip | entityCard
 *   entityModal
 */

// ─── Application header (fixed top bar) ────────────────────────────────────

export const appHeader = {
  /** Outer fixed strip */
  bar: "fixed top-0 right-0 left-0 z-40 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 md:px-10 lg:px-12 xl:px-16",
  /** Inner max-width row */
  inner:
    "mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3",
  /** Bold portion of "System Chart" */
  titleBold:
    "text-[1.25rem] leading-none font-bold tracking-[-0.05em] text-slate-950 transition-colors group-hover:text-un-blue sm:text-[1.8rem]",
  /** Light portion of "Navigator" */
  titleLight:
    "text-[1.25rem] leading-none font-light tracking-[-0.05em] text-slate-950 transition-colors group-hover:text-un-blue sm:text-[1.8rem]",
  /** "Preview" badge chip */
  previewBadge:
    "self-start cursor-default rounded border border-un-blue/30 bg-un-blue/8 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-widest text-un-blue uppercase",
};

// ─── Filter controls bar (fixed below header) ───────────────────────────────

export const filterControls = {
  /** Outer fixed gradient bar */
  bar: "fixed top-14 right-0 left-0 z-30 bg-linear-to-b from-white from-55% to-transparent px-4 pt-3 pb-10 sm:px-6 md:px-10 lg:px-12 xl:px-16",
  /** Inner flex row */
  inner: "mx-auto flex w-full max-w-7xl items-center gap-2 lg:gap-2",
  /** Shared base for icon/text toggle buttons (expand-all, PDF link) */
  iconButton:
    "relative flex h-10 shrink-0 touch-manipulation items-center gap-2 rounded-lg border px-3 text-sm transition-colors",
  /** Active / selected state for icon buttons */
  iconButtonActive: "border-un-blue bg-white text-un-blue hover:bg-un-blue/5",
  /** Inactive / default state for icon buttons */
  iconButtonInactive:
    "border-slate-300 bg-white text-slate-400 hover:border-un-blue hover:text-un-blue",
};

// ─── Page layout ─────────────────────────────────────────────────────────────

export const layout = {
  /** Horizontal page padding — matches header and filter bar */
  pagePadding: "px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16",
  /** Max-width centring container */
  maxWidth: "mx-auto w-full max-w-7xl",
  /** Vertical gap between principal organ sections */
  organSectionSpacing: "space-y-4 sm:space-y-5",
  /** Empty-state wrapper */
  emptyState: "py-20 text-left",
  /** Empty-state message text */
  emptyStateText: "text-lg text-gray-500",
};

// ─── Principal Organ section ──────────────────────────────────────────────────

export const organSection = {
  /** Entrance animation on the outer wrapper */
  wrapper: "animate-in fade-in slide-in-from-bottom-4",
  /** Clickable heading strip (border-color set inline via CSS var) */
  headingRow:
    "group flex items-start border-l-[6px] bg-white/10 px-3 py-2 select-none sm:px-3.5 sm:py-2.5",
  /** h2 — principal organ name (e.g. "General Assembly") */
  title:
    "text-base leading-tight font-bold text-black uppercase sm:text-[1.25rem] md:text-[1.45rem]",
  /** h3 — optional section sub-heading (e.g. Charter article link) */
  subtitle:
    "text-sm leading-tight font-semibold text-gray-500 sm:text-[15px] md:text-base",
  /** Collapse/expand icon button wrapper (absolute positioned) */
  collapseButtonWrapper: "absolute top-3 right-3 sm:top-3.5 sm:right-3.5",
  /** Collapse/expand icon button */
  collapseButton:
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-gray-700 shadow-[0_6px_14px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-[transform,box-shadow] duration-200 group-hover:scale-110 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]",
  /** Left accent border on the content area */
  contentBorder: "border-l-[6px]",
  /** Content area padding */
  content: "px-3 pb-3 sm:px-3.5 sm:pb-4",
  /** Vertical spacing between category subsections */
  categorySpacing: "space-y-2.5",
  /** Chip row when section is collapsed (tighter gap) */
  collapsedChipRow: "flex flex-wrap gap-0.75 sm:gap-1",
  /** Chip row when skipCategoryLayer is set (slightly looser) */
  skipCategoryChipRow: "flex flex-wrap gap-1 sm:gap-1.5",
};

// ─── Category section (h2 within a principal organ) ──────────────────────────

export const categorySection = {
  /** Default category header — most organs */
  header: "mb-1.5 text-sm font-medium text-gray-500 sm:text-base",
  /** Compact variant — enabled per-organ via `smallCategoryHeaders` config */
  headerSmall: "mb-1 text-xs font-normal text-gray-500 sm:text-sm",
};

// ─── Subcategory section (h3 nested within a category) ───────────────────────

export const subcategorySection = {
  /** Outer wrapper — adds top spacing to separate from previous sibling */
  wrapper: "mt-2",
  /** h3 subcategory label */
  header: "mb-1 text-xs font-normal text-gray-400 sm:text-sm",
};

// ─── Entity chip (small round pill shown in EntitiesContainer) ───────────────

export const entityChip = {
  /**
   * Standard chip — used in expanded category views (EntitiesContainer).
   * Color classes (`customBgColor`, `customTextColor`) are applied separately.
   */
  base: "tracking-0 cursor-pointer rounded-full px-3 py-1.25 text-[11px] leading-none font-medium shadow-[0_3px_8px_rgba(0,0,0,0.03)] hover:scale-[1.05] hover:shadow-[0_6px_14px_rgba(0,0,0,0.12)] hover:brightness-90 sm:px-3.5 sm:py-1.5 sm:text-xs",
  /**
   * Bordered chip variant — used in collapsed organ preview rows.
   * Slightly smaller padding and adds a faint border.
   */
  withBorder:
    "tracking-0 cursor-pointer rounded-full border border-black/10 px-2.5 py-1 text-[10px] leading-none font-medium shadow-[0_3px_8px_rgba(0,0,0,0.03)] hover:scale-[1.05] hover:shadow-[0_6px_14px_rgba(0,0,0,0.12)] hover:brightness-90 active:scale-95 active:opacity-70 sm:px-3 sm:py-1.25 sm:text-[11px]",
  /** Flex row that wraps chips */
  container: "flex flex-wrap gap-1 sm:gap-1.5",
};

// ─── Entity card (rectangular card in expanded grid) ─────────────────────────

export const entityCard = {
  /** Base button styles shared by all cards */
  base: "flex h-8.5 w-full animate-in cursor-pointer touch-manipulation flex-col items-start rounded-lg px-2.5 text-left fade-in slide-in-from-bottom-4 hover:scale-105 hover:shadow-md active:scale-100 sm:h-9.5",
  /** Vertical alignment when name fits on one line (≤22 chars) */
  positionNormal: "justify-start py-1.5 sm:py-2",
  /** Vertical alignment when name wraps (>22 chars) */
  positionLong: "justify-center py-1 sm:py-1.5",
  /** Primary name text — single-line */
  nameNormal:
    "-mt-px text-xs leading-3.75 font-medium sm:text-sm sm:leading-3.75",
  /** Primary name text — long / wrapping */
  nameLong:
    "text-[11px] leading-[1.05] text-balance font-medium sm:text-[13px]",
  /** Footnote superscript */
  footnote: "ml-0.5 text-[9px] sm:text-[10px]",
  /** Affiliated-entity or custom subtitle below the name */
  subtitle: "text-[8px] leading-tight text-gray-600 opacity-80 sm:text-[9px]",
};

// ─── Entity modal (slide-over panel) ─────────────────────────────────────────

export const entityModal = {
  /** Fixed backdrop */
  backdrop:
    "fixed inset-0 z-50 flex items-center justify-end bg-black/50 transition-all duration-300 ease-out",
  /** Side panel */
  panel:
    "h-full w-full bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-2/3 sm:min-w-100 md:w-1/2 lg:w-1/3 lg:min-w-125",
  /** Sticky header bar inside the panel */
  header: "relative border-b border-gray-200 px-6 py-4",
  /** Small entity acronym label above the title (e.g. "UNICEF") */
  acronym: "text-xs font-semibold tracking-widest text-gray-400 uppercase",
  /** Full entity name title (h2) */
  title: "text-2xl leading-tight font-bold text-gray-900",
  /** Section sub-headers inside the modal ("Overview", "Links", "Socials") */
  subHeader:
    "mb-3 text-sm font-semibold tracking-widest text-gray-700 uppercase",
  /** Field label above a value ("Headquarters", "Principal Organ") */
  fieldLabel: "text-xs font-medium tracking-widest text-gray-400 uppercase",
  /** Pill badge (used for leadership level, tags) */
  badge:
    "inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800",
  /** Clickable link row (website, socials, reports, etc.) */
  linkItem:
    "-ml-1 flex touch-manipulation items-center gap-3 rounded-lg py-2 pr-3 pl-2 text-un-blue transition-opacity duration-200 hover:bg-un-blue/10",
  /** Scrollable body content area */
  body: "space-y-6 px-5 pt-4 pb-6 sm:px-7 sm:pt-5 sm:pb-8",
};
