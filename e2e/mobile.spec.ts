import { devices, expect, test } from "@playwright/test";

// Mobile readiness regressions, pinned against the real static export in out/.
// Every assertion here corresponds to a defect found by measuring the rendered
// page under touch emulation — see the notes on each case.
//
// Deliberately NOT `test.use(devices["iPhone 12"])`: a device descriptor also
// carries defaultBrowserType: "webkit", which would pull a browser the repo
// doesn't install (locally or in CI). The viewport/touch/UA fields below are the
// parts that matter for these assertions, and chromium honours all of them.
const { userAgent } = devices["iPhone 12"];

test.use({
  userAgent,
  viewport: { width: 390, height: 664 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

const ROUTES = ["/", "/about/", "/methodology/"];

test.describe("no horizontal overflow", () => {
  for (const route of ROUTES) {
    test(`${route} fits the viewport at every phone width`, async ({
      page,
    }) => {
      // 320 is the narrowest width worth supporting (iPhone SE 1st gen / small
      // Android); 430 is the widest phone. A page that overflows at any of these
      // gives the user a sideways-scrolling chart.
      for (const width of [320, 360, 375, 393, 430]) {
        await page.setViewportSize({ width, height: 780 });
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        const { scrollWidth, innerWidth, offenders } = await page.evaluate(
          () => ({
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            offenders: [...document.querySelectorAll("*")]
              .filter((el) => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && r.right > window.innerWidth + 1;
              })
              .slice(0, 5)
              .map(
                (el) =>
                  `${el.tagName}.${String(el.className).slice(0, 60)}`,
              ),
          }),
        );

        expect(
          scrollWidth,
          `${route} at ${width}px overflows; offenders: ${offenders.join(", ")}`,
        ).toBeLessThanOrEqual(innerWidth);
      }
    });
  }
});

test("search input is >=16px so iOS Safari does not zoom on focus", async ({
  page,
}) => {
  // Safari auto-zooms the whole page when a focused input renders below 16px,
  // which strands the user at a zoomed-in scroll offset after they dismiss the
  // keyboard. The control is text-base on mobile and only drops to sm:text-sm.
  await page.goto("/");
  const fontSize = await page
    .locator("#entity-search")
    .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(16);
});

test("header menu button accepts a tap outside its visual box", async ({
  page,
}) => {
  // The visual button stays 34px by design; an `after:` pseudo-element supplies
  // the iOS-HIG-minimum hit area without shifting layout. Asserted behaviourally
  // — a tap 4px clear of the border box must still open the menu — so the case
  // survives a refactor from pseudo-element to padding.
  await page.goto("/");
  const menu = page.locator("[aria-label='Open menu']");
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();

  await page.touchscreen.tap(box!.x - 4, box!.y + box!.height / 2);
  await expect(page.getByRole("menuitem", { name: "About" })).toBeVisible();
});

test("expanded hit areas do not overlap a neighbouring control", async ({
  page,
}) => {
  // `after:-inset-1.5` grows a target in all four directions, so a control with
  // a close neighbour can end up stealing its taps. Share sits directly beside
  // Close in the modal header; their regions must stay disjoint.
  await page.goto("/?entity=unicef");
  await expect(page.locator("div[class*='shadow-2xl']")).toBeVisible();

  const overlaps = await page.evaluate(() => {
    const boxes = [
      ...document.querySelectorAll(
        "[class*='shadow-2xl'] button, [class*='shadow-2xl'] a",
      ),
    ]
      .filter((el) => el.getBoundingClientRect().top < 120)
      .map((el) => {
        const r = el.getBoundingClientRect();
        // Mirror the `after:-inset-1.5` expansion when the element declares it.
        const grow =
          getComputedStyle(el, "::after").top === "-6px" ? 6 : 0;
        return {
          label: el.getAttribute("aria-label") ?? el.textContent?.trim(),
          left: r.left - grow,
          right: r.right + grow,
          top: r.top - grow,
          bottom: r.bottom + grow,
        };
      });

    return boxes.flatMap((a, i) =>
      boxes
        .slice(i + 1)
        .filter(
          (b) =>
            a.right > b.left &&
            b.right > a.left &&
            a.bottom > b.top &&
            b.bottom > a.top,
        )
        .map((b) => `${a.label} <-> ${b.label}`),
    );
  });

  expect(overlaps).toEqual([]);
});

test("chips clear WCAG 2.5.8's 24px target-spacing exception", async ({
  page,
}) => {
  // Chips are 20px tall — under the 24x24 minimum — so they rely on the spacing
  // exception: a 24px circle centred on each target must not reach another's
  // centre. At the old 3px collapsed-row gap the nearest pair sat 23px apart and
  // missed it by 1px. This is the guard on that 1px.
  await page.goto("/");
  const minCentreDistance = await page.evaluate(() => {
    const centres = [
      ...document.querySelectorAll("button[aria-label^='View details']"),
    ]
      .filter((el) => (el as HTMLElement).offsetParent !== null)
      .slice(0, 120)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });

    let min = Infinity;
    for (let i = 0; i < centres.length; i++) {
      for (let j = i + 1; j < centres.length; j++) {
        const d = Math.hypot(
          centres[i].x - centres[j].x,
          centres[i].y - centres[j].y,
        );
        if (d < min) min = d;
      }
    }
    return min;
  });

  expect(minCentreDistance).toBeGreaterThanOrEqual(24);
});

