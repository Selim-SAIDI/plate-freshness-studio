import { describe, expect, it } from "vitest";
import { categorize, computeFreshness } from "@/lib/freshness";
import type { SensorReading } from "@/lib/sensors/types";

const reading = (gas: number, i: number): SensorReading => ({
  timestamp: i * 1000,
  temperatureC: 4,
  humidityPct: 60,
  gasResistanceKOhm: gas,
  weightG: 300,
  door: "closed",
});

describe("freshness categories", () => {
  it("70 and above is good estimated freshness", () => {
    expect(categorize(70)).toBe("good");
    expect(categorize(100)).toBe("good");
  });
  it("45 to 69 is moderate", () => {
    expect(categorize(69)).toBe("moderate");
    expect(categorize(45)).toBe("moderate");
  });
  it("below 45 requires attention", () => {
    expect(categorize(44)).toBe("attention");
    expect(categorize(0)).toBe("attention");
  });
});

describe("computeFreshness", () => {
  const stable = Array.from({ length: 10 }, (_, i) => reading(200, i));

  it("each door opening lowers the score by 4", () => {
    const base = computeFreshness(stable, 0).score;
    expect(computeFreshness(stable, 2).score).toBe(base - 8);
  });

  it("a falling gas resistance lowers the score", () => {
    const falling = Array.from({ length: 10 }, (_, i) => reading(200 - i * 8, i));
    expect(computeFreshness(falling, 0).score).toBeLessThan(computeFreshness(stable, 0).score);
  });
});
