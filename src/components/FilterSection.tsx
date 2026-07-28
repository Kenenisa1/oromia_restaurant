"use client";

import React, { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMenu, MainCategory } from "@/context/MenuContext";
import { translations } from "@/utils/translations";

export default function FilterSection() {
  const {
    language,
    searchQuery,
    setSearchQuery,
    mainCategory,
    setMainCategory,
    subCategory,
    setSubCategory,
    priceRange,
    setPriceRange,
  } = useMenu();

  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const t = translations[language];

  // Handle auto-resetting or switching subcategories when the main category changes
  useEffect(() => {
    setSubCategory("all");
  }, [mainCategory, setSubCategory]);

  // Define dynamic subcategories based on active main category selection
  const renderSubCategories = () => {
    if (mainCategory === "food") {
      return [
        { id: "all", label: t.all },
        { id: "breakfast", label: t.breakfast },
        { id: "lunch", label: t.lunch },
        { id: "snack", label: t.snack },
        { id: "dinner", label: t.dinner },
      ];
    } else if (mainCategory === "drinks") {
      return [
        { id: "all", label: t.all },
        { id: "cold", label: t.cold },
        { id: "hot", label: t.hot },
      ];
    }
    return [];
  };

  const subCategories = renderSubCategories();

  return (
    <section className="w-full px-4 pt-4 pb-2 bg-neutral-900 border-b border-neutral-800">
      {/* Search Bar & Filter Toggle Row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 pr-4 py-3 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
          />
        </div>

        {/* Price Slider Toggle Button */}
        <button
          onClick={() => setShowPriceFilter(!showPriceFilter)}
          className={`p-3 rounded-full border transition-all active:scale-95 ${
            showPriceFilter
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-neutral-950 border-neutral-800 text-neutral-400"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Expandable Price Range Filter Slider */}
      {showPriceFilter && (
        <div className="mb-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 transition-all duration-300">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Price Range</span>
            <span className="text-sm font-bold text-emerald-400">
              {priceRange === "all" ? "All Prices" : priceRange}
            </span>
          </div>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full bg-neutral-900 text-neutral-300 rounded p-2"
          >
            <option value="all">All Prices</option>
            <option value="<100">&lt; 100 ETB</option>
            <option value="100-300">100 - 300 ETB</option>
            <option value="300-500">300 - 500 ETB</option>
            <option value="500+">500+ ETB</option>
          </select>
        </div>
      )}

      {/* Horizontal Main Categories (All, Food, Drinks, Special) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
        {([
          { id: "all", label: t.all },
          { id: "food", label: t.food },
          { id: "drinks", label: t.drinks },
          { id: "special", label: t.special },
        ] as { id: MainCategory; label: string }[]).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setMainCategory(cat.id)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all whitespace-nowrap active:scale-95 ${
              mainCategory === cat.id
                ? "bg-neutral-100 text-neutral-950 shadow-md"
                : "bg-neutral-950 text-neutral-400 border border-neutral-800"
            }`}
          >
            {cat.label.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Sub-categories (Breakfast, Lunch, etc.) displayed conditionally */}
      {subCategories.length > 0 && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 border-t border-neutral-800/40">
          {subCategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSubCategory(sub.id)}
              className={`text-sm font-semibold transition-all whitespace-nowrap pb-1 relative ${
                subCategory === sub.id
                  ? "text-emerald-400 font-bold"
                  : "text-neutral-500 active:text-neutral-300"
              }`}
            >
              {sub.label.toLowerCase()}
              {subCategory === sub.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}