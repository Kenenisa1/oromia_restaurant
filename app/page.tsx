"use client";

import React, { useEffect, useState } from "react";
import { useMenu } from "@/context/MenuContext";
import HeroSection from "@/components/HeroSection"; // Make sure your HeroSection component is saved in src/components/HeroSection.tsx
import { Search, Flame, Coffee, Pizza, Sparkles, Bell, X } from "lucide-react";

interface MenuItem {
  id: string;
  nameEN: string;
  nameAM: string;
  nameOR: string;
  descEN: string;
  descAM: string;
  descOR: string;
  price: number;
  imageUrl: string;
  subCategory: string;
  isAvailable: boolean;
}

interface Category {
  id: string;
  slug: string;
  nameEN: string;
  nameAM: string;
  nameOR: string;
}

// Global Translations Dictionary matching the context languages
const t = {
  en: {
    searchPlaceholder: "search",
    all: "all",
    food: "food",
    drinks: "drinks",
    special: "special",
    noItems: "No dishes found matching your selection.",
    callWaiter: "Call Waiter",
    currency: "ETB",
    subAll: "all",
    breakfast: "breakfast",
    lunch: "lunch",
    snack: "snack",
    dinner: "dinner",
    cold: "cold drink",
    hot: "hot drink"
  },
  am: {
    searchPlaceholder: "ፈልግ",
    all: "ሁሉም",
    food: "ምግብ",
    drinks: "መጠጦች",
    special: "ልዩ",
    noItems: "የመረጡት ምግብ አልተገኘም።",
    callWaiter: "አስተናጋጅ ጥራ",
    currency: "ብር",
    subAll: "ሁሉም",
    breakfast: "ቁርስ",
    lunch: "ምሳ",
    snack: "መክሰስ",
    dinner: "እራት",
    cold: "ቀዝቃዛ",
    hot: "ትኩስ"
  },
  or: {
    searchPlaceholder: "barbaadi",
    all: "hundaa",
    food: "nyaata",
    drinks: "dhugaatii",
    special: "addaa",
    noItems: "Wanti ati filatte hin argamne.",
    callWaiter: "Wami Eegataa",
    currency: "ETB",
    subAll: "hundaa",
    breakfast: "ciree",
    lunch: "laaqana",
    snack: "caccabsaa",
    dinner: "irbaata",
    cold: "qabbanaa'aa",
    hot: "ho'aa"
  }
};

