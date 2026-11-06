export type IngredientCategory = "vegetables" | "meat" | "fish" | "fruits" | "dairy" | "other";

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: IngredientCategory;
  /** Typical portion weight in grams, used for the simulated load cell. */
  weightG: number;
  /** 0 (shelf stable) – 1 (highly perishable). Drives the simulated gas profile. */
  perishability: number;
}

export const CATEGORIES: { id: IngredientCategory; label: string }[] = [
  { id: "vegetables", label: "Vegetables" },
  { id: "meat", label: "Meat" },
  { id: "fish", label: "Fish & Seafood" },
  { id: "fruits", label: "Fruits" },
  { id: "dairy", label: "Dairy & Eggs" },
  { id: "other", label: "Other" },
];

export const INGREDIENTS: Ingredient[] = [
  { id: "tomato", name: "Tomato", emoji: "🍅", category: "vegetables", weightG: 90, perishability: 0.45 },
  { id: "lettuce", name: "Lettuce", emoji: "🥬", category: "vegetables", weightG: 60, perishability: 0.55 },
  { id: "carrot", name: "Carrot", emoji: "🥕", category: "vegetables", weightG: 70, perishability: 0.25 },
  { id: "broccoli", name: "Broccoli", emoji: "🥦", category: "vegetables", weightG: 85, perishability: 0.4 },
  { id: "cucumber", name: "Cucumber", emoji: "🥒", category: "vegetables", weightG: 80, perishability: 0.4 },
  { id: "avocado", name: "Avocado", emoji: "🥑", category: "vegetables", weightG: 110, perishability: 0.5 },
  { id: "pepper", name: "Bell pepper", emoji: "🫑", category: "vegetables", weightG: 75, perishability: 0.35 },
  { id: "corn", name: "Corn", emoji: "🌽", category: "vegetables", weightG: 90, perishability: 0.35 },
  { id: "mushroom", name: "Mushroom", emoji: "🍄", category: "vegetables", weightG: 50, perishability: 0.6 },
  { id: "onion", name: "Onion", emoji: "🧅", category: "vegetables", weightG: 60, perishability: 0.2 },

  { id: "chicken", name: "Chicken", emoji: "🍗", category: "meat", weightG: 150, perishability: 0.85 },
  { id: "steak", name: "Beef steak", emoji: "🥩", category: "meat", weightG: 180, perishability: 0.8 },
  { id: "bacon", name: "Bacon", emoji: "🥓", category: "meat", weightG: 40, perishability: 0.65 },
  { id: "lamb", name: "Lamb", emoji: "🍖", category: "meat", weightG: 160, perishability: 0.8 },
  { id: "sausage", name: "Sausage", emoji: "🌭", category: "meat", weightG: 80, perishability: 0.7 },

  { id: "salmon", name: "Salmon", emoji: "🍣", category: "fish", weightG: 140, perishability: 0.95 },
  { id: "fish", name: "White fish", emoji: "🐟", category: "fish", weightG: 150, perishability: 0.9 },
  { id: "shrimp", name: "Shrimp", emoji: "🍤", category: "fish", weightG: 90, perishability: 0.95 },
  { id: "crab", name: "Crab", emoji: "🦀", category: "fish", weightG: 120, perishability: 0.9 },
  { id: "oyster", name: "Oyster", emoji: "🦪", category: "fish", weightG: 60, perishability: 1 },
  { id: "squid", name: "Squid", emoji: "🦑", category: "fish", weightG: 100, perishability: 0.9 },

  { id: "strawberry", name: "Strawberry", emoji: "🍓", category: "fruits", weightG: 40, perishability: 0.6 },
  { id: "banana", name: "Banana", emoji: "🍌", category: "fruits", weightG: 110, perishability: 0.45 },
  { id: "apple", name: "Apple", emoji: "🍎", category: "fruits", weightG: 150, perishability: 0.2 },
  { id: "grapes", name: "Grapes", emoji: "🍇", category: "fruits", weightG: 80, perishability: 0.4 },
  { id: "lemon", name: "Lemon", emoji: "🍋", category: "fruits", weightG: 60, perishability: 0.15 },
  { id: "mango", name: "Mango", emoji: "🥭", category: "fruits", weightG: 130, perishability: 0.45 },
  { id: "kiwi", name: "Kiwi", emoji: "🥝", category: "fruits", weightG: 70, perishability: 0.35 },
  { id: "blueberry", name: "Blueberries", emoji: "🫐", category: "fruits", weightG: 50, perishability: 0.55 },

  { id: "cheese", name: "Cheese", emoji: "🧀", category: "dairy", weightG: 50, perishability: 0.5 },
  { id: "milk", name: "Milk", emoji: "🥛", category: "dairy", weightG: 120, perishability: 0.75 },
  { id: "butter", name: "Butter", emoji: "🧈", category: "dairy", weightG: 20, perishability: 0.35 },
  { id: "egg", name: "Egg", emoji: "🥚", category: "dairy", weightG: 55, perishability: 0.6 },
  { id: "cream", name: "Cream", emoji: "🍦", category: "dairy", weightG: 60, perishability: 0.75 },

  { id: "rice", name: "Rice", emoji: "🍚", category: "other", weightG: 150, perishability: 0.45 },
  { id: "bread", name: "Bread", emoji: "🍞", category: "other", weightG: 60, perishability: 0.25 },
  { id: "pasta", name: "Pasta", emoji: "🍝", category: "other", weightG: 160, perishability: 0.4 },
  { id: "noodles", name: "Noodles", emoji: "🍜", category: "other", weightG: 150, perishability: 0.4 },
  { id: "herbs", name: "Herbs", emoji: "🌿", category: "other", weightG: 10, perishability: 0.5 },
  { id: "olive", name: "Olives", emoji: "🫒", category: "other", weightG: 30, perishability: 0.1 },
  { id: "garlic", name: "Garlic", emoji: "🧄", category: "other", weightG: 15, perishability: 0.1 },
  { id: "chili", name: "Chili", emoji: "🌶️", category: "other", weightG: 15, perishability: 0.2 },
];

const MAP = new Map(INGREDIENTS.map((i) => [i.id, i]));

export function getIngredient(id: string): Ingredient | undefined {
  return MAP.get(id);
}

export const DISH_PRESETS: { name: string; ingredients: string[] }[] = [
  { name: "Grilled Salmon Bowl", ingredients: ["salmon", "rice", "avocado", "cucumber", "herbs"] },
  { name: "Chicken Caesar Salad", ingredients: ["chicken", "lettuce", "cheese", "bread", "egg"] },
  { name: "Tropical Fruit Cup", ingredients: ["mango", "kiwi", "strawberry", "banana", "blueberry"] },
  { name: "Shrimp Pad Thai", ingredients: ["shrimp", "noodles", "egg", "chili", "lemon"] },
];

export const MAX_PLATE_ITEMS = 12;