test("search results stay reachable with the keyboard open", async ({
  page,
}) => {
  // ~148px of the viewport is fixed chrome. With a software keyboard raised the
  // visible strip shrinks to roughly 320px, and a result rendered under the
  // chrome would force the user to dismiss the keyboard to see what they typed
  // matched. 390x320 is the keyboard-open proxy (CDP cannot raise a real one).
  await page.setViewportSize({ width: 390, height: 320 });
  await page.goto("/");
  await page.locator("#entity-search").fill("unicef");

  const result = await page.evaluate(() => {
    const input = document
      .querySelector("#entity-search")!
      .getBoundingClientRect();
    const chip = [
      ...document.querySelectorAll("button[aria-label^='View details']"),
    ].filter((el) => (el as HTMLElement).offsetParent !== null)[0];
    if (!chip) return null;
    const r = chip.getBoundingClientRect();
    return {
      inputVisible: input.top >= 0 && input.bottom <= window.innerHeight,
      chipBelowChrome: r.top > input.bottom,
      chipOnScreen: r.bottom <= window.innerHeight,
    };
  });

  expect(result).not.toBeNull();
  expect(result).toMatchObject({
    inputVisible: true,
    chipBelowChrome: true,
    chipOnScreen: true,
  });
});

test("entity chips are tappable and open the modal", async ({ page }) => {
  await page.goto("/");
  // `:visible` matters here — collapsed previews render their non-PDF chips as
  // `hidden sm:block`, so the first chip in DOM order is not on screen at phone
  // widths and the DOM-order .first() would be an unclickable element.
  const chip = page
    .locator("button[aria-label^='View details']:visible")
    .first();
  await expect(chip).toBeVisible();
  await expect(chip).toHaveCSS("touch-action", "manipulation");

  await chip.tap();
  await expect(page).toHaveURL(/entity=/);
  // The hover tooltip must not linger over the modal after a tap.
  await expect(page.locator("[role='tooltip']")).toHaveCount(0);
});

test("modal scrolls to its end and contains its overscroll", async ({
  page,
}) => {
  await page.goto("/?entity=unicef");
  const panel = page.locator("div[class*='shadow-2xl']").first();
  await expect(panel).toBeVisible();

  // overscroll-contain keeps a flick at the end of the panel from chaining into
  // the page behind it (and from triggering Android pull-to-refresh).
  await expect(panel).toHaveCSS("overscroll-behavior", "contain");

  const reachedEnd = await panel.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    return el.scrollTop >= el.scrollHeight - el.clientHeight - 1;
  });
  expect(reachedEnd).toBe(true);
});

test("modal closes by tapping the close button", async ({ page }) => {
  await page.goto("/?entity=unicef");
  await page.locator("button[aria-label='Close modal']").tap();
  await expect(page.locator("div[class*='shadow-2xl']")).toHaveCount(0);
});

for (const route of ["/about/", "/methodology/"]) {
  test(`${route} back link meets the 44px touch minimum`, async ({ page }) => {
    await page.goto(route);
    const box = await page
      .locator("a", { hasText: "Back to Chart" })
      .first()
      .boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
}
