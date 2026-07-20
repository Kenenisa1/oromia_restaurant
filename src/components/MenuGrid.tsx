"use client";

import React, { useEffect, useState } from "react";
import { useMenu } from "@/context/MenuContext";
import { translations } from "@/utils/translations";

interface MenuItem {
  id: string;
  nameEN: string;
  nameAM: string;
  nameOR: string;
  descEN?: string;
  descAM?: string;
  descOR?: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  subCategory: string;
  stockQuantity: number;
}

export default function MenuGrid() {
  const { language, mainCategory, subCategory, searchQuery, maxPrice } =
    useMenu();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      try {
        const activeCategory = mainCategory || "all";
        const activeSearch = searchQuery || "";
        const activeMaxPrice = maxPrice ? maxPrice.toString() : "9999";

        // NOTICE: We explicitly DO NOT send 'subCategory' to the backend.
        // This lets the backend return all items under this category so our
        // client-side filter can seamlessly mix in the "common" items.
        const params = new URLSearchParams({
          category: activeCategory,
          search: activeSearch,
          maxPrice: activeMaxPrice,
        });

        console.log(
          "🌐 [Frontend Request] Fetching URL:",
          `/api/menu?${params.toString()}`,
        );

        const res = await fetch(`/api/menu?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setItems(data.menuItems);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchMenuItems();
    }, 250);

    return () => clearTimeout(delayDebounce);
    // CRITICAL: We added subCategory here so the component tracks tab switches instantly
  }, [mainCategory, subCategory, searchQuery, maxPrice]);

  // ========================================================
  // Smart "Common" Filtering Logic (Client-Side)
  // ========================================================
  const visibleItems = items.filter((item) => {
    // 1. Only render if manually set to available
    if (!item.isAvailable) return false;

    // NOTE: Items should show even if stockQuantity is 0 (not set for today yet)
    // The daily stock is just for tracking admin's daily inventory setup
    // Customers should see all available items regardless of daily stock status

    const activeTab = subCategory?.toLowerCase().trim() || "all";

    // 2. If 'all' is selected, show all items
    if (activeTab === "all") return true;

    // 3. Keep item if it matches the active tab OR is tagged as "common"
    const itemSub = item.subCategory?.toLowerCase().trim() || "";
    const isCommon = itemSub === "common";
    const matchesTab = itemSub === activeTab;

    return matchesTab || isCommon;
  });

  // Helper to get localized text
  const getLocalizedName = (item: MenuItem) => {
    if (language === "am") return item.nameAM;
    if (language === "or") return item.nameOR;
    return item.nameEN;
  };

  const getLocalizedDesc = (item: MenuItem) => {
    if (language === "am") return item.descAM || item.descEN;
    if (language === "or") return item.descOR || item.descEN;
    return item.descEN;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-neutral-900">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-500 mt-4 font-medium">
          Loading delicious options...
        </p>
      </div>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-neutral-900">
        <p className="text-neutral-400 font-semibold text-lg">
          No matches found
        </p>
        <p className="text-xs text-neutral-600 mt-2">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <section className="w-full bg-neutral-900 px-4 py-6 min-h-[50vh]">
      <div className="grid grid-cols-2 gap-4">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col glass-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-[0.98] transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Food Image Container */}
            <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden rounded-t-3xl">
              <img
                src={item.imageUrl}
                alt={item.nameEN}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
            </div>

            {/* Content Details */}
            <div className="p-4 flex flex-col justify-between flex-grow relative z-10 -mt-6">
              <div className="glass-panel p-3 rounded-2xl mb-2 backdrop-blur-xl bg-neutral-900/40 border-white/5">
                <h3 className="text-neutral-100 font-extrabold tracking-tight text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors">
                  {getLocalizedName(item)}
                </h3>
                {getLocalizedDesc(item) && (
                  <p className="text-neutral-400 text-[11px] line-clamp-2 mt-1.5 leading-snug">
                    {getLocalizedDesc(item)}
                  </p>
                )}
              </div>

              {/* Price Row */}
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase">
                  Price
                </span>
                <span className="text-sm font-black text-emerald-400 drop-shadow-md">
                  {item.price}{" "}
                  <span className="text-[10px] font-medium text-emerald-300/80">
                    {t.etb}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
