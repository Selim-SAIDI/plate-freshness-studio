import { useEffect, useMemo, useRef, useState } from "react";
import { Thermometer, Wind, Droplets, Scale, DoorClosed, DoorOpen, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartBox } from "./smart-box";
import type { PlacedItem } from "./plate";
import { CircularProgress, Sparkline } from "@/components/rings";
import { SimulatedBadge } from "@/components/simulated-badge";
import { createSensorSource, type DishProfile, type DoorState, type SensorReading } from "@/lib/sensors";
import { fmtClock } from "@/lib/format";
import { cn } from "@/lib/utils";

const MESSAGES = [
  { at: 0, text: "Initializing sensors..." },
  { at: 0.12, text: "Collecting environmental data..." },
  { at: 0.38, text: "Analyzing gas variations..." },
  { at: 0.66, text: "Evaluating freshness indicators..." },
  { at: 0.9, text: "Preparing your report..." },
];

export function AnalysisStage({
  items,
  profile,
  durationSec,
  onComplete,
  onCancel,
}: {
  items: PlacedItem[];
  profile: DishProfile;
  durationSec: number;
  onComplete: (readings: SensorReading[], doorOpenings: number) => void;
  onCancel: () => void;
}) {
  const source = useMemo(() => createSensorSource("simulated", profile), [profile]);
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [door, setDoor] = useState<DoorState>("closed");
  const [openings, setOpenings] = useState(0);
  const [log, setLog] = useState<{ t: number; text: string }[]>([]);

  const readingsRef = useRef<SensorReading[]>([]);
  const elapsedRef = useRef(0);
  const doorRef = useRef<DoorState>("closed");
  const openingsRef = useRef(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const unsub = source.subscribe((r) => {
      setLatest(r);
      setHistory((h) => [...h.slice(-39), r]);
      if (r.door === "closed" && !doneRef.current) readingsRef.current.push(r);
    });
    source.connect();
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      if (doorRef.current === "closed" && !doneRef.current) {
        elapsedRef.current = Math.min(durationSec, elapsedRef.current + dt);
        source.setProgress?.(elapsedRef.current / durationSec);
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= durationSec) {
          doneRef.current = true;
          setTimeout(() => onCompleteRef.current(readingsRef.current, openingsRef.current), 700);
        }
      }
    }, 100);
    return () => {
      clearInterval(timer);
      unsub();
      source.disconnect();
    };
  }, [source, durationSec]);

  const progress = elapsed / durationSec;
  const msgIdx = MESSAGES.reduce((acc, m, i) => (progress >= m.at ? i : acc), 0);
  const msgText = MESSAGES[msgIdx]?.text ?? "";

  useEffect(() => {
    setLog((l) => (!msgText || l.some((e) => e.text === msgText) ? l : [...l, { t: elapsedRef.current, text: msgText }]));
  }, [msgText]);

  const toggleDoor = () => {
    const next: DoorState = doorRef.current === "closed" ? "open" : "closed";
    doorRef.current = next;
    setDoor(next);
    source.setDoor?.(next);
    if (next === "open") {
      openingsRef.current += 1;
      setOpenings(openingsRef.current);
      setLog((l) => [...l, { t: elapsedRef.current, text: "Door opened — measurement paused" }]);
    } else {
      setLog((l) => [...l, { t: elapsedRef.current, text: "Door closed — resuming measurement" }]);
    }
  };

  const series = (k: keyof Pick<SensorReading, "temperatureC" | "humidityPct" | "gasResistanceKOhm" | "weightG">) =>
    history.map((r) => r[k]);

  const sensors = [
    { icon: Thermometer, name: "Temperature", chip: "DS18B20", value: latest?.temperatureC.toFixed(2), unit: "°C", data: series("temperatureC"), color: "var(--cyan)" },
    { icon: Wind, name: "Gas / VOC", chip: "BME680", value: latest?.gasResistanceKOhm.toFixed(1), unit: "kΩ", data: series("gasResistanceKOhm"), color: "var(--violet)" },
    { icon: Droplets, name: "Humidity", chip: "BME680", value: latest?.humidityPct.toFixed(1), unit: "%RH", data: series("humidityPct"), color: "var(--teal)" },
    { icon: Scale, name: "Weight", chip: "HX711", value: latest?.weightG.toFixed(1), unit: "g", data: series("weightG"), color: "var(--chart-4)" },
  ];

  const isOpen = door === "open";
  const finished = progress >= 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
            Step 3 · Sensor analysis
          </span>
        </div>
        <SimulatedBadge label="Simulated readings — no hardware connected" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="glass flex flex-col items-center gap-6 rounded-[2.5rem] p-6 md:flex-row md:justify-around xl:flex-col">
          <CircularProgress value={progress} size={230}>
            <div>
              <div className="font-mono text-5xl font-semibold tabular-nums">{fmtClock(durationSec - elapsed)}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {finished ? "complete" : isOpen ? "paused" : "remaining"}
              </div>
              <div className="mt-2 font-display text-lg text-primary">{Math.round(progress * 100)}%</div>
            </div>
          </CircularProgress>
          <div className="w-full max-w-sm text-center">
            <p key={isOpen ? "open" : msgIdx} className={cn("text-lg font-semibold animate-fade-up", isOpen && "text-moderate")}>
              {isOpen ? "Door open — close it to resume" : msgText}
              {!isOpen && !finished && <span className="ml-0.5 animate-blink">▍</span>}
            </p>
            <div className="mt-4 flex justify-center gap-1.5">
              {MESSAGES.map((m, i) => (
                <span key={i} className={cn("h-1.5 w-8 rounded-full transition-colors duration-500", i <= msgIdx ? "bg-accent-gradient" : "bg-muted")} />
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <SmartBox items={items} doorOpen={isOpen} plateInside scanning={!isOpen && !finished} className="pb-0" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {sensors.map((s) => (
          <div key={s.name} className="glass rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <s.icon className="size-4" style={{ color: s.color }} />
                {s.name}
              </span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{s.chip}</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums">
              {s.value ?? "--"}
              <span className="ml-1 text-sm text-muted-foreground">{s.unit}</span>
            </p>
            <div className="mt-2">
              <Sparkline data={s.data} color={s.color} />
            </div>
          </div>
        ))}
        <div className={cn("glass rounded-3xl p-4 transition-colors", isOpen ? "border-moderate/40" : "border-fresh/25")}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium">
              {isOpen ? <DoorOpen className="size-4 text-moderate" /> : <DoorClosed className="size-4 text-fresh" />}
              Door status
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">REED</span>
          </div>
          <p className={cn("mt-3 font-mono text-2xl font-semibold", isOpen ? "text-moderate" : "text-fresh")}>
            {isOpen ? "OPEN" : "CLOSED"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Openings: <span className="font-mono text-foreground">{openings}</span>
          </p>
          <Button variant="glass" size="sm" className="mt-2 w-full" onClick={toggleDoor} disabled={finished}>
            {isOpen ? "Close door" : "Open door (simulate)"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="glass rounded-3xl p-4 font-mono text-xs">
          <p className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Terminal className="size-3.5" /> analysis.log
          </p>
          <ul className="max-h-32 space-y-1 overflow-y-auto">
            {log.map((e, i) => (
              <li key={i} className="animate-fade-up">
                <span className="text-muted-foreground">[{fmtClock(e.t)}]</span>{" "}
                <span className={e.text.startsWith("Door") ? "text-moderate" : "text-teal"}>{e.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <Button variant="ghost" className="self-end" onClick={onCancel}>
          <X /> Cancel test
        </Button>
      </div>
    </div>
  );
}
