import { useEffect, useId, useState, type ReactNode } from "react";

/** Circular progress (0–1) with arbitrary content in the middle. */
export function CircularProgress({
  value,
  size = 220,
  stroke = 14,
  children,
  color,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  color?: string;
}) {
  const id = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.min(1, Math.max(0, value));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color ?? "var(--teal)"} />
            <stop offset="55%" stopColor={color ?? "var(--cyan)"} />
            <stop offset="100%" stopColor={color ?? "var(--violet)"} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#g-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset 0.4s ease-out", filter: "drop-shadow(0 0 10px var(--teal))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** Animated count-up score ring for results. */
export function ScoreRing({ score, color, size = 240 }: { score: number; color: string; size?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <CircularProgress value={shown / 100} size={size} stroke={16} color={color}>
      <div>
        <div className="font-display text-7xl font-bold tabular-nums" style={{ color }}>
          {shown}
        </div>
        <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">of 100 · estimate</div>
      </div>
    </CircularProgress>
  );
}

export function Sparkline({ data, color = "var(--teal)", height = 36 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return <div style={{ height }} />;
  const w = 120;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${height - 3 - ((d - min) / span) * (height - 6)}`);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
