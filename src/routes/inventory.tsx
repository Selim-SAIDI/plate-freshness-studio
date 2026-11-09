import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FlaskConical, Package, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { PageHeader, GlassPanel } from "@/components/page-header";
import { CategoryBadge, ScorePill } from "@/components/category-badge";
import { Plate, autoPosition } from "@/components/test-flow/plate";
import { Sparkline } from "@/components/rings";
import { useTests } from "@/lib/store";
import { CATEGORIES, INGREDIENTS, type IngredientCategory } from "@/lib/ingredients";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Food Inventory — Smart Food Box" },
      { name: "description", content: "Dishes under freshness monitoring and the ingredient catalog with sensitivity levels." },
      { property: "og:title", content: "Food Inventory — Smart Food Box" },
      { property: "og:description", content: "Monitored dishes and ingredient sensitivity at a glance." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const tests = useTests();
  const [cat, setCat] = useState<IngredientCategory>("fish");

  const dishes = useMemo(() => {
    const map = new Map<string, typeof tests>();
    tests.forEach((t) => map.set(t.dishName, [...(map.get(t.dishName) ?? []), t]));
    return [...map.entries()]
      .map(([name, list]) => ({
        name,
        latest: list[0]!,
        count: list.length,
        avg: Math.round(list.reduce((s, t) => s + t.score, 0) / list.length),
        trend: [...list].reverse().map((t) => t.score),
      }))
      .sort((a, b) => b.latest.createdAt.localeCompare(a.latest.createdAt));
  }, [tests]);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Kitchen" title="Food Inventory" description="Dishes you monitor with the Smart Food Box, and how sensitive each ingredient is." />

      {dishes.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-muted-foreground">No monitored dishes yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dishes.map((d, i) => (
            <article key={d.name} className="glass group rounded-3xl p-5 transition-all hover:-translate-y-1 hover:border-primary/25 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start gap-4">
                <div className="transition-transform duration-500 group-hover:rotate-12">
                  <Plate items={d.latest.ingredients.map((id, k) => ({ uid: `${k}`, ingredientId: id, ...autoPosition(k), rot: 0 }))} size={88} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{d.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> {formatDistanceToNow(new Date(d.latest.createdAt), { addSuffix: true })}
                  </p>
                  <CategoryBadge category={d.latest.category} className="mt-2" />
                </div>
                <ScorePill score={d.latest.score} category={d.latest.category} />
              </div>
              <div className="mt-4 grid grid-cols-[auto_1fr] items-end gap-4">
                <div className="text-xs text-muted-foreground">
                  <p>
                    <span className="font-mono text-base text-foreground">{d.count}</span> tests
                  </p>
                  <p>
                    avg <span className="font-mono text-foreground">{d.avg}</span>
                  </p>
                </div>
                <Sparkline data={d.trend} color="var(--teal)" height={40} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild variant="glass" size="sm" className="flex-1">
                  <Link to="/history/$id" params={{ id: d.latest.id }}>
                    <FileText /> Latest report
                  </Link>
                </Button>
                <Button asChild variant="hero" size="sm" className="flex-1">
                  <Link to="/test/new" search={{ from: d.latest.id }}>
                    <FlaskConical /> Retest
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <GlassPanel title="Ingredient catalog" icon={<Package />}>
        <div className="mb-5 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-all",
                cat === c.id ? "border-primary/40 bg-primary/12 text-primary" : "bg-muted/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div key={cat} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-up">
          {INGREDIENTS.filter((i) => i.category === cat).map((ing) => (
            <div key={ing.id} className="flex items-center gap-3 rounded-2xl bg-muted/30 p-3">
              <span className="text-3xl">{ing.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{ing.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{ing.weightG} g</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", ing.perishability > 0.75 ? "bg-attention" : ing.perishability > 0.45 ? "bg-moderate" : "bg-fresh")}
                    style={{ width: `${ing.perishability * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">Sensitivity {Math.round(ing.perishability * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
