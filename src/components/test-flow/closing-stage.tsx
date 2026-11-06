import { useEffect, useState } from "react";
import { Check, Loader2, Activity, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartBox } from "./smart-box";
import type { PlacedItem } from "./plate";
import { cn } from "@/lib/utils";

type Sub = "loading" | "inserting" | "closing" | "sealed";

export function ClosingStage({ items, onStartAnalysis }: { items: PlacedItem[]; onStartAnalysis: () => void }) {
  const [sub, setSub] = useState<Sub>("loading");

  useEffect(() => {
    const t1 = setTimeout(() => setSub("inserting"), 400);
    const t2 = setTimeout(() => setSub("closing"), 1900);
    const t3 = setTimeout(() => setSub("sealed"), 3200);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  const plateInside = sub !== "loading";
  const doorOpen = sub === "loading" || sub === "inserting";
  const order: Sub[] = ["inserting", "closing", "sealed"];
  const idx = order.indexOf(sub);

  const checks = [
    { label: "Dish placed on the load-cell tray", doneAt: 1 },
    { label: "Box door closing", doneAt: 2 },
    { label: "Reed switch reports CLOSED", doneAt: 2 },
  ];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="animate-fade-up">
        <SmartBox items={items} doorOpen={doorOpen} plateInside={plateInside} />
      </div>
      <div className="space-y-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-xs font-semibold text-violet">
            Step 2 · Closing the Smart Box
          </span>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
            {sub === "sealed" ? (
              <>
                Box <span className="text-gradient">sealed</span>
              </>
            ) : (
              "Sealing the chamber…"
            )}
          </h2>
          <p className="mt-3 text-muted-foreground">
            The reed switch on the door confirms the chamber is closed before any measurement starts.
          </p>
        </div>

        <ul className="space-y-2">
          {checks.map((c, i) => {
            const done = idx >= c.doneAt;
            const active = !done && idx >= c.doneAt - 1;
            return (
              <li
                key={i}
                className={cn(
                  "glass flex items-center gap-3 rounded-2xl p-4 text-sm transition-all duration-500",
                  done && "border-fresh/30",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-xl transition-colors",
                    done ? "bg-fresh/15 text-fresh" : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-4" /> : active ? <Loader2 className="size-4 animate-spin" /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                {c.label}
              </li>
            );
          })}
        </ul>

        {sub === "sealed" && (
          <div className="flex items-center gap-3 rounded-2xl border border-fresh/30 bg-fresh/10 p-4 text-sm text-fresh animate-fade-up">
            <ShieldCheck className="size-5" /> Door closed · chamber isolated · ready to measure
          </div>
        )}

        <Button variant="hero" size="xl" className="w-full" disabled={sub !== "sealed"} onClick={onStartAnalysis}>
          <Activity className="!size-5" /> Start sensor analysis
        </Button>
      </div>
    </div>
  );
}
