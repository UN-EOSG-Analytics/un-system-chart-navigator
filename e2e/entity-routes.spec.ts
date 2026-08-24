import { expect, test } from "@playwright/test";

// Every case uses page.goto() rather than clicking between views: cacheComponents
// keeps visited routes mounted via React <Activity>, so a navigated-away route is
// hidden, not unmounted. Assertions use toBeVisible()/toHaveCount(0) for the same
// reason — never a bare toHaveCount(1) on text a hidden route might also contain.

test.describe("?entity= route matrix", () => {
  test("canonical slug renders the entity", async ({ page }) => {
    await page.goto("/?entity=unicef");
    await expect(page.getByText(/United Nations Children/i)).toBeVisible();
    await expect(page.getByText("Entity Not Found")).toHaveCount(0);
  });

  test("entity survives a co-present ?q= and wrong-case slug", async ({
    page,
  }) => {
    // Regression for the set-state-in-effect fix: this rendered "Entity Not Found"
    // before, because the lookup was gated on a URL redirect that never lands.
    await page.goto("/?q=health&entity=UNICEF");
    await expect(page.getByText(/United Nations Children/i)).toBeVisible();
    await expect(page.getByText("Entity Not Found")).toHaveCount(0);
  });

  test("alias resolves to its canonical entity", async ({ page }) => {
    // RCS is DCO's only alias; broken in production until parseEntityAliases
    // was taught to read the bare cell_format="string" form.
    await page.goto("/?entity=rcs");
    await expect(page.getByText("Entity Not Found")).toHaveCount(0);
    await expect(
      page.getByText(/Development Coordination Office/i),
    ).toBeVisible();
  });

  test("malformed percent-encoding is a miss, not a crash", async ({ page }) => {
    await page.goto("/?entity=%E0%A4%A");
    await expect(page.getByText("Entity Not Found")).toBeVisible();
  });

  test("unknown slug renders Not Found", async ({ page }) => {
    await page.goto("/?entity=nosuchthing");
    await expect(page.getByText("Entity Not Found")).toBeVisible();
  });

  test("search box reflects ?q=", async ({ page }) => {
    await page.goto("/?q=health");
    await expect(
      page.getByPlaceholder("Search for UN entities..."),
    ).toHaveValue("health");
  });
});

test.describe("URL params hydrate without mismatching the static HTML", () => {
  // Regression: EntityGrid seeded useState from window.location.search, so the
  // prerendered HTML (no params) disagreed with the first client render and
  // React threw a hydration mismatch. Against out/ that arrives as a minified
  // uncaught pageerror, never a console message — so assert on pageerror.
  for (const url of [
    "/?expand=true",
    "/?entity=unicef&q=unicef&expand=true",
  ]) {
    test(`no page error on ${url}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await page.goto(url);
      await expect(
        page.getByRole("button", { name: "Collapse all sections" }),
      ).toBeVisible();
      expect(pageErrors).toEqual([]);
    });
  }

  test("?expand=true survives the post-hydration URL rewrite", async ({
    page,
  }) => {
    await page.goto("/?entity=unicef&q=unicef&expand=true");
    await expect(page.getByText(/United Nations Children/i)).toBeVisible();
    const search = await page.evaluate(() => window.location.search);
    const params = new URLSearchParams(search);
    expect(params.get("entity")).toBe("unicef");
    expect(params.get("q")).toBe("unicef");
    expect(params.get("expand")).toBe("true");
  });
});
