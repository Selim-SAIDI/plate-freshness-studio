import { ArrowLeft, DoorOpen, Hand, Lock, Timer, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plate, type PlacedItem } from "./plate";
import { getIngredient } from "@/lib/ingredients";
import { fmtDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

const DURATIONS = [15, 30, 60, 90];

export function PrepareStage({
  items,
  dishName,
  durationSec,
  onDurationChange,
  onBack,
  onContinue,
}: {
  items: PlacedItem[];
  dishName: string;
  durationSec: number;
  onDurationChange: (s: number) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const ingredients = items.map((i) => getIngredient(i.ingredientId)).filter((i) => i !== undefined);
  const options = DURATIONS.includes(durationSec) ? DURATIONS : [...DURATIONS, durationSec].sort((a, b) => a - b);
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <div className="glass relative flex flex-col items-center overflow-hidden rounded-[2.5rem] p-8 animate-fade-up">
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/20 blur-3xl" />
        <div className="relative animate-float">
          <Plate items={items} size={300} />
        </div>
        <h2 className="relative mt-6 text-2xl font-semibold">{dishName}</h2>
        <p className="relative mt-2 flex flex-wrap justify-center gap-1.5 text-sm text-muted-foreground">
          {ingredients.map((i, idx) => (
            <span key={idx} className="rounded-full bg-muted/50 px-2 py-0.5 text-xs">
              {i.emoji} {i.name}
            </span>
          ))}
        </p>
      </div>

      <div className="space-y-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-fresh/30 bg-fresh/10 px-3 py-1 text-xs font-semibold text-fresh">
            <PackageCheck className="size-3.5" /> Step 1 · Preparing the test
          </span>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
            Your dish is ready <span className="text-gradient">for analysis</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Place the dish inside the physical Smart Food Box, then confirm below to seal the chamber.
          </p>
        </div>

        <ol className="space-y-3">
          {[
            { icon: DoorOpen, text: "Open the Smart Food Box door" },
            { icon: Hand, text: "Set the dish on the load-cell tray, centered" },
            { icon: Lock, text: "Close the door until the reed switch clicks" },
          ].map((s, i) => (
            <li key={i} className="glass flex items-center gap-4 rounded-2xl p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal/12 text-teal">
                <s.icon className="size-5" />
              </span>
              <span className="text-sm">
                <span className="mr-2 font-mono text-muted-foreground">0{i + 1}</span>
                {s.text}
              </span>
            </li>
          ))}
        </ol>

        <div className="glass rounded-2xl p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Timer className="size-4 text-cyan" /> Measurement duration
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDurationChange(d)}
                className={cn(
                  "rounded-xl border px-4 py-2 font-mono text-sm transition-all",
                  d === durationSec ? "border-primary/50 bg-primary/15 text-primary shadow-glow" : "bg-muted/40 hover:bg-muted",
                )}
              >
                {fmtDuration(d)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="glass" size="xl" onClick={onBack}>
            <ArrowLeft /> Edit dish
          </Button>
          <Button variant="hero" size="xl" className="flex-1" onClick={onContinue}>
            <PackageCheck className="!size-5" /> Dish placed — close the box
          </Button>
        </div>
      </div>
    </div>
  );
}
