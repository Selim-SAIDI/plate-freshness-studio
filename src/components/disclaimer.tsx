import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Disclaimer({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-3 rounded-2xl border border-cyan/20 bg-cyan/5 p-4 text-xs text-muted-foreground", className)}>
      <Info className="mt-0.5 size-4 shrink-0 text-cyan" />
      <p>
        <span className="font-semibold text-foreground">Experimental estimate.</span> This score is derived from
        environmental sensor readings (temperature, humidity, gas/VOC, weight) and is not a certified food-safety
        assessment. It does not confirm that a dish is safe to eat — always follow your food-safety procedures and
        inspect the food.
      </p>
    </div>
  );
}
