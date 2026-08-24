import { describe, expect, it } from "vitest";
import {
  createEntitySlug,
  naturalCompareEntities,
  normalizePrincipalOrgan,
  parseEntityAliases,
} from "@/lib/utils";

describe("parseEntityAliases", () => {
  it("parses the legacy Airtable list-literal form", () => {
    expect(parseEntityAliases("['RCS','UNDCO']")).toEqual(["RCS", "UNDCO"]);
  });

  it("parses a bare value (current cell_format='string' output)", () => {
    // Regression test for the dead-alias bug: the pipeline emits "RCS", not "['RCS']".
    expect(parseEntityAliases("RCS")).toEqual(["RCS"]);
  });

  it("parses a comma-delimited multi-select", () => {
    expect(parseEntityAliases("RCS, UNDCO")).toEqual(["RCS", "UNDCO"]);
  });

  it("returns [] for absent or blank values", () => {
    expect(parseEntityAliases(null)).toEqual([]);
    expect(parseEntityAliases(undefined)).toEqual([]);
    expect(parseEntityAliases("")).toEqual([]);
    // Truthy, so it survives the guard: JSON.parse throws, the split yields
    // [""], and filter(Boolean) drops it. Pinning intent, not the accident.
    expect(parseEntityAliases("   ")).toEqual([]);
  });

  it("does not invent an alias from a JSON literal", () => {
    // "null" parses successfully to a non-array; without the early return in
    // the try block, the text fallback would yield a bogus ["null"].
    expect(parseEntityAliases("null")).toEqual([]);
    expect(parseEntityAliases("[]")).toEqual([]);
  });
});

describe("createEntitySlug", () => {
  it.each([
    ["UNICEF", "unicef"],
    ["UN-Women", "un-women"],
    ["World Bank Group", "world-bank-group"],
    ["UN_Habitat", "un-habitat"],
    ["  UNRWA  ", "unrwa"],
  ])("%s -> %s", (input, expected) => {
    expect(createEntitySlug(input)).toBe(expected);
  });
});

describe("normalizePrincipalOrgan", () => {
  it("wraps scalars, passes arrays through, nulls out empties", () => {
    expect(normalizePrincipalOrgan("Secretariat")).toEqual(["Secretariat"]);
    expect(
      normalizePrincipalOrgan(["General Assembly", "Security Council"]),
    ).toEqual(["General Assembly", "Security Council"]);
    expect(normalizePrincipalOrgan([])).toBeNull();
    expect(normalizePrincipalOrgan(null)).toBeNull();
  });
});

describe("naturalCompareEntities", () => {
  it("ignores punctuation when ordering", () => {
    // Compares "unwomen" / "unrwa" / "unicef" — hyphen stripped before localeCompare.
    expect(["UN-Women", "UNRWA", "UNICEF"].sort(naturalCompareEntities)).toEqual(
      ["UNICEF", "UNRWA", "UN-Women"],
    );
  });
});
