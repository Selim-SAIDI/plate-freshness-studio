import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from "date-fns";
import { TrendingUp, Thermometer, Droplets, Wind, BarChart3, CalendarRange } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, GlassPanel } from "@/components/page-header";
import { CATEGORY_STYLES } from "@/components/category-badge";
import { axisProps, GradientDefs, gridProps, tooltipProps } from "@/components/charts";
import { useTests } from "@/lib/store";
import { categorize } from "@/lib/freshness";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Smart Food Box" },
      { name: "description", content: "Freshness score evolution, sensor trends and dish comparisons over time." },
      { property: "og:title", content: "Analytics — Smart Food Box" },
      { property: "og:description", content: "Interactive charts for freshness, temperature, humidity and gas resistance." },
    ],
  }),
  component: AnalyticsPage,
});

type Period = "day" | "week" | "month";

function AnalyticsPage() {
  const tests = useTests();
  const [period, setPeriod] = useState<Period>("day");
  const [dish, setDish] = useState("all");

  const dishes = useMemo(() => [...new Set(tests.map((t) => t.dishName))].sort(), [tests]);

  const evolution = useMemo(
    () =>
      tests
        .filter((t) => dish === "all" || t.dishName === dish)
        .slice()
        .reverse()
        .map((t) => ({
          date: format(new Date(t.createdAt), "MMM d"),
          dish: t.dishName,
          score: t.score,
          temperature: +t.averages.temperatureC.toFixed(2),
          humidity: +t.averages.humidityPct.toFixed(1),
          gas: +t.averages.gasResistanceKOhm.toFixed(1),
        })),
    [tests, dish],
  );

  const comparison = useMemo(
    () =>
      dishes
        .map((name) => {
          const list = tests.filter((t) => t.dishName === name);
          const avg = Math.round(list.reduce((s, t) => s + t.score, 0) / list.length);
          return { name, avg, count: list.length, category: categorize(avg) };
        })
        .sort((a, b) => b.avg - a.avg),
    [tests, dishes],
  );

  const perPeriod = useMemo(() => {
    const now = new Date();
    const cfg = {
      day: { n: 14, start: startOfDay, sub: subDays, fmt: "MMM d" },
      week: { n: 8, start: (d: Date) => startOfWeek(d, { weekStartsOn: 1 }), sub: subWeeks, fmt: "'Wk' MMM d" },
      month: { n: 6, start: startOfMonth, sub: subMonths, fmt: "MMM yyyy" },
    }[period];
    return Array.from({ length: cfg.n }).map((_, i) => {
      const bucket = cfg.start(cfg.sub(now, cfg.n - 1 - i)).getTime();
      const inBucket = tests.filter((t) => cfg.start(new Date(t.createdAt)).getTime() === bucket);
      return {
        label: format(bucket, cfg.fmt),
        good: inBucket.filter((t) => t.category === "good").length,
        moderate: inBucket.filter((t) => t.category === "moderate").length,
        attention: inBucket.filter((t) => t.category === "attention").length,
      };
    });
  }, [tests, period]);

  const sensorCharts = [
    { key: "temperature", title: "Temperature variations", unit: "°C", color: "var(--cyan)", icon: <Thermometer /> },
    { key: "humidity", title: "Humidity evolution", unit: "%RH", color: "var(--teal)", icon: <Droplets /> },
    { key: "gas", title: "Gas resistance evolution", unit: "kΩ", color: "var(--violet)", icon: <Wind /> },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="How your dishes perform over time. All values come from simulated sensor readings."
        actions={
          <Select value={dish} onValueChange={setDish}>
            <SelectTrigger className="h-10 w-60 rounded-xl bg-surface-2/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dishes</SelectItem>
              {dishes.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <GlassPanel title="Freshness score evolution" icon={<TrendingUp />}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolution} margin={{ left: -16, right: 8, top: 8 }}>
              <GradientDefs id="an-score" color="var(--teal)" />
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="date" {...axisProps} minTickGap={24} />
              <YAxis {...axisProps} domain={[0, 100]} />
              <Tooltip
                {...tooltipProps}
                formatter={(v: number, _n, p) => [`${v} — ${(p.payload as { dish: string }).dish}`, "Score"]}
              />
              <Area type="monotone" dataKey="score" stroke="var(--teal)" strokeWidth={2.5} fill="url(#an-score)" dot={{ r: 3, fill: "var(--teal)", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      <div className="grid gap-6 lg:grid-cols-3">
        {sensorCharts.map((c) => (
          <GlassPanel key={c.key} title={c.title} icon={c.icon}>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolution} margin={{ left: -16, right: 8, top: 8 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} minTickGap={32} />
                  <YAxis {...axisProps} domain={["auto", "auto"]} tickFormatter={(v) => Number(v).toFixed(0)} />
                  <Tooltip {...tooltipProps} formatter={(v: number) => [`${v} ${c.unit}`, c.title.split(" ")[0]]} />
                  <Line type="monotone" dataKey={c.key} stroke={c.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassPanel title="Dish comparison · average score" icon={<BarChart3 />}>
          <div style={{ height: Math.max(220, comparison.length * 38) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid {...gridProps} horizontal={false} vertical />
                <XAxis type="number" domain={[0, 100]} {...axisProps} />
                <YAxis type="category" dataKey="name" {...axisProps} width={150} />
                <Tooltip {...tooltipProps} formatter={(v: number, _n, p) => [`${v} (${(p.payload as { count: number }).count} tests)`, "Avg. score"]} />
                <Bar dataKey="avg" radius={[0, 8, 8, 0]} barSize={18}>
                  {comparison.map((d) => (
                    <Cell key={d.name} fill={CATEGORY_STYLES[d.category].stroke} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel
          title="Tests performed"
          icon={<CalendarRange />}
          action={
            <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
              {(["day", "week", "month"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors",
                    period === p ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perPeriod} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} minTickGap={8} />
                <YAxis {...axisProps} allowDecimals={false} />
                <Tooltip {...tooltipProps} />
                <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
                <Bar dataKey="good" name="Good" stackId="a" fill="var(--fresh)" />
                <Bar dataKey="moderate" name="Moderate" stackId="a" fill="var(--moderate)" />
                <Bar dataKey="attention" name="Attention" stackId="a" fill="var(--attention)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
