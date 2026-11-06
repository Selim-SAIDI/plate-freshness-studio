/**
 * Hardware-agnostic sensor contracts.
 *
 * The UI only talks to a `SensorSource`. Today the only implementation is the
 * simulator; a future ESP32-WROOM-32 source (REST polling or WebSocket) must
 * implement the same interface and emit the same `SensorReading` shape.
 *
 * Sensor mapping on the planned hardware:
 *  - temperatureC       → DS18B20
 *  - humidityPct        → BME680
 *  - gasResistanceKOhm  → BME680 (VOC proxy: lower resistance ≈ more VOCs)
 *  - weightG            → HX711 load-cell amplifier
 *  - door               → reed switch on the box door
 */

export type DoorState = "open" | "closed";

export interface SensorReading {
  /** Unix epoch, ms */
  timestamp: number;
  temperatureC: number;
  humidityPct: number;
  gasResistanceKOhm: number;
  weightG: number;
  door: DoorState;
}

export type SensorSourceKind = "simulated" | "esp32-rest" | "esp32-websocket";

export interface SensorSource {
  readonly kind: SensorSourceKind;
  /** True whenever readings are not coming from physical sensors. */
  readonly isSimulated: boolean;
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(listener: (reading: SensorReading) => void): () => void;
  /** Simulator-only: on real hardware the door state comes from the reed switch. */
  setDoor?(state: DoorState): void;
  /** Simulator-only: lets the simulation drift values as the test progresses (0–1). */
  setProgress?(progress: number): void;
}
