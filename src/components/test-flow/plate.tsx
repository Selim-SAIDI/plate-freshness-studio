import { useState, type DragEvent } from "react";
import { X } from "lucide-react";
import { getIngredient } from "@/lib/ingredients";
import { cn } from "@/lib/utils";

export interface PlacedItem {
  uid: string;
  ingredientId: string;
  /** position relative to plate center, -1..1 of radius */
  x: number;
  y: number;
  rot: number;
}

export const DRAG_MIME = "application/x-sfb-ingredient";

export function Plate({
  items,
  size = 420,
  interactive = false,
  onDropIngredient,
  onRemove,
  bumpKey,
  className,
}: {
  items: PlacedItem[];
  size?: number;
  interactive?: boolean;
  onDropIngredient?: (id: string, x: number, y: number) => void;
  onRemove?: (uid: string) => void;
  bumpKey?: number;
  className?: string;
}) {
  const [over, setOver] = useState(false);
  const emojiSize = Math.max(18, size * 0.13);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData(DRAG_MIME) || e.dataTransfer.getData("text/plain");
    if (!id || !onDropIngredient) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    let y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const d = Math.hypot(x, y);
    const max = 0.62;
    if (d > max) {
      x = (x / d) * max;
      y = (y / d) * max;
    }
    onDropIngredient(id, x, y);
  };

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full bg-plate shadow-plate transition-[box-shadow,transform] duration-300",
        over && "shadow-glow scale-[1.02]",
        className,
      )}
      style={{ width: size, height: size }}
      onDragOver={
        interactive
          ? (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
              if (!over) setOver(true);
            }
          : undefined
      }
      onDragLeave={interactive ? () => setOver(false) : undefined}
      onDrop={interactive ? handleDrop : undefined}
      aria-label={interactive ? "Plate – drop ingredients here" : "Plate"}
    >
      <div className="pointer-events-none absolute inset-[8%] rounded-full border border-plate-rim shadow-[inset_0_6px_24px_-8px_oklch(0.4_0.03_275/35%)]" />
      <div className="pointer-events-none absolute inset-[22%] rounded-full border border-plate-rim/50" />
      {bumpKey ? (
        <span
          key={bumpKey}
          className="pointer-events-none absolute -inset-1 rounded-full border-4 border-teal/70 animate-ring"
        />
      ) : null}

      {interactive && items.length === 0 && (
        <div
          className={cn(
            "pointer-events-none absolute inset-[18%] grid place-items-center rounded-full border-2 border-dashed text-center text-sm font-medium transition-colors",
            over ? "border-teal text-teal" : "border-plate-rim text-muted-foreground/80",
          )}
        >
          <span className="px-6 text-primary-foreground/60">
            Drag ingredients here
            <br />
            <span className="text-xs font-normal">or tap them in the pantry</span>
          </span>
        </div>
      )}

      {items.map((item) => {
        const ing = getIngredient(item.ingredientId);
        if (!ing) return null;
        return (
          <span
            key={item.uid}
            className="absolute animate-drop-in"
            style={
              {
                left: `${50 + item.x * 50}%`,
                top: `${50 + item.y * 50}%`,
                "--rot": `${item.rot}deg`,
              } as React.CSSProperties
            }
          >
            {interactive && (
              <span className="pointer-events-none absolute left-1/2 top-1/2 size-14 rounded-full border-2 border-teal animate-burst" />
            )}
            {interactive ? (
              <button
                type="button"
                onClick={() => onRemove?.(item.uid)}
                className="group relative block cursor-pointer select-none drop-shadow-[0_6px_6px_oklch(0.2_0.03_275/35%)] transition-transform hover:scale-110"
                style={{ fontSize: emojiSize, lineHeight: 1 }}
                title={`Remove ${ing.name}`}
              >
                {ing.emoji}
                <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100">
                  <X className="size-3" />
                </span>
              </button>
            ) : (
              <span
                className="block select-none drop-shadow-[0_4px_4px_oklch(0.2_0.03_275/35%)]"
                style={{ fontSize: emojiSize, lineHeight: 1 }}
              >
                {ing.emoji}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Golden-angle spiral placement for tap-to-add. */
export function autoPosition(index: number): { x: number; y: number } {
  if (index === 0) return { x: 0, y: 0 };
  const angle = index * 2.39996;
  const r = 0.2 + 0.42 * Math.sqrt(index / 12);
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
}
