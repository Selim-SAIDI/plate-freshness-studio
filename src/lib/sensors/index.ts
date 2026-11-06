import { Esp32SensorSource } from "./esp32";
import { SimulatedSensorSource, type DishProfile } from "./simulator";
import type { SensorSource, SensorSourceKind } from "./types";

export * from "./types";
export { createDishProfile, type DishProfile } from "./simulator";

/**
 * Single entry point the UI uses to obtain readings. When ESP32 firmware is
 * ready, implement `Esp32SensorSource` and this factory is the only switch.
 */
export function createSensorSource(
  kind: SensorSourceKind,
  profile: DishProfile,
  endpoint = "",
): SensorSource {
  if (kind === "simulated") return new SimulatedSensorSource(profile, 500);
  return new Esp32SensorSource(kind, endpoint);
}
