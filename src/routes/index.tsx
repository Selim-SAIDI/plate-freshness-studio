import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, startOfDay, subDays } from "date-fns";
import { FlaskConical, Gauge, Utensils, Activity, ArrowRight, TrendingUp, Clock, AlertTriangle, CheckCircle2, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { GlassPanel } from "@/components/page-header";
import { ScorePill, CategoryBadge, CATEGORY_STYLES } from "@/components/category-badge";
import { SmartBox } from "@/components/test-flow/smart-box";
import { autoPosition } from "@/components/test-flow/plate";
import { axisProps, GradientDefs, gridProps, tooltipProps } from "@/components/charts";
import { useTests } from "@/lib/store";
import { CATEGORY_LABELS, type FreshnessCategory } from "@/lib/freshness";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Food Box" },
      { name: "description", content: "Monitor freshness tests, trends and recent activity from your Smart Food Box." },
      { property: "og:title", content: "Smart Food Box — Freshness dashboard" },
      { property: "og:description", content: "Gamified IoT freshness testing for restaurants and food professionals." },
    ],
  }),
  component: Dashboard,
});

const HERO_ITEMS = ["salmon", "rice", "avocado", "cucumber", "herbs"].map((id, i) => ({
  uid: id,
  ingredientId: id,
  ...autoPosition(i),
  rot: ((i * 37) % 40) - 20,
}));

function Dashboard() {
  const tests = useTests();

  const data = useMemo(() => {
    const now = new Date();
    const avg = tests.length ? Math.round(tests.reduce((s, t) => s + t.score, 0) / tests.length) : 0;
    const monitored = new Set(tests.filter((t) => new Date(t.createdAt) > subDays(now, 30)).map((t) => t.dishName)).size;
    const week = tests.filter((t) => new Date(t.createdAt) > subDays(now, 7)).length;
    const days = Array.from({ length: 30 }).map((_, i) => {
      const d = startOfDay(subDays(now, 29 - i));
      const dayTests = tests.filter((t) => startOfDay(new Date(t.createdAt)).getTime() === d.getTime());
      return {
        day: format(d, "MMM d"),
        score: dayTests.length ? Math.round(dayTests.reduce((s, t) => s + t.score, 0) / dayTests.length) : null,
      };
    });
    const dist = (["good", "moderate", "attention"] as FreshnessCategory[]).map((c) => ({
      name: CATEGORY_LABELS[c].short,
      category: c,
      value: tests.filter((t) => t.category === c).length,
    }));
    return { avg, monitored, week, days, dist };
  }, [tests]);

  const recent = tests.slice(0, 5);
  const activities = tests.slice(0, 7).map((t) => {
    if (t.doorOpenings > 0)
      return { icon: DoorOpen, tone: "text-moderate", text: `Box opened ${t.doorOpenings}× during “${t.dishName}” test`, at: t.createdAt };
    if (t.category === "attention")
      return { icon: AlertTriangle, tone: "text-attention", text: `“${t.dishName}” flagged for attention (${t.score})`, at: t.createdAt };
    return { icon: CheckCircle2, tone: "text-fresh", text: `“${t.dishName}” test saved with score ${t.score}`, at: t.createdAt };
  });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="glass relative overflow-hidden rounded-[2.5rem] p-6 md:p-10 animate-fade-up">
        <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-violet/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 size-80 rounded-full bg-teal/15 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary">Smart Food Box · Freshness lab</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Plate it. Box it.
              <br />
              <span className="text-gradient">Read its freshness.</span>
            </h1>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Compose a dish, seal it in the Smart Food Box and let five sensors build an experimental freshness estimate
              in under a minute.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/test/new">
                  <FlaskConical className="!size-5" /> Start a new freshness test
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/history">View history</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <SmartBox items={HERO_ITEMS} doorOpen={false} plateInside scanning className="max-w-[340px] pb-0" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tests performed" value={tests.length} hint="All time" icon={Activity} tone="teal" />
        <StatCard label="Avg. estimated freshness" value={tests.length ? data.avg : "—"} hint="Experimental score / 100" icon={Gauge} tone="violet" delay={60} />
        <StatCard label="Dishes monitored" value={data.monitored} hint="Tested in the last 30 days" icon={Utensils} tone="cyan" delay={120} />
        <StatCard label="Tests this week" value={data.week} hint="Last 7 days" icon={TrendingUp} tone="moderate" delay={180} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <GlassPanel title="Freshness trend · 30 days" icon={<TrendingUp />}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.days} margin={{ left: -16, right: 8, top: 8 }}>
                <GradientDefs id="dash-score" color="var(--teal)" />
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" {...axisProps} interval={4} />
                <YAxis {...axisProps} domain={[0, 100]} />
                <Tooltip {...tooltipProps} formatter={(v: number) => [v, "Avg. score"]} />
                <Area type="monotone" dataKey="score" connectNulls stroke="var(--teal)" strokeWidth={2.5} fill="url(#dash-score)" dot={{ r: 3, fill: "var(--teal)", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
        <GlassPanel title="Result categories" icon={<Gauge />}>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.dist} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={4} stroke="none">
                  {data.dist.map((d) => (
                    <Cell key={d.category} fill={CATEGORY_STYLES[d.category].stroke} />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="font-display text-3xl font-semibold">{tests.length}</div>
                <div className="text-xs text-muted-foreground">tests</div>
              </div>
            </div>
          </div>
          <ul className="mt-2 space-y-2">
            {data.dist.map((d) => (
              <li key={d.category} className="flex items-center justify-between text-sm">
                <CategoryBadge category={d.category} />
                <span className="font-mono text-muted-foreground">{d.value}</span>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <GlassPanel
          title="Recent test results"
          icon={<FlaskConical />}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/history">
                All tests <ArrowRight />
              </Link>
            </Button>
          }
        >
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No tests yet. Run your first freshness test.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((t) => (
                <li key={t.id}>
                  <Link
                    to="/history/$id"
                    params={{ id: t.id }}
                    className="-mx-2 flex items-center gap-4 rounded-2xl px-2 py-3 transition-colors hover:bg-accent/40"
                  >
                    <ScorePill score={t.score} category={t.category} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.dishName}</p>
                      <p className="text-xs text-muted-foreground">{fmtDateTime(t.createdAt)}</p>
                    </div>
                    <div className="hidden gap-4 font-mono text-xs text-muted-foreground md:flex">
                      <span>{t.averages.temperatureC.toFixed(1)}°C</span>
                      <span>{t.averages.humidityPct.toFixed(0)}%</span>
                      <span>{t.averages.gasResistanceKOhm.toFixed(0)}kΩ</span>
                    </div>
                    <CategoryBadge category={t.category} className="hidden sm:inline-flex" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
        <GlassPanel title="Recent activity" icon={<Clock />}>
          <ol className="relative space-y-4 border-l border-border pl-5">
            {activities.map((a, i) => (
              <li key={i} className="relative animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <span className="absolute -left-[29px] top-0.5 grid size-4 place-items-center rounded-full bg-background">
                  <a.icon className={`size-4 ${a.tone}`} />
                </span>
                <p className="text-sm">{a.text}</p>
                <p className="text-xs text-muted-foreground">{fmtDateTime(a.at)}</p>
              </li>
            ))}
          </ol>
        </GlassPanel>
      </div>
    </div>
  );
}
