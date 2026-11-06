import { CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import { CATEGORY_LABELS, type FreshnessCategory } from "@/lib/freshness";
import { cn } from "@/lib/utils";

export const CATEGORY_STYLES: Record<FreshnessCategory, { text: string; bg: string; ring: string; icon: typeof CheckCircle2; stroke: string }> = {
  good: { text: "text-fresh", bg: "bg-fresh/12", ring: "border-fresh/30", icon: CheckCircle2, stroke: "var(--fresh)" },
  moderate: { text: "text-moderate", bg: "bg-moderate/12", ring: "border-moderate/30", icon: AlertTriangle, stroke: "var(--moderate)" },
  attention: { text: "text-attention", bg: "bg-attention/12", ring: "border-attention/30", icon: AlertOctagon, stroke: "var(--attention)" },
};

export function CategoryBadge({
  category,
  long = false,
  className,
}: {
  category: FreshnessCategory;
  long?: boolean;
  className?: string;
}) {
  const s = CATEGORY_STYLES[category];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        s.text,
        s.bg,
        s.ring,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {long ? CATEGORY_LABELS[category].label : CATEGORY_LABELS[category].short}
    </span>
  );
}

export function ScorePill({ score, category }: { score: number; category: FreshnessCategory }) {
  const s = CATEGORY_STYLES[category];
  return (
    <span
      className={cn(
        "inline-grid size-11 place-items-center rounded-2xl border font-display text-base font-bold",
        s.text,
        s.bg,
        s.ring,
      )}
    >
      {score}
    </span>
  );
}
