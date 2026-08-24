import { describe, expect, it } from "vitest";
import { getEntityBySlug, searchEntities } from "@/lib/entities";
import { isEntityAlias, resolveEntityAlias } from "@/lib/entityAliases";

describe("getEntityBySlug", () => {
  it("resolves a known slug, case-insensitively", () => {
    expect(getEntityBySlug("unicef")?.entity).toBe("UNICEF");
    expect(getEntityBySlug("UNICEF")?.entity).toBe("UNICEF");
  });

  it("returns null for an unknown slug", () => {
    expect(getEntityBySlug("nosuchthing")).toBeNull();
  });

  it("returns null, not a throw, on malformed percent-encoding", () => {
    // ?entity=%E0%A4%A makes decodeURIComponent raise URIError; the guard added
    // alongside the EntityModalHandler fix must turn that into a plain miss.
    expect(() => getEntityBySlug("%E0%A4%A")).not.toThrow();
    expect(getEntityBySlug("%E0%A4%A")).toBeNull();
  });
});

describe("alias resolution", () => {
  it("resolves RCS to DCO", () => {
    expect(isEntityAlias("RCS")).toBe(true);
    expect(resolveEntityAlias("RCS")).toBe("dco");
    expect(resolveEntityAlias("rcs")).toBe("dco");
  });

  it("passes a non-alias through unchanged", () => {
    expect(isEntityAlias("unicef")).toBe(false);
    expect(resolveEntityAlias("unicef")).toBe("unicef");
  });
});

describe("searchEntities", () => {
  it("matches on entity code", () => {
    expect(searchEntities("unicef").map((e) => e.entity)).toContain("UNICEF");
  });

  it("matches on alias", () => {
    // Also broken today: getEntities routes alias search through parseEntityAliases.
    expect(searchEntities("RCS").map((e) => e.entity)).toContain("DCO");
  });
});