export default function ClientHomePage() {
  const { 
    language, 
    searchQuery, 
    setSearchQuery, 
    mainCategory, 
    setMainCategory,
    subCategory,
    setSubCategory
  } = useMenu();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Waiter Call State
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [callSuccess, setCallSuccess] = useState(false);
  const [isSendingCall, setIsSendingCall] = useState(false);

  // Fetch items based on current filtering states
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menu?category=${mainCategory}&search=${searchQuery}`);
        const data = await res.json();
        if (data.success) {
          // Display only visible items
          const availableItems = (data.menuItems as MenuItem[]).filter(item => item.isAvailable);
          setItems(availableItems);
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Error fetching client menu data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [mainCategory, searchQuery]);

  const handleCallWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber) return;

    setIsSendingCall(true);
    try {
      const res = await fetch("/api/waiter-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNo: tableNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setCallSuccess(true);
        setTimeout(() => {
          setIsCallingWaiter(false);
          setCallSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to call waiter. Please ask staff directly.");
    } finally {
      setIsSendingCall(false);
    }
  };

  const currentT = t[language as keyof typeof t] || t.en;

  // Filtering based on active Subcategories
  const filteredItems = items.filter((item) => {
    if (subCategory === "all") return true;
    return (
      item.subCategory.toLowerCase() === subCategory.toLowerCase() ||
      item.subCategory.toLowerCase() === "common"
    );
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 text-neutral-100 pb-28">
      
      {/* 1. DYNAMIC SPLIT-SCREEN HERO SECTION */}
      <HeroSection />

      {/* 2. DUAL ROW INTERACTIVE FILTERS & SEARCH BAR */}
      <section className="px-4 mt-6 space-y-4">
        {/* Row 1: Left Rounded Search & Right Categories Selector */}
        <div className="flex gap-2.5 items-center w-full">
          {/* Search Box */}
          <div className="relative w-[45%]">
            <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder={currentT.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-semibold focus:outline-none focus:border-emerald-500/50 placeholder-neutral-500 text-center text-neutral-100 shadow-inner transition-all"
            />
          </div>

          {/* Categories Capsule */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1 flex-1 overflow-x-auto scrollbar-none justify-between shadow-inner">
            {[
              { id: "all", label: currentT.all },
              { id: "food", label: currentT.food },
              { id: "drinks", label: currentT.drinks },
              { id: "special", label: currentT.special }
            ].map((cat) => {
              const isActive = mainCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setMainCategory(cat.id as any);
                    setSubCategory("all"); // reset sub-category on change
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-black tracking-wide uppercase transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Subcategories List (Breakfast, Lunch, Snack, Dinner, Cold, Hot) */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-1">
          {[
            { id: "all", label: currentT.subAll },
            { id: "breakfast", label: currentT.breakfast },
            { id: "lunch", label: currentT.lunch },
            { id: "snack", label: currentT.snack },
            { id: "dinner", label: currentT.dinner },
            { id: "cold", label: currentT.cold },
            { id: "hot", label: currentT.hot }
          ].map((sub) => {
            const isActive = subCategory === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSubCategory(sub.id)}
                className={`text-xs font-semibold uppercase whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "text-emerald-400 font-extrabold border-b-2 border-emerald-400 pb-1"
                    : "text-neutral-500 hover:text-neutral-300 hover:border-b-2 hover:border-neutral-700 pb-1"
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. MENU ITEMS GRID */}
      <section className="px-4 mt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-neutral-900/60 border border-neutral-800 rounded-[28px] p-3 space-y-3 animate-pulse">
                <div className="w-full aspect-square bg-neutral-800 rounded-2xl" />
                <div className="h-3 bg-neutral-800 rounded w-2/3 mx-auto" />
                <div className="h-3 bg-neutral-800 rounded w-1/3 mx-auto" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 space-y-3">
            <span className="text-4xl">🍲</span>
            <p className="text-xs font-bold tracking-wide">{currentT.noItems}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const localizedName = 
                language === "am" ? item.nameAM : 
                language === "or" ? item.nameOR : 
                item.nameEN;

              const localizedDesc = 
                language === "am" ? item.descAM : 
                language === "or" ? item.descOR : 
                item.descEN;

              return (
                <div
                  key={item.id}
                  className="bg-neutral-900/50 border border-neutral-850/80 rounded-[28px] p-3 flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300"
                >
                  <div className="space-y-3">
                    {/* Food Image Container */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800/60 shadow-inner">
                      <img
                        src={item.imageUrl}
                        alt={localizedName}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                        }}
                      />
                    </div>

                    {/* Meta Text */}
                    <div className="px-1 text-center">
                      <h3 className="text-xs font-black text-neutral-50 line-clamp-1">
                        {localizedName}
                      </h3>
                      <p className="text-[10px] text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                        {localizedDesc || "Deliciously prepared fresh local dish."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 px-1.5">
                    <span className="text-xs font-black text-emerald-400">
                      {item.price} <span className="text-[9px] font-bold">{currentT.currency}</span>
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-neutral-950 border border-neutral-850 text-neutral-400 rounded-md font-bold uppercase tracking-widest scale-90">
                      {item.subCategory}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. FLOATING CALL WAITER PANEL */}
      <button
        onClick={() => setIsCallingWaiter(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-full shadow-2xl active:scale-95 transition-transform"
      >
        <Bell className="w-4 h-4 animate-bounce" />
        <span className="text-[10px] uppercase tracking-wider">{currentT.callWaiter}</span>
      </button>

      {/* Call Waiter Modal Drawer */}
      {isCallingWaiter && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsCallingWaiter(false)} />
          <div className="relative bg-neutral-950 border-t border-neutral-800 w-full max-w-md rounded-t-[32px] p-6 z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black">Call a Waiter</h2>
              <button
                onClick={() => setIsCallingWaiter(false)}
                className="w-8 h-8 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {callSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                  ✓
                </div>
                <h3 className="font-bold text-neutral-100">Waiter is on the way!</h3>
                <p className="text-xs text-neutral-500">We have notified the counter of Table {tableNumber}.</p>
              </div>
            ) : (
              <form onSubmit={handleCallWaiter} className="space-y-5 pb-6">
                <div>
                  <label className="text-xs text-neutral-500 font-bold uppercase block mb-2 text-center">
                    Enter Your Table Number
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 5"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full text-center text-2xl font-black py-4 bg-neutral-900 border border-neutral-800 rounded-2xl focus:outline-none focus:border-emerald-500 text-neutral-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingCall}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-black rounded-2xl text-xs uppercase tracking-wider active:scale-95 transition-transform"
                >
                  {isSendingCall ? "Sending alert..." : "Confirm & Call Now"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}