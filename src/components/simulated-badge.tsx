import { cn } from "@/lib/utils";

export function SimulatedBadge({ className, label = "Simulated sensors" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-moderate/30 bg-moderate/10 px-2.5 py-1 text-xs font-medium text-moderate",
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-moderate opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-moderate" />
      </span>
      {label}
    </span>
  );
}
