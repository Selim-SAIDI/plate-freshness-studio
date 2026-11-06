import { getIngredient } from "@/lib/ingredients";
import { clamp } from "@/lib/random";
import type { DoorState, SensorReading, SensorSource } from "./types";

/**
 * Hidden characteristics of a simulated dish. `spoilage` is unknown to the
 * scoring logic — it only shapes the fake sensor signals, the same way a real
 * dish's condition would shape real sensor signals.
 */
export interface DishProfile {
  perishability: number;
  spoilage: number;
  baseWeightG: number;
}

export function createDishProfile(
  ingredientIds: string[],
  rand: () => number = Math.random,
): DishProfile {
  const items = ingredientIds.map(getIngredient).filter((i) => i !== undefined);
  const perishability = items.length
    ? items.reduce((s, i) => s + i.perishability, 0) / items.length
    : 0.3;
  const spoilage = clamp(rand() * 0.5 + perishability * rand() * 0.55, 0, 1);
  const baseWeightG = items.reduce((s, i) => s + i.weightG, 0) || 120;
  return { perishability, spoilage, baseWeightG };
}

const noise = (rand: () => number, amp: number) => (rand() - 0.5) * 2 * amp;

/** One simulated reading at a given test progress (0–1). */
export function sampleReading(
  profile: DishProfile,
  progress: number,
  door: DoorState,
  timestamp: number,
  rand: () => number = Math.random,
): SensorReading {
  const s = profile.spoilage;
  const open = door === "open";
  const temperatureC = 3.6 + s * 7.5 + progress * s * 1.4 + noise(rand, 0.12) + (open ? 2.2 : 0);
  const humidityPct = clamp(52 + s * 26 + progress * 3 + noise(rand, 0.7) - (open ? 6 : 0), 0, 100);
  const gasBase = 265 - s * 175;
  const gasResistanceKOhm = Math.max(
    5,
    gasBase * (1 - progress * s * 0.32) + noise(rand, 2.5) + (open ? 35 : 0),
  );
  const weightG = Math.max(0, profile.baseWeightG * (1 - progress * 0.004) + noise(rand, 0.35));
  return { timestamp, temperatureC, humidityPct, gasResistanceKOhm, weightG, door };
}

/** Generates a full series at once (used for demo history). */
export function simulateSeries(
  profile: DishProfile,
  startTs: number,
  durationSec: number,
  samples: number,
  rand: () => number,
): SensorReading[] {
  const out: SensorReading[] = [];
  for (let i = 0; i < samples; i++) {
    const p = samples === 1 ? 1 : i / (samples - 1);
    out.push(sampleReading(profile, p, "closed", startTs + p * durationSec * 1000, rand));
  }
  return out;
}

/** Live simulated source: emits a reading every `intervalMs`. */
export class SimulatedSensorSource implements SensorSource {
  readonly kind = "simulated" as const;
  readonly isSimulated = true;
  private listeners = new Set<(r: SensorReading) => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private door: DoorState = "closed";
  private progress = 0;

  constructor(
    private profile: DishProfile,
    private intervalMs = 500,
  ) {}

  async connect() {
    if (this.timer) return;
    this.emit();
    this.timer = setInterval(() => this.emit(), this.intervalMs);
  }

  disconnect() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  subscribe(listener: (r: SensorReading) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setDoor(state: DoorState) {
    this.door = state;
    this.emit();
  }

  setProgress(progress: number) {
    this.progress = clamp(progress, 0, 1);
  }

  private emit() {
    const r = sampleReading(this.profile, this.progress, this.door, Date.now());
    this.listeners.forEach((l) => l(r));
  }
}
