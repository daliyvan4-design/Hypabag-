import { describe, expect, it } from "vitest";
import { formatXof } from "@/lib/format";

const NNBSP = String.fromCharCode(0x202f); // narrow no-break space (U+202F)

describe("formatXof", () => {
  it("groups thousands with a narrow no-break space and appends FCFA", () => {
    expect(formatXof(970000)).toBe(`970${NNBSP}000${NNBSP}FCFA`);
    expect(formatXof(1260000)).toBe(`1${NNBSP}260${NNBSP}000${NNBSP}FCFA`);
    expect(formatXof(500)).toBe(`500${NNBSP}FCFA`);
  });

  it("rounds non-integers", () => {
    expect(formatXof(970000.4)).toBe(`970${NNBSP}000${NNBSP}FCFA`);
  });
});
