import { createFileRoute } from "@tanstack/react-router";
import { Timer, Cpu, Database, Download, RotateCcw, Trash2, Radio, Wifi, Thermometer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { PageHeader, GlassPanel } from "@/components/page-header";
import { SimulatedBadge } from "@/components/simulated-badge";
import { clearTests, restoreDemoTests, updateSettings, useSettings, useTests } from "@/lib/store";
import { CATEGORY_THRESHOLDS, DOOR_OPENING_PENALTY } from "@/lib/freshness";
import { fmtDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Smart Food Box" },
      { name: "description", content: "Configure measurement duration, sensor source and local test data." },
      { property: "og:title", content: "Settings — Smart Food Box" },
      { property: "og:description", content: "Measurement and sensor configuration for the Smart Food Box." },
    ],
  }),
  component: SettingsPage,
});

const SOURCES = [
  { id: "simulated", label: "Built-in simulator", desc: "Realistic generated readings for all five sensors.", icon: Cpu, available: true },
  { id: "esp32-rest", label: "ESP32 · REST API", desc: "Poll the box over HTTP for the latest readings.", icon: Wifi, available: false },
  { id: "esp32-websocket", label: "ESP32 · WebSocket", desc: "Live stream of readings from the box.", icon: Radio, available: false },
] as const;

const PAYLOAD = `{
  "ts": 1730900000000,
  "ds18b20": { "temp_c": 4.2 },
  "bme680": { "humidity": 61.3, "gas_kohm": 212.5 },
  "hx711": { "weight_g": 431.0 },
  "reed": { "closed": true }
}`;

function SettingsPage() {
  const settings = useSettings();
  const tests = useTests();

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(tests, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smart-food-box-tests-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Configuration" title="Settings" description="Tune the measurement process and manage local prototype data." />

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassPanel title="Measurement" icon={<Timer />}>
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted-foreground">Default analysis duration</p>
            <p className="font-mono text-2xl font-semibold text-primary">{fmtDuration(settings.measurementDurationSec)}</p>
          </div>
          <Slider
            className="mt-4"
            min={10}
            max={180}
            step={5}
            value={[settings.measurementDurationSec]}
            onValueChange={([v]) => updateSettings({ measurementDurationSec: v })}
          />
          <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
            <span>10s</span>
            <span>3m</span>
          </div>

          <p className="mt-6 mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Thermometer className="size-4" /> Temperature unit
          </p>
          <div className="flex gap-2">
            {(["C", "F"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => updateSettings({ temperatureUnit: u })}
                className={cn(
                  "rounded-xl border px-5 py-2 font-mono text-sm transition-all",
                  settings.temperatureUnit === u ? "border-primary/50 bg-primary/15 text-primary" : "bg-muted/40 hover:bg-muted",
                )}
              >
                °{u}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-muted/30 p-4 text-sm">
            <p className="font-semibold">Estimate categories</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>
                <span className="text-fresh">Good estimated freshness</span> · score ≥ {CATEGORY_THRESHOLDS.good}
              </li>
              <li>
                <span className="text-moderate">Moderate indicators</span> · {CATEGORY_THRESHOLDS.moderate}–{CATEGORY_THRESHOLDS.good - 1}
              </li>
              <li>
                <span className="text-attention">Requires attention</span> · below {CATEGORY_THRESHOLDS.moderate}
              </li>
              <li>Each door opening during a test: −{DOOR_OPENING_PENALTY} points</li>
            </ul>
          </div>
        </GlassPanel>

        <GlassPanel title="Sensor source" icon={<Cpu />} action={<SimulatedBadge />}>
          <div className="space-y-2">
            {SOURCES.map((s) => {
              const active = settings.sensorSource === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!s.available}
                  onClick={() => updateSettings({ sensorSource: s.id })}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                    active ? "border-primary/40 bg-primary/10" : "bg-muted/30",
                    !s.available && "cursor-not-allowed opacity-60",
                  )}
                >
                  <span className={cn("grid size-10 place-items-center rounded-xl", active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                    <s.icon className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{s.label}</span>
                    <span className="block text-xs text-muted-foreground">{s.desc}</span>
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", s.available ? "bg-fresh/15 text-fresh" : "bg-muted text-muted-foreground")}>
                    {active ? "Active" : s.available ? "Available" : "Planned"}
                  </span>
                </button>
              );
            })}
          </div>
          <label className="mt-5 block text-sm font-medium" htmlFor="endpoint">
            ESP32 endpoint (for future use)
          </label>
          <Input
            id="endpoint"
            value={settings.esp32Endpoint}
            onChange={(e) => updateSettings({ esp32Endpoint: e.target.value })}
            placeholder="http://192.168.1.50 or ws://smartbox.local/ws"
            className="mt-2 h-10 rounded-xl bg-surface-2/60 font-mono text-sm"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Saved only. No connection is attempted — hardware integration (ESP32-WROOM-32 with DS18B20, BME680, HX711 and
            reed switch) is not available in this prototype.
          </p>
          <details className="mt-4 rounded-2xl bg-surface-2/60 p-3 text-xs">
            <summary className="cursor-pointer font-medium">Expected firmware payload</summary>
            <pre className="mt-2 overflow-x-auto font-mono text-muted-foreground">{PAYLOAD}</pre>
          </details>
        </GlassPanel>
      </div>

      <GlassPanel title="Local data" icon={<Database />}>
        <p className="text-sm text-muted-foreground">
          {tests.length} tests are stored in this browser. Clearing your browser data removes them.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="glass" onClick={exportJson} disabled={!tests.length}>
            <Download /> Export JSON
          </Button>
          <Button
            variant="glass"
            onClick={() => {
              restoreDemoTests();
              toast.success("Demo data restored");
            }}
          >
            <RotateCcw /> Restore demo data
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (window.confirm("Delete all saved tests from this browser?")) {
                clearTests();
                toast("History cleared");
              }
            }}
          >
            <Trash2 /> Clear history
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}
