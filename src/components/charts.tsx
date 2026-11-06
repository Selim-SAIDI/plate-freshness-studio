/** Shared Recharts styling so every chart matches the design system. */
export const tooltipProps = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    color: "var(--foreground)",
    fontSize: 12,
    boxShadow: "var(--shadow-glass)",
  },
  labelStyle: { color: "var(--muted-foreground)", marginBottom: 4 },
  cursor: { stroke: "var(--border)", fill: "oklch(1 0 0 / 4%)" },
} as const;

export const axisProps = {
  stroke: "var(--muted-foreground)",
  tick: { fill: "var(--muted-foreground)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

export const gridProps = {
  stroke: "var(--border)",
  strokeDasharray: "3 6",
  vertical: false,
} as const;

export function GradientDefs({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.45} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}
