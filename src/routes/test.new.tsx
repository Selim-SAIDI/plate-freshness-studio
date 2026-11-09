import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { StepTracker, type FlowPhase } from "@/components/test-flow/step-tracker";
import { DishBuilder } from "@/components/test-flow/dish-builder";
import { PrepareStage } from "@/components/test-flow/prepare-stage";
import { ClosingStage } from "@/components/test-flow/closing-stage";
import { AnalysisStage } from "@/components/test-flow/analysis-stage";
import { autoPosition, type PlacedItem } from "@/components/test-flow/plate";
import { TestReport } from "@/components/test-report";
import { addTest, useSettings, useTests } from "@/lib/store";
import { computeFreshness } from "@/lib/freshness";
import { createDishProfile, type DishProfile, type SensorReading } from "@/lib/sensors";
import type { FreshnessTest } from "@/lib/types";

export const Route = createFileRoute("/test/new")({
  validateSearch: (s: Record<string, unknown>): { from?: string } => {
    const from = s["from"];
    return typeof from === "string" ? { from } : {};
  },
  head: () => ({
    meta: [
      { title: "Create a New Test — Smart Food Box" },
      { name: "description", content: "Build your dish on the plate, seal it in the Smart Food Box and run a sensor-based freshness estimate." },
      { property: "og:title", content: "Create a New Test — Smart Food Box" },
      { property: "og:description", content: "Interactive dish builder and animated Smart Box sensor analysis." },
    ],
  }),
  component: NewTestPage,
});

function NewTestPage() {
  const { from } = Route.useSearch();
  const navigate = useNavigate();
  const tests = useTests();
  const settings = useSettings();

  const [phase, setPhase] = useState<FlowPhase>("compose");
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [dishName, setDishName] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [profile, setProfile] = useState<DishProfile | null>(null);
  const [result, setResult] = useState<FreshnessTest | null>(null);
  const prefilled = useRef(false);
  const durationSec = duration ?? settings.measurementDurationSec;

  useEffect(() => {
    if (prefilled.current || !from) return;
    const t = tests.find((x) => x.id === from);
    if (!t) return;
    prefilled.current = true;
    setDishName(t.dishName);
    setItems(t.ingredients.map((id, i) => ({ uid: `pre-${i}`, ingredientId: id, ...autoPosition(i), rot: ((i * 37) % 40) - 20 })));
  }, [from, tests]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [phase]);

  const name = dishName.trim() || "Custom dish";

  const handleComplete = (readings: SensorReading[], doorOpenings: number) => {
    const r = computeFreshness(readings, doorOpenings);
    const start = readings[0]?.timestamp ?? Date.now();
    setResult({
      id: `t-${Date.now().toString(36)}`,
      dishName: name,
      ingredients: items.map((i) => i.ingredientId),
      createdAt: new Date().toISOString(),
      durationSec,
      score: r.score,
      category: r.category,
      subscores: r.subscores,
      averages: r.averages,
      gasDropPct: r.gasDropPct,
      doorOpenings,
      series: readings
        .filter((_, i) => i % Math.max(1, Math.floor(readings.length / 60)) === 0)
        .map((x) => ({
          t: Math.round((x.timestamp - start) / 100) / 10,
          temperatureC: x.temperatureC,
          humidityPct: x.humidityPct,
          gasResistanceKOhm: x.gasResistanceKOhm,
          weightG: x.weightG,
        })),
      source: "simulated",
      simulated: true,
    });
    setPhase("results");
  };

  const reset = () => {
    setItems([]);
    setDishName("");
    setResult(null);
    setProfile(null);
    setPhase("compose");
  };

  const save = () => {
    if (!result) return;
    addTest(result);
    toast.success("Results validated and saved", { description: `${result.dishName} · score ${result.score}` });
    navigate({ to: "/history/$id", params: { id: result.id } });
  };

  return (
    <div>
      {phase === "compose" && (
        <PageHeader
          eyebrow="Freshness lab"
          title={
            <>
              Create a <span className="text-gradient">New Test</span>
            </>
          }
          description="Compose the dish you want to evaluate. Drag ingredients from the pantry onto the plate."
        />
      )}
      <StepTracker phase={phase} />

      {phase === "compose" && (
        <DishBuilder
          items={items}
          onItemsChange={setItems}
          dishName={dishName}
          onDishNameChange={setDishName}
          onStart={() => setPhase("prepare")}
        />
      )}

      {phase === "prepare" && (
        <PrepareStage
          items={items}
          dishName={name}
          durationSec={durationSec}
          onDurationChange={setDuration}
          onBack={() => setPhase("compose")}
          onContinue={() => setPhase("closing")}
        />
      )}

      {phase === "closing" && (
        <ClosingStage
          items={items}
          onStartAnalysis={() => {
            setProfile(createDishProfile(items.map((i) => i.ingredientId)));
            setPhase("analyzing");
          }}
        />
      )}

      {phase === "analyzing" && profile && (
        <AnalysisStage
          items={items}
          profile={profile}
          durationSec={durationSec}
          onComplete={handleComplete}
          onCancel={() => {
            toast("Test cancelled");
            setPhase("prepare");
          }}
        />
      )}

      {phase === "results" && result && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-up">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Step 4 · Freshness results</p>
              <h1 className="text-3xl font-semibold md:text-4xl">{result.dishName}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={reset}>
                <Trash2 /> Discard
              </Button>
              <Button variant="glass" onClick={() => setPhase("prepare")}>
                <RotateCcw /> Re-run test
              </Button>
              <Button variant="hero" size="lg" className="rounded-xl" onClick={save}>
                <CheckCircle2 /> Validate and Save Results
              </Button>
            </div>
          </div>
          <TestReport test={result} unit={settings.temperatureUnit} />
        </div>
      )}
    </div>
  );
}
