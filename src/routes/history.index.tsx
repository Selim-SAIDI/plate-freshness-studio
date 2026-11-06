import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Thermometer, Droplets, Wind, Scale, FilterX, ChevronRight, FlaskConical } from "lucide-react";
import { endOfDay, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { CategoryBadge, ScorePill } from "@/components/category-badge";
import { useTests } from "@/lib/store";
import { CATEGORY_LABELS, type FreshnessCategory } from "@/lib/freshness";
import { fmtDateTime } from "@/lib/format";
import { getIngredient } from "@/lib/ingredients";

export const Route = createFileRoute("/history/")({
  head: () => ({
    meta: [
      { title: "Test History — Smart Food Box" },
      { name: "description", content: "Browse, filter and open every saved freshness test report." },
      { property: "og:title", content: "Test History — Smart Food Box" },
      { property: "og:description", content: "Every freshness estimate with its sensor readings." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const tests = useTests();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | FreshnessCategory>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const f = from ? startOfDay(new Date(from)).getTime() : -Infinity;
    const t = to ? endOfDay(new Date(to)).getTime() : Infinity;
    return tests.filter((x) => {
      const ts = new Date(x.createdAt).getTime();
      return (
        x.dishName.toLowerCase().includes(q.toLowerCase().trim()) &&
        (cat === "all" || x.category === cat) &&
        ts >= f &&
        ts <= t
      );
    });
  }, [tests, q, cat, from, to]);

  const hasFilters = q || cat !== "all" || from || to;

  return (
    <div>
      <PageHeader
        eyebrow="Records"
        title="Test History"
        description="Every freshness estimate you've validated, with its main sensor readings."
        actions={
          <Button asChild variant="hero" className="rounded-xl">
            <Link to="/test/new">
              <FlaskConical /> New test
            </Link>
          </Button>
        }
      />

      <div className="glass mb-6 grid gap-3 rounded-3xl p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dish name…" className="h-10 rounded-xl bg-surface-2/60 pl-9" />
        </div>
        <Select value={cat} onValueChange={(v) => setCat(v as typeof cat)}>
          <SelectTrigger className="h-10 rounded-xl bg-surface-2/60">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(Object.keys(CATEGORY_LABELS) as FreshnessCategory[]).map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className="h-10 rounded-xl bg-surface-2/60" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className="h-10 rounded-xl bg-surface-2/60" />
        <Button
          variant="ghost"
          className="h-10"
          disabled={!hasFilters}
          onClick={() => {
            setQ("");
            setCat("all");
            setFrom("");
            setTo("");
          }}
        >
          <FilterX /> Reset
        </Button>
      </div>

      <p className="mb-3 px-1 text-sm text-muted-foreground">
        {filtered.length} of {tests.length} tests
      </p>

      {filtered.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-muted-foreground">No tests match these filters.</div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((t, i) => (
            <li key={t.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
              <Link
                to="/history/$id"
                params={{ id: t.id }}
                className="glass group grid items-center gap-4 rounded-3xl p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 md:grid-cols-[auto_1.4fr_2fr_auto_auto]"
              >
                <ScorePill score={t.score} category={t.category} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{t.dishName}</p>
                  <p className="text-xs text-muted-foreground">{fmtDateTime(t.createdAt)}</p>
                  <p className="mt-1 truncate text-sm">
                    {t.ingredients.map((id) => getIngredient(id)?.emoji).join(" ")}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                  <Reading icon={<Thermometer />} value={`${t.averages.temperatureC.toFixed(1)}°C`} />
                  <Reading icon={<Droplets />} value={`${t.averages.humidityPct.toFixed(0)}%`} />
                  <Reading icon={<Wind />} value={`${t.averages.gasResistanceKOhm.toFixed(0)}kΩ`} />
                  <Reading icon={<Scale />} value={`${t.averages.weightG.toFixed(0)}g`} />
                </div>
                <CategoryBadge category={t.category} />
                <ChevronRight className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-1 md:block" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Reading({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-xl bg-muted/40 px-2 py-1.5 text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">
      {icon}
      <span className="truncate text-foreground">{value}</span>
    </span>
  );
}
