import { useSyncExternalStore } from "react";
import { generateSeedTests } from "@/lib/seed";
import type { AppSettings, FreshnessTest } from "@/lib/types";

/**
 * Prototype persistence: localStorage. Swap these functions for API calls when
 * a backend exists — components only use the hooks and actions below.
 */

const TESTS_KEY = "sfb.tests.v1";
const SETTINGS_KEY = "sfb.settings.v1";

export const DEFAULT_SETTINGS: AppSettings = {
  measurementDurationSec: 30,
  sensorSource: "simulated",
  esp32Endpoint: "",
  temperatureUnit: "C",
};

type Listener = () => void;

function createStore<T>(key: string, fallback: () => T, serverValue: T) {
  let cache: T | undefined;
  const listeners = new Set<Listener>();

  const read = (): T => {
    if (cache !== undefined) return cache;
    if (typeof window === "undefined") return serverValue;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : fallback();
      if (!raw) window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      cache = fallback();
    }
    return cache;
  };

  const write = (value: T) => {
    cache = value;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: Listener) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  };

  const useValue = () => useSyncExternalStore(subscribe, read, () => serverValue);

  return { read, write, useValue };
}

const EMPTY: FreshnessTest[] = [];
const testsStore = createStore<FreshnessTest[]>(TESTS_KEY, () => generateSeedTests(), EMPTY);
const settingsStore = createStore<AppSettings>(SETTINGS_KEY, () => DEFAULT_SETTINGS, DEFAULT_SETTINGS);

export const useTests = testsStore.useValue;
export const useSettings = settingsStore.useValue;

export function addTest(test: FreshnessTest) {
  testsStore.write([test, ...testsStore.read()]);
}

export function deleteTest(id: string) {
  testsStore.write(testsStore.read().filter((t) => t.id !== id));
}

export function clearTests() {
  testsStore.write([]);
}

export function restoreDemoTests() {
  testsStore.write(generateSeedTests());
}

export function updateSettings(patch: Partial<AppSettings>) {
  settingsStore.write({ ...settingsStore.read(), ...patch });
}
