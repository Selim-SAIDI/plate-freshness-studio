import type { DoorState, SensorReading, SensorSource } from "./types";

/**
 * PLANNED — not implemented. No hardware connection exists yet.
 *
 * Expected JSON payload from the ESP32-WROOM-32 firmware, either from
 * `GET {baseUrl}/api/readings/latest` (REST) or as WebSocket messages:
 *
 * {
 *   "ts": 1730900000000,
 *   "ds18b20": { "temp_c": 4.2 },
 *   "bme680": { "humidity": 61.3, "gas_kohm": 212.5 },
 *   "hx711": { "weight_g": 431.0 },
 *   "reed": { "closed": true }
 * }
 */
export interface Esp32Payload {
  ts: number;
  ds18b20: { temp_c: number };
  bme680: { humidity: number; gas_kohm: number };
  hx711: { weight_g: number };
  reed: { closed: boolean };
}

export function parseEsp32Payload(p: Esp32Payload): SensorReading {
  const door: DoorState = p.reed.closed ? "closed" : "open";
  return {
    timestamp: p.ts,
    temperatureC: p.ds18b20.temp_c,
    humidityPct: p.bme680.humidity,
    gasResistanceKOhm: p.bme680.gas_kohm,
    weightG: p.hx711.weight_g,
    door,
  };
}

/** Placeholder so the UI can list the option; connecting always fails until firmware exists. */
export class Esp32SensorSource implements SensorSource {
  readonly isSimulated = false;
  constructor(
    readonly kind: "esp32-rest" | "esp32-websocket",
    readonly endpoint: string,
  ) {}
  async connect(): Promise<void> {
    throw new Error("ESP32 integration is not available yet. Use the simulated sensors.");
  }
  disconnect() {}
  subscribe() {
    return () => {};
  }
}
