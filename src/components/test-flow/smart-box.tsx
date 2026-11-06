import { Lock, LockOpen, Thermometer, Wind, Scale } from "lucide-react";
import { Plate, type PlacedItem } from "./plate";
import { cn } from "@/lib/utils";

/**
 * Illustrated Smart Food Box. Purely visual — door/plate state comes from props.
 */
export function SmartBox({
  items,
  doorOpen,
  plateInside,
  scanning = false,
  className,
}: {
  items: PlacedItem[];
  doorOpen: boolean;
  plateInside: boolean;
  scanning?: boolean;
  className?: string;
}) {
  const closed = !doorOpen;
  return (
    <div className={cn("relative mx-auto w-full max-w-[400px] pb-24", className)}>
      <div className="relative aspect-[1/0.9] w-full" style={{ perspective: "1400px" }}>
        {/* body */}
        <div className="absolute inset-0 rounded-[2.2rem] border bg-box shadow-violet">
          <div className="flex h-[16%] items-center justify-between px-6">
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">SMART·FOOD·BOX</span>
            <span className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", scanning ? "bg-teal animate-glow" : "bg-muted-foreground/40")} />
              <span className={cn("size-2 rounded-full", closed ? "bg-fresh" : "bg-moderate animate-glow")} />
            </span>
          </div>

          {/* chamber */}
          <div className="absolute inset-x-[7%] bottom-[15%] top-[16%] overflow-hidden rounded-[1.4rem] border bg-chamber">
            <div className="absolute inset-0 bg-grid opacity-60" />
            <SensorDot className="left-3 top-3" icon={<Thermometer />} label="DS18B20" active={scanning} />
            <SensorDot className="right-3 top-3" icon={<Wind />} label="BME680" active={scanning} />
            <div className="absolute inset-x-[18%] bottom-2 flex items-center justify-center gap-1.5 rounded-full border bg-surface-2/80 py-1 text-[9px] font-mono text-muted-foreground">
              <Scale className="size-3" /> HX711 load cell
            </div>
            {scanning && closed && (
              <div className="absolute inset-x-4 h-0.5 rounded-full bg-accent-gradient shadow-glow animate-scan" />
            )}
          </div>

          {/* plate */}
          <div
            className="absolute left-1/2 z-10 transition-transform duration-[1300ms] ease-[cubic-bezier(0.6,0,0.2,1)]"
            style={{
              bottom: "19%",
              transform: plateInside
                ? "translateX(-50%) translateY(0) scale(1)"
                : "translateX(-50%) translateY(85%) scale(1.25)",
            }}
          >
            <Plate items={items} size={140} />
          </div>

          {/* door */}
          <div
            className="absolute inset-x-[7%] bottom-[15%] top-[16%] z-20 origin-left rounded-[1.4rem] border border-foreground/15 bg-door transition-transform duration-[1200ms] ease-[cubic-bezier(0.6,0,0.2,1)]"
            style={{
              transform: doorOpen ? "rotateY(-105deg)" : "rotateY(0deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="absolute inset-3 rounded-2xl border border-foreground/10" />
            <div className="absolute right-3 top-1/2 h-16 w-2 -translate-y-1/2 rounded-full bg-foreground/30" />
            {/* reed magnet */}
            <div className={cn("absolute -right-1 top-6 h-6 w-2 rounded-sm transition-colors", closed ? "bg-fresh" : "bg-moderate")} />
          </div>

          {/* status bar */}
          <div className="absolute inset-x-0 bottom-0 flex h-[15%] items-center justify-between px-6 text-xs">
            <span className="font-mono text-muted-foreground">Reed switch</span>
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono font-semibold transition-colors",
                closed ? "border-fresh/30 bg-fresh/10 text-fresh" : "border-moderate/30 bg-moderate/10 text-moderate",
              )}
            >
              {closed ? <Lock className="size-3" /> : <LockOpen className="size-3" />}
              {closed ? "CLOSED" : "OPEN"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SensorDot({ className, icon, label, active }: { className: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "absolute flex items-center gap-1 rounded-full border bg-surface-2/80 px-2 py-0.5 font-mono text-[9px] text-muted-foreground [&_svg]:size-3",
        active && "text-teal border-teal/30",
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
