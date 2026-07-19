"use client";

import { clsx } from "clsx";
import { ChevronDown, Search, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  mealTimes: Array<"breakfast" | "lunch" | "dinner" | "all">;
  stock: number;
  accent: string;
  isAvailable: boolean;
}

const mealTabs = [
  { value: "all", label: "All Day (ሁሉም)" },
  { value: "breakfast", label: "Breakfast (ቁርስ)" },
  { value: "lunch", label: "Lunch (ምሳ)" },
  { value: "dinner", label: "Dinner (እራት)" },
] as const;

const categories = [
  { value: "all", label: "All" },
  { value: "specialty", label: "Specialty" },
  { value: "fast-food", label: "Fast Food" },
  { value: "hot-drinks", label: "Hot Drinks" },
  { value: "soft-drinks", label: "Soft Drinks" },
] as const;


function formatPrice(value: number) {
  return `${value.toLocaleString("en-ET")} ETB`;
}

export default function MenuDisplay() {
  const [selectedMealTime, setSelectedMealTime] = useState<(typeof mealTabs)[number]["value"]>("all");
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]["value"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "low-to-high" | "high-to-low">("none");
  const [cartItems, setCartItems] = useState<Array<{ itemId: string; quantity: number }>>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await fetch("/api/menu");
        if (!response.ok) {
          throw new Error("Unable to load menu");
        }
        const data = await response.json();
        const items = (data.categories ?? []).flatMap((category: { name: string; items: Array<{ id: string; name: string; description: string; price: number; stockQuantity: number; isAvailable: boolean }> }) =>
          category.items.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: category.name.toLowerCase().replace(/\s+/g, "-"),
            mealTimes: ["all"],
            stock: item.stockQuantity,
            accent: "🍽️",
            isAvailable: item.isAvailable,
          })),
        );
        setMenuItems(items);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadMenu();
  }, []);

  const filteredItems = useMemo(() => {
    let items = menuItems;

    if (selectedMealTime !== "all") {
      items = items.filter((item) => item.mealTimes.includes(selectedMealTime as MenuItem["mealTimes"][number]));
    }

    if (selectedCategory !== "all") {
      items = items.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
      );
    }

    if (priceSort === "low-to-high") {
      items = [...items].sort((a, b) => a.price - b.price);
    }

    if (priceSort === "high-to-low") {
      items = [...items].sort((a, b) => b.price - a.price);
    }

    return items;
  }, [menuItems, searchQuery, priceSort, selectedCategory, selectedMealTime]);

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  const addToCart = (itemId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.itemId === itemId);
      if (existing) {
        return prev.map((item) => (item.itemId === itemId ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const getStockBadge = (item: MenuItem) => {
    if (item.stock === 0) {
      return (
        <div className="flex items-center gap-1 text-red-400">
          <AlertCircle size={14} />
          <span className="text-[11px] font-semibold">Sold Out</span>
        </div>
      );
    }

    if (item.stock < 5) {
      return (
        <div className="flex items-center gap-1 text-amber-400">
          <AlertCircle size={14} />
          <span className="text-[11px] font-semibold">Only {item.stock} left!</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-emerald-400">
        <CheckCircle2 size={14} />
        <span className="text-[11px] font-semibold">In Stock</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      <div className="sticky top-0 z-20 border-b border-emerald-500/20 bg-zinc-950/95 px-4 py-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-400">Oromia Restaurant</p>
            <h1 className="text-xl font-semibold text-white">Customer Menu</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300">
            <ShoppingCart size={16} />
            {cartTotal}
          </div>
        </div>

        <label className="relative mb-3 block">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search for food or drinks"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-emerald-500"
          />
        </label>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {mealTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedMealTime(tab.value)}
              className={clsx(
                "flex-shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition",
                selectedMealTime === tab.value
                  ? "bg-emerald-500 text-zinc-950"
                  : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={clsx(
                  "flex-shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition",
                  selectedCategory === category.value
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300",
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0">
            <select
              value={priceSort}
              onChange={(event) => setPriceSort(event.target.value as "none" | "low-to-high" | "high-to-low")}
              className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 pr-8 text-xs font-semibold text-zinc-300 outline-none"
            >
              <option value="none">Sort</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2">
        {isLoading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-400 sm:col-span-2">
            Loading menu from the database...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/80 p-4 text-sm text-zinc-400 sm:col-span-2">
            No items match your filters right now.
          </div>
        ) : (
          filteredItems.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-lg shadow-black/20">
            <div className="flex h-36 items-center justify-center border-b border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-950 text-5xl">
              {item.accent}
            </div>
            <div className="space-y-3 p-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
              </div>

              <div>{getStockBadge(item)}</div>

              <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                <span className="text-lg font-semibold text-emerald-400">{formatPrice(item.price)}</span>
                <button
                  onClick={() => addToCart(item.id)}
                  className="rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
                >
                  Add
                </button>
              </div>
            </div>
          </article>
          ))
        )}
      </div>
    </div>
  );
}
