import { computeFreshness } from "@/lib/freshness";
import { createRandom } from "@/lib/random";
import { createDishProfile, simulateSeries } from "@/lib/sensors/simulator";
import type { FreshnessTest } from "@/lib/types";

const SEED_DISHES: { name: string; ingredients: string[] }[] = [
  { name: "Grilled Salmon Bowl", ingredients: ["salmon", "rice", "avocado", "cucumber", "herbs"] },
  { name: "Chicken Caesar Salad", ingredients: ["chicken", "lettuce", "cheese", "bread", "egg"] },
  { name: "Beef Tartare", ingredients: ["steak", "egg", "onion", "herbs", "bread"] },
  { name: "Caprese Plate", ingredients: ["tomato", "cheese", "herbs", "olive"] },
  { name: "Tropical Fruit Cup", ingredients: ["mango", "kiwi", "strawberry", "banana"] },
  { name: "Shrimp Pad Thai", ingredients: ["shrimp", "noodles", "egg", "chili", "lemon"] },
  { name: "Veggie Buddha Bowl", ingredients: ["rice", "broccoli", "carrot", "avocado", "corn"] },
  { name: "Greek Yogurt Parfait", ingredients: ["cream", "blueberry", "strawberry", "banana"] },
];

/** Deterministic demo history spread over the last ~45 days. */
export function generateSeedTests(now = Date.now()): FreshnessTest[] {
  const rand = createRandom(20261106);
  const tests: FreshnessTest[] = [];
  const count = 34;
  for (let i = 0; i < count; i++) {
    const dish = SEED_DISHES[Math.floor(rand() * SEED_DISHES.length)]!;
    const daysAgo = (i / count) * 45 + rand() * 0.8;
    const hour = 8 + Math.floor(rand() * 12);
    const d = new Date(now - daysAgo * 86_400_000);
    d.setHours(hour, Math.floor(rand() * 60), 0, 0);
    const durationSec = [30, 45, 60, 90][Math.floor(rand() * 4)] ?? 30;
    const profile = createDishProfile(dish.ingredients, rand);
    const readings = simulateSeries(profile, d.getTime(), durationSec, 24, rand);
    const doorOpenings = rand() < 0.75 ? 0 : rand() < 0.7 ? 1 : 2;
    const result = computeFreshness(readings, doorOpenings);
    tests.push({
      id: `seed-${i.toString().padStart(3, "0")}`,
      dishName: dish.name,
      ingredients: dish.ingredients,
      createdAt: d.toISOString(),
      durationSec,
      score: result.score,
      category: result.category,
      subscores: result.subscores,
      averages: result.averages,
      gasDropPct: result.gasDropPct,
      doorOpenings,
      series: readings.map((r) => ({
        t: Math.round((r.timestamp - d.getTime()) / 1000),
        temperatureC: r.temperatureC,
        humidityPct: r.humidityPct,
        gasResistanceKOhm: r.gasResistanceKOhm,
        weightG: r.weightG,
      })),
      source: "simulated",
      simulated: true,
    });
  }
  return tests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
