/**
 * Dummy menu data for testing the restaurant menu system
 * This includes various menu items across different categories and meal times
 */

export interface DummyMenuItem {
  id: string;
  name: string;
  nameAM?: string;
  nameOR?: string;
  description: string;
  price: number;
  imageUrl: string;
  isTrackable: boolean;
  stockQuantity: number;
  isAvailable: boolean;
  categoryId: string;
  categoryName: string;
  mealTimes: ("breakfast" | "lunch" | "dinner" | "all")[];
}

export const dummyCategories = [
  { id: "cat-1", name: "Appetizers", slug: "appetizers" },
  { id: "cat-2", name: "Burgers", slug: "burgers" },
  { id: "cat-3", name: "Drinks", slug: "drinks" },
  { id: "cat-4", name: "Desserts", slug: "desserts" },
  { id: "cat-5", name: "Ethiopian Dishes", slug: "ethiopian-dishes" },
];

export const dummyMenuItems: DummyMenuItem[] = [
  {
    id: "item-1",
    name: "Shiro Wat",
    description: "Traditional Ethiopian chickpea stew served with injera bread",
    price: 125,
    imageUrl: "https://images.unsplash.com/photo-1585238341710-4913d3ca7229?w=400",
    isTrackable: true,
    stockQuantity: 15,
    isAvailable: true,
    categoryId: "cat-5",
    categoryName: "Ethiopian Dishes",
    mealTimes: ["breakfast", "lunch", "dinner", "all"],
  },
  {
    id: "item-2",
    name: "Misir Wat",
    description: "Spiced red lentil stew with onions and garlic",
    price: 110,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    isTrackable: true,
    stockQuantity: 2,
    isAvailable: true,
    categoryId: "cat-5",
    categoryName: "Ethiopian Dishes",
    mealTimes: ["lunch", "dinner"],
  },
  {
    id: "item-3",
    name: "Doro Wat",
    description: "Slow-cooked chicken stew with Ethiopian spices",
    price: 180,
    imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
    isTrackable: true,
    stockQuantity: 8,
    isAvailable: true,
    categoryId: "cat-5",
    categoryName: "Ethiopian Dishes",
    mealTimes: ["lunch", "dinner"],
  },
  {
    id: "item-4",
    name: "Tibs",
    description: "Sautéed beef with vegetables and spices",
    price: 220,
    imageUrl: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400",
    isTrackable: true,
    stockQuantity: 0,
    isAvailable: false,
    categoryId: "cat-5",
    categoryName: "Ethiopian Dishes",
    mealTimes: ["lunch", "dinner"],
  },
  {
    id: "item-5",
    name: "Classic Cheeseburger",
    description: "Flame-grilled beef patty with cheddar cheese, lettuce, tomato, and special sauce",
    price: 145,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    isTrackable: true,
    stockQuantity: 12,
    isAvailable: true,
    categoryId: "cat-2",
    categoryName: "Burgers",
    mealTimes: ["lunch", "dinner"],
  },
  {
    id: "item-6",
    name: "Double Bacon Burger",
    description: "Dual beef patties with crispy bacon, Swiss cheese, and caramelized onions",
    price: 185,
    imageUrl: "https://images.unsplash.com/photo-1550547990-2ef510e36ea0?w=400",
    isTrackable: true,
    stockQuantity: 5,
    isAvailable: true,
    categoryId: "cat-2",
    categoryName: "Burgers",
    mealTimes: ["lunch", "dinner"],
  },
  {
    id: "item-7",
    name: "Sambussa",
    description: "Crispy fried pastry triangles filled with spiced meat or vegetables",
    price: 60,
    imageUrl: "https://images.unsplash.com/photo-1569718150635-062ead05ae21?w=400",
    isTrackable: true,
    stockQuantity: 25,
    isAvailable: true,
    categoryId: "cat-1",
    categoryName: "Appetizers",
    mealTimes: ["breakfast", "lunch", "dinner", "all"],
  },
  {
    id: "item-8",
    name: "Fresh Lemonade",
    description: "Freshly squeezed lemon juice with cold water and sugar",
    price: 45,
    imageUrl: "https://images.unsplash.com/photo-1513097633097-cb679fe66ba2?w=400",
    isTrackable: false,
    stockQuantity: 100,
    isAvailable: true,
    categoryId: "cat-3",
    categoryName: "Drinks",
    mealTimes: ["breakfast", "lunch", "dinner", "all"],
  },
  {
    id: "item-9",
    name: "Ethiopian Coffee",
    description: "Traditional coffee served in a traditional jebena pot ceremony style",
    price: 55,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
    isTrackable: false,
    stockQuantity: 50,
    isAvailable: true,
    categoryId: "cat-3",
    categoryName: "Drinks",
    mealTimes: ["breakfast", "lunch", "dinner", "all"],
  },
  {
    id: "item-10",
    name: "Chocolate Mousse",
    description: "Rich, creamy dark chocolate mousse topped with whipped cream",
    price: 95,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    isTrackable: true,
    stockQuantity: 6,
    isAvailable: true,
    categoryId: "cat-4",
    categoryName: "Desserts",
    mealTimes: ["lunch", "dinner", "all"],
  },
];

/**
 * Get all menu items
 */
export function getAllMenuItems(): DummyMenuItem[] {
  return dummyMenuItems;
}

/**
 * Filter menu items by meal time
 */
export function filterByMealTime(items: DummyMenuItem[], mealTime: string): DummyMenuItem[] {
  if (mealTime === "all") return items;
  return items.filter((item) => item.mealTimes.includes(mealTime as any));
}

/**
 * Filter menu items by category
 */
export function filterByCategory(items: DummyMenuItem[], categoryId: string): DummyMenuItem[] {
  if (categoryId === "all") return items;
  return items.filter((item) => item.categoryId === categoryId);
}

/**
 * Search menu items by name or description
 */
export function searchMenuItems(items: DummyMenuItem[], query: string): DummyMenuItem[] {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort menu items by price
 */
export function sortByPrice(
  items: DummyMenuItem[],
  order: "low-to-high" | "high-to-low"
): DummyMenuItem[] {
  const sorted = [...items];
  if (order === "low-to-high") {
    return sorted.sort((a, b) => a.price - b.price);
  } else {
    return sorted.sort((a, b) => b.price - a.price);
  }
}
