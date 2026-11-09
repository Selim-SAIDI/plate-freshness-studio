import { useMemo, useState } from "react";
import { Apple, Beef, Carrot, Fish, Milk, Wheat, Sparkles, Trash2, X, FlaskConical, Scale, Gauge, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plate, autoPosition, DRAG_MIME, type PlacedItem } from "./plate";
import { CATEGORIES, DISH_PRESETS, INGREDIENTS, MAX_PLATE_ITEMS, getIngredient, type IngredientCategory } from "@/lib/ingredients";
import { useElementWidth } from "@/hooks/use-element-width";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<IngredientCategory, typeof Apple> = {
  vegetables: Carrot,
  meat: Beef,
  fish: Fish,
  fruits: Apple,
  dairy: Milk,
  other: Wheat,
};

let uidCounter = 0;
const newUid = () => `p${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

export function DishBuilder({
  items,
  onItemsChange,
  dishName,
  onDishNameChange,
  onStart,
}: {
  items: PlacedItem[];
  onItemsChange: (items: PlacedItem[]) => void;
  dishName: string;
  onDishNameChange: (n: string) => void;
  onStart: () => void;
}) {
  const [category, setCategory] = useState<IngredientCategory>("vegetables");
  const [bump, setBump] = useState(0);
  const [stageRef, stageWidth] = useElementWidth<HTMLDivElement>(420);
  const plateSize = Math.max(240, Math.min(460, stageWidth - 32));

  const add = (id: string, pos?: { x: number; y: number }) => {
    if (items.length >= MAX_PLATE_ITEMS) {
      toast.warning(`A plate holds up to ${MAX_PLATE_ITEMS} ingredients`);
      return;
    }
    const p = pos ?? autoPosition(items.length);
    onItemsChange([...items, { uid: newUid(), ingredientId: id, x: p.x, y: p.y, rot: Math.round((Math.random() - 0.5) * 50) }]);
    setBump((b) => b + 1);
  };

  const remove = (uid: string) => onItemsChange(items.filter((i) => i.uid !== uid));

  const loadPreset = (preset: (typeof DISH_PRESETS)[number]) => {
    onDishNameChange(preset.name);
    onItemsChange(
      preset.ingredients.map((id, idx) => {
        const p = autoPosition(idx);
        return { uid: newUid(), ingredientId: id, x: p.x, y: p.y, rot: Math.round((Math.random() - 0.5) * 50) };
      }),
    );
    setBump((b) => b + 1);
  };

  const stats = useMemo(() => {
    const ings = items.map((i) => getIngredient(i.ingredientId)).filter((i) => i !== undefined);
    const weight = ings.reduce((s, i) => s + i.weightG, 0);
    const sensitivity = ings.length ? ings.reduce((s, i) => s + i.perishability, 0) / ings.length : 0;
    const cats = new Set(ings.map((i) => i.category)).size;
    return { weight, sensitivity, cats };
  }, [items]);

  const pantry = INGREDIENTS.filter((i) => i.category === category);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(260px,300px)_1fr] xl:grid-cols-[300px_1fr_320px]">
      {/* Plate stage */}
      <section className="order-1 lg:col-start-2 lg:row-start-1">
        <div
          ref={stageRef}
          className="glass relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[2.5rem] p-4 md:min-h-[540px]"
        >
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/10 blur-3xl" />
          <div className="relative mb-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Plating station</p>
            <h2 className="mt-1 min-h-8 text-2xl font-semibold">{dishName || "Untitled dish"}</h2>
          </div>
          <Plate items={items} size={plateSize} interactive onDropIngredient={(id, x, y) => add(id, { x, y })} onRemove={remove} bumpKey={bump} />
          <div className="relative mt-5 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-mono">
              {items.length}/{MAX_PLATE_ITEMS} ingredients
            </span>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => onItemsChange([])}>
                <Trash2 /> Clear plate
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Pantry */}
      <aside className="order-2 lg:col-start-1 lg:row-[1/span_2] xl:row-[1/span_1]">
        <div className="glass rounded-3xl p-4">
          <h3 className="mb-3 px-1 text-sm font-semibold">Pantry</h3>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c.id];
              const active = c.id === category;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border px-2 py-2.5 text-[11px] font-medium transition-all",
                    active
                      ? "border-primary/40 bg-primary/12 text-primary shadow-glow"
                      : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="truncate">{c.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          <div key={category} className="mt-4 grid grid-cols-3 gap-2 animate-fade-up">
            {pantry.map((ing) => (
              <button
                key={ing.id}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_MIME, ing.id);
                  e.dataTransfer.setData("text/plain", ing.id);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => add(ing.id)}
                className="group flex cursor-grab flex-col items-center gap-1 rounded-2xl border bg-surface/60 p-2.5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/50 active:cursor-grabbing"
                title={`Drag or tap to add ${ing.name}`}
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">{ing.emoji}</span>
                <span className="w-full truncate text-center text-[11px] text-muted-foreground group-hover:text-foreground">
                  {ing.name}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 px-1 text-[11px] text-muted-foreground">Drag onto the plate, or tap to drop it in.</p>
        </div>
      </aside>

      {/* Details */}
      <aside className="order-3 space-y-4 lg:col-start-2 lg:row-start-2 xl:col-start-3 xl:row-start-1">
        <div className="glass rounded-3xl p-5">
          <label htmlFor="dish-name" className="text-sm font-semibold">
            Dish name
          </label>
          <Input
            id="dish-name"
            value={dishName}
            onChange={(e) => onDishNameChange(e.target.value)}
            placeholder="e.g. Grilled Salmon Bowl"
            maxLength={60}
            className="mt-2 h-11 rounded-xl bg-surface-2/60"
          />
          <p className="mt-4 mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Sparkles className="size-3.5 text-violet" /> Quick recipes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DISH_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => loadPreset(p)}
                className="rounded-full border bg-muted/40 px-3 py-1 text-xs transition-colors hover:border-violet/40 hover:bg-violet/15"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-5">
          <h3 className="mb-3 text-sm font-semibold">On the plate</h3>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing yet — start with a base like rice or lettuce.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {items.map((it) => {
                const ing = getIngredient(it.ingredientId);
                if (!ing) return null;
                return (
                  <li key={it.uid} className="flex items-center gap-1 rounded-full border bg-surface/70 py-1 pl-2 pr-1 text-xs animate-fade-up">
                    <span>{ing.emoji}</span>
                    {ing.name}
                    <button
                      type="button"
                      onClick={() => remove(it.uid)}
                      className="ml-0.5 grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                      aria-label={`Remove ${ing.name}`}
                    >
                      <X className="size-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <MiniStat icon={<Scale />} label="Est. weight" value={`${stats.weight} g`} />
            <MiniStat icon={<Gauge />} label="Sensitivity" value={stats.sensitivity ? `${Math.round(stats.sensitivity * 100)}%` : "—"} />
            <MiniStat
              icon={<Star />}
              label="Variety"
              value={
                <span className="flex justify-center gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star key={i} className={cn("size-3.5", i < Math.min(3, stats.cats) ? "fill-moderate text-moderate" : "text-muted-foreground/40")} />
                  ))}
                </span>
              }
            />
          </div>
        </div>

        <Button variant="hero" size="xl" className="w-full" disabled={items.length === 0} onClick={onStart}>
          <FlaskConical className="!size-5" /> Start Freshness Test
        </Button>
        {items.length === 0 && <p className="text-center text-xs text-muted-foreground">Add at least one ingredient to begin.</p>}
      </aside>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-2.5">
      <div className="mx-auto mb-1 grid size-6 place-items-center text-cyan [&_svg]:size-3.5">{icon}</div>
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
