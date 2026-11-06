import { clamp } from "@/lib/random";
import type { SensorReading } from "@/lib/sensors/types";

/**
 * EXPERIMENTAL freshness estimate derived from environmental sensor readings.
 * This is NOT a certified food-safety assessment and must never be presented
 * as proof that food is safe to eat.
 */

export type FreshnessCategory = "good" | "moderate" | "attention";

export const CATEGORY_THRESHOLDS = { good: 70, moderate: 45 } as const;

/** Score penalty applied for every time the box door was opened mid-test. */
export const DOOR_OPENING_PENALTY = 4;

export const CATEGORY_LABELS: Record<FreshnessCategory, { label: string; short: string; description: string }> = {
  good: {
    label: "Good estimated freshness",
    short: "Good",
    description: "Sensor readings are consistent with a fresh dish.",
  },
  moderate: {
    label: "Moderate freshness indicators",
    short: "Moderate",
    description: "Some readings drift from typical fresh values. Consider a closer inspection.",
  },
  attention: {
    label: "Freshness indicators requiring attention",
    short: "Attention",
    description: "Several readings suggest reduced freshness. Inspect the dish before any use.",
  },
};

export function categorize(score: number): FreshnessCategory {
  if (score >= CATEGORY_THRESHOLDS.good) return "good";
  if (score >= CATEGORY_THRESHOLDS.moderate) return "moderate";
  return "attention";
}

export interface FreshnessResult {
  score: number;
  category: FreshnessCategory;
  subscores: { temperature: number; humidity: number; gas: number };
  averages: { temperatureC: number; humidityPct: number; gasResistanceKOhm: number; weightG: number };
  gasDropPct: number;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function computeFreshness(readings: SensorReading[], doorOpenings: number): FreshnessResult {
  const closed = readings.filter((r) => r.door === "closed");
  const rs = closed.length ? closed : readings;
  const averages = {
    temperatureC: avg(rs.map((r) => r.temperatureC)),
    humidityPct: avg(rs.map((r) => r.humidityPct)),
    gasResistanceKOhm: avg(rs.map((r) => r.gasResistanceKOhm)),
    weightG: rs.length ? rs[rs.length - 1].weightG : 0,
  };

  const temperature = clamp(100 - Math.max(0, averages.temperatureC - 4) * 7, 0, 100);
  const humidity = clamp(100 - Math.max(0, Math.abs(averages.humidityPct - 60) - 12) * 3, 0, 100);
  const gas = clamp(((averages.gasResistanceKOhm - 60) / (250 - 60)) * 100, 0, 100);

  const first = rs[0]?.gasResistanceKOhm ?? 0;
  const last = rs[rs.length - 1]?.gasResistanceKOhm ?? 0;
  const gasDropPct = first > 0 ? Math.max(0, (first - last) / first) : 0;

  const raw =
    temperature * 0.25 +
    humidity * 0.15 +
    gas * 0.6 -
    gasDropPct * 120 -
    doorOpenings * DOOR_OPENING_PENALTY;
  const score = Math.round(clamp(raw, 0, 100));

  return {
    score,
    category: categorize(score),
    subscores: {
      temperature: Math.round(temperature),
      humidity: Math.round(humidity),
      gas: Math.round(gas),
    },
    averages,
    gasDropPct,
  };
}
