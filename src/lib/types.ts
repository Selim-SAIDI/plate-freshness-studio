import type { FreshnessCategory } from "@/lib/freshness";
import type { SensorSourceKind } from "@/lib/sensors/types";

export interface SeriesPoint {
  /** seconds since test start */
  t: number;
  temperatureC: number;
  humidityPct: number;
  gasResistanceKOhm: number;
  weightG: number;
}

export interface FreshnessTest {
  id: string;
  dishName: string;
  ingredients: string[];
  createdAt: string;
  durationSec: number;
  score: number;
  category: FreshnessCategory;
  subscores: { temperature: number; humidity: number; gas: number };
  averages: { temperatureC: number; humidityPct: number; gasResistanceKOhm: number; weightG: number };
  gasDropPct: number;
  doorOpenings: number;
  series: SeriesPoint[];
  source: SensorSourceKind;
  simulated: boolean;
}

export interface AppSettings {
  measurementDurationSec: number;
  sensorSource: SensorSourceKind;
  esp32Endpoint: string;
  temperatureUnit: "C" | "F";
}
