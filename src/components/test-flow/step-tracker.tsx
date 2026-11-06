import { Check, ChefHat, PackageOpen, Lock, Activity, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlowPhase = "compose" | "prepare" | "closing" | "analyzing" | "results";

const STEPS: { id: FlowPhase; label: string; icon: typeof Check }[] = [
  { id: "compose", label: "Compose", icon: ChefHat },
  { id: "prepare", label: "Place dish", icon: PackageOpen },
  { id: "closing", label: "Close box", icon: Lock },
  { id: "analyzing", label: "Analyze", icon: Activity },
  { id: "results", label: "Results", icon: Trophy },
];

export function StepTracker({ phase }: { phase: FlowPhase }) {
  const current = STEPS.findIndex((s) => s.id === phase);
  return (
    <ol className="glass mb-8 flex items-center gap-1 overflow-x-auto rounded-2xl p-2">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = done ? Check : s.icon;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-1">
            <div
              className={cn(
                "flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-500",
                active && "bg-accent-gradient text-primary-foreground shadow-glow",
                done && "text-teal",
                !active && !done && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-lg",
                  active ? "bg-primary-foreground/15" : done ? "bg-teal/15" : "bg-muted",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="hidden whitespace-nowrap font-medium sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={cn("h-px w-3 shrink-0 md:w-6", i < current ? "bg-teal" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
