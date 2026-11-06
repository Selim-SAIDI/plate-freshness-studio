import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "teal",
  delay = 0,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "teal" | "violet" | "cyan" | "moderate";
  delay?: number;
}) {
  const toneCls = {
    teal: "text-teal bg-teal/12",
    violet: "text-violet bg-violet/15",
    cyan: "text-cyan bg-cyan/12",
    moderate: "text-moderate bg-moderate/12",
  }[tone];
  return (
    <div
      className="glass group relative overflow-hidden rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={cn("grid size-10 place-items-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-6", toneCls)}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
