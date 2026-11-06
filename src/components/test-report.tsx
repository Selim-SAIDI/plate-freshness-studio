import { useState, type ReactNode } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Thermometer, Droplets, Wind, Scale, DoorOpen, Timer, Activity } from "lucide-react";
import { ScoreRing } from "@/components/rings";
import { CategoryBadge, CATEGORY_STYLES } from "@/components/category-badge";
import { Disclaimer } from "@/components/disclaimer";
import { SimulatedBadge } from "@/components/simulated-badge";
import { Plate } from "@/components/test-flow/plate";
import { autoPosition } from "@/components/test-flow/plate";
import { axisProps, GradientDefs, gridProps, tooltipProps } from "@/components/charts";
import { CATEGORY_LABELS } from "@/lib/freshness";
import { getIngredient } from "@/lib/ingredients";
import { fmtDateTime, fmtDuration, fmtTemp } from "@/lib/format";
import type { FreshnessTest } from "@/lib/types";
import { cn } from "@/lib/utils";

const METRICS = [
  { key: "gasResistanceKOhm", label: "Gas resistance", unit: "kΩ", color: "var(--violet)" },
  { key: "temperatureC", label: "Temperature", unit: "°C", color: "var(--cyan)" },
  { key: "humidityPct", label: "Humidity", unit: "%", color: "var(--teal)" },
] as const;

export function TestReport({ test, unit = "C" }: { test: FreshnessTest; unit?: "C" | "F" }) {
  const [metric, setMetric] = useState<(typeof METRICS)[number]["key"]>("gasResistanceKOhm");
  const m = METRICS.find((x) => x.key === metric)!;
  const style = CATEGORY_STYLES[test.category];
  const plateItems = test.ingredients.map((id, i) => ({ uid: `${i}`, ingredientId: id, ...autoPosition(i), rot: (i * 37) % 40 - 20 }));
  const vocLevel = test.averages.gasResistanceKOhm > 180 ? "Low VOC" : test.averages.gasResistanceKOhm > 110 ? "Moderate VOC" : "Elevated VOC";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
        <div className="glass relative flex flex-col items-center overflow-hidden rounded-[2.5rem] p-6 text-center animate-fade-up">
          <div className="pointer-events-none absolute left-1/2 top-24 size-72 -translate-x-1/2 rounded-full blur-3xl" style={{ background: style.stroke, opacity: 0.18 }} />
          <div className="relative flex w-full items-center justify-between text-xs text-muted-foreground">
            <span>{fmtDateTime(test.createdAt)}</span>
            {test.simulated && <SimulatedBadge label="Simulated" />}
          </div>
          <div className="relative mt-4">
            <ScoreRing score={test.score} color={style.stroke} />
          </div>
          <CategoryBadge category={test.category} long className="relative mt-5 px-3 py-1.5 text-sm" />
          <p className="relative mt-3 max-w-xs text-sm text-muted-foreground">{CATEGORY_LABELS[test.category].description}</p>
          <Disclaimer className="relative mt-5 text-left" />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Metric icon={<Thermometer />} label="Temperature" value={fmtTemp(test.averages.temperatureC, unit)} hint="DS18B20 · avg" tone="text-cyan" />
            <Metric icon={<Droplets />} label="Humidity" value={`${test.averages.humidityPct.toFixed(1)}%`} hint="BME680 · avg RH" tone="text-teal" />
            <Metric icon={<Wind />} label="Gas resistance" value={`${test.averages.gasResistanceKOhm.toFixed(0)} kΩ`} hint={`${vocLevel} · −${(test.gasDropPct * 100).toFixed(1)}% drift`} tone="text-violet" />
            <Metric icon={<Scale />} label="Measured weight" value={`${test.averages.weightG.toFixed(0)} g`} hint="HX711 · net" tone="text-moderate" />
            <Metric icon={<DoorOpen />} label="Box openings" value={`${test.doorOpenings}`} hint="Reed switch events" tone={test.doorOpenings ? "text-moderate" : "text-fresh"} />
            <Metric icon={<Timer />} label="Test duration" value={fmtDuration(test.durationSec)} hint="Closed-door time" tone="text-primary" />
          </div>

          <div className="glass rounded-3xl p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <Activity className="size-4 text-primary" /> Sensor timeline
              </h3>
              <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
                {METRICS.map((x) => (
                  <button
                    key={x.key}
                    type="button"
                    onClick={() => setMetric(x.key)}
                    className={cn("rounded-lg px-3 py-1 text-xs font-medium transition-colors", metric === x.key ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground")}
                  >
                    {x.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={test.series} margin={{ left: -12, right: 8, top: 8 }}>
                  <GradientDefs id={`rep-${metric}`} color={m.color} />
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="t" {...axisProps} tickFormatter={(v) => `${v}s`} />
                  <YAxis {...axisProps} domain={["auto", "auto"]} tickFormatter={(v) => Number(v).toFixed(0)} />
                  <Tooltip {...tooltipProps} labelFormatter={(v) => `t = ${v}s`} formatter={(v: number) => [`${v.toFixed(1)} ${m.unit}`, m.label]} />
                  <Area type="monotone" dataKey={metric} stroke={m.color} strokeWidth={2.5} fill={`url(#rep-${metric})`} animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-3xl p-5">
          <h3 className="mb-4 font-semibold">Indicator breakdown</h3>
          <div className="space-y-4">
            <Bar label="Gas / VOC indicator" value={test.subscores.gas} color="var(--violet)" weight="60%" />
            <Bar label="Temperature indicator" value={test.subscores.temperature} color="var(--cyan)" weight="25%" />
            <Bar label="Humidity indicator" value={test.subscores.humidity} color="var(--teal)" weight="15%" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Gas drift and door openings are subtracted from the weighted indicators to form the estimate.
          </p>
        </div>
        <div className="glass flex items-center gap-5 rounded-3xl p-5">
          <Plate items={plateItems} size={150} />
          <div className="min-w-0">
            <h3 className="font-semibold">{test.dishName}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {test.ingredients.map((id, i) => {
                const ing = getIngredient(id);
                return ing ? (
                  <span key={i} className="rounded-full bg-muted/50 px-2 py-0.5 text-xs">
                    {ing.emoji} {ing.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, hint, tone }: { icon: ReactNode; label: string; value: string; hint: string; tone: string }) {
  return (
    <div className="glass rounded-3xl p-4 animate-fade-up">
      <div className={cn("mb-2 [&_svg]:size-5", tone)}>{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-semibold">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function Bar({ label, value, color, weight }: { label: string; value: number; color: string; weight: string }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span>
          {label} <span className="text-xs text-muted-foreground">· weight {weight}</span>
        </span>
        <span className="font-mono">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
