import { formatNumber, formatPercent } from "./format";

describe("formatNumber", () => {
  it("groups thousands", () => {
    expect(formatNumber(1000)).toBe("1,000");
  });

  it("does not truncate to 32-bit integers", () => {
    expect(formatNumber(2147483648)).toBe("2,147,483,648");
  });

  it("returns an em dash for non-finite input", () => {
    expect(formatNumber(NaN)).toBe("—");
    expect(formatNumber(Infinity)).toBe("—");
    expect(formatNumber(undefined)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("renders a fraction as a whole percent", () => {
    expect(formatPercent(0.2)).toBe("20%");
    expect(formatPercent(0.5)).toBe("50%");
  });

  it("returns an em dash for missing input", () => {
    expect(formatPercent(null)).toBe("—");
  });
});
