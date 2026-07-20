"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Globe,
  Bell,
  X,
  Utensils,
  Star,
  ChevronRight,
  User,
  Phone,
} from "lucide-react";

interface Category {
  id: string;
  nameEN: string;
  nameAM: string;
  nameOR: string;
  icon?: string;
}

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
  isAvailable: boolean;
  subCategory: string;
  categoryId: string;
  isPopular?: boolean;
  isNew?: boolean;
}

type Language = "EN" | "AM" | "OR";

export default function CustomerMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState<Language>("EN");
  const [isLoading, setIsLoading] = useState(true);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [callSuccess, setCallSuccess] = useState(false);
  const [isSendingCall, setIsSendingCall] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("/api/menu?category=all");
        const data = await res.json();
        if (data.success) {
          // Strictly show only available items to the customers
          const availableItems = (data.menuItems as MenuItem[]).filter(
            (item) => item.isAvailable,
          );
          setItems(availableItems);
          setCategories(data.categories);
        }
      } catch (e) {
        console.error("Error loading menu:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

const handleCallWaiter = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!tableNumber) return;

  setIsSendingCall(true);
  try {
    // FIX: Send request to the new database-backed endpoint
    const res = await fetch("/api/waiter-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // FIX: Map 'tableNumber' from local state to 'tableNo' for your Prisma schema
      body: JSON.stringify({ tableNo: tableNumber }), 
    });
    
    const data = await res.json();
    if (data.success) {
      setCallSuccess(true);
      setTimeout(() => {
        setIsCallingWaiter(false);
        setCallSuccess(false);
      }, 3000);
    } else {
      alert(data.error || "Failed to call waiter.");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to call waiter. Please ask staff directly.");
  } finally {
    setIsSendingCall(false);
  }
};
  // Filter logic
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;

    const matchesSubCategory =
      selectedSubCategory === "all" || item.subCategory === selectedSubCategory;

    const name = (
      lang === "EN" ? item.nameEN : lang === "AM" ? item.nameAM : item.nameOR
    ).toLowerCase();
    const desc = (
      lang === "EN" ? item.descEN : lang === "AM" ? item.descAM : item.descOR
    ).toLowerCase();
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      desc.includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  // Localized Strings helper
  const t = {
    searchPlaceholder: {
      EN: "Search delicious food...",
      AM: "ጣፋጭ ምግብ ይፈልጉ...",
      OR: "Nyaata mi'aawaa barbaadi...",
    },
    all: { EN: "All", AM: "ሁሉም", OR: "Hunda" },
    currency: { EN: "ETB", AM: "ብር", OR: "ETB" },
    loading: {
      EN: "Preparing Menu...",
      AM: "ምግብ ዝርዝር በመጫን ላይ...",
      OR: "Kataloogii qopheessaa jira...",
    },
    empty: {
      EN: "No items found.",
      AM: "ምንም ነገር አልተገኘም።",
      OR: "Wanti hin argamne.",
    },
    popular: { EN: "Popular", AM: "ታዋቂ", OR: "Beekamaa" },
    new: { EN: "New", AM: "አዲስ", OR: "Haaraa" },
    callWaiter: {
      EN: "Call Waiter",
      AM: "አስተናጋጅ ይደውሉ",
      OR: "Tajaajilaa waamsi",
    },
    tableNumber: {
      EN: "Table Number",
      AM: "ጠረጴዛ ቁጥር",
      OR: "Lakkoofsa Minjaalaa",
    },
    confirm: {
      EN: "Confirm & Call",
      AM: "አረጋግጥ እና ደውል",
      OR: "Mirkaneessi & Waamsi",
    },
    sending: { EN: "Sending...", AM: "በመላክ ላይ...", OR: "Ergaa jira..." },
    success: {
      EN: "Waiter is on the way!",
      AM: "አስተናጋጅ በመጣ ላይ ነው!",
      OR: "Tajaajilaan karaa irra jira!",
    },
    successDesc: {
      EN: "We've notified the counter.",
      AM: "ቆጣሪውን አሳውቀናል።",
      OR: "Kauntarii beeksifneerra.",
    },
    digitalMenu: {
      EN: "Digital Menu",
      AM: "ዲጂታል ምግብ ዝርዝር",
      OR: "Kataloogii Dijitaalaa",
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs text-neutral-500 mt-6 tracking-wider animate-pulse">
          {t.loading[lang]}
        </p>
      </div>
    );
  }

  // Get popular items (first 2 from filtered list for demo)
  const popularItems = filteredItems.slice(0, 2);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 pb-32">
      {/* Sticky Top Header - Enhanced */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Utensils className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white">
              Oromia Garden
            </h1>
            <p className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-[0.2em]">
              {t.digitalMenu[lang]}
            </p>
          </div>
        </div>

        {/* Language Switcher - Enhanced */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
          <Globe className="w-3.5 h-3.5 text-white/40 ml-1.5 shrink-0" />
          {(["EN", "AM", "OR"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all duration-300 ${
                lang === l
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Search Input - Enhanced */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              placeholder={t.searchPlaceholder[lang]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-emerald-500/50 placeholder-white/30 text-white/90 transition-all duration-300 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Categories - Enhanced Scroller */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              Categories
            </span>
            <span className="text-[8px] text-white/20">
              {categories.length} categories
            </span>
          </div>
          <div className="overflow-x-auto scrollbar-none flex gap-2 pb-1">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSubCategory("all");
              }}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all duration-300 shrink-0 ${
                selectedCategory === "all"
                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10"
                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2">
                <Utensils className="w-3.5 h-3.5" />
                {t.all[lang]}
              </span>
            </button>
            {categories.map((cat) => {
              const label =
                lang === "EN"
                  ? cat.nameEN
                  : lang === "AM"
                    ? cat.nameAM
                    : cat.nameOR;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubCategory("all");
                  }}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all duration-300 shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10"
                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories - Enhanced */}
        {selectedCategory !== "all" && (
          <div className="space-y-1.5">
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/20">
              Dietary Options
            </span>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {[
                "all",
                "breakfast",
                "lunch",
                "dinner",
                "cold",
                "hot",
                "vegan",
                "gluten-free",
              ].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 transition-all duration-300 ${
                    selectedSubCategory === sub
                      ? "bg-white text-neutral-950 shadow-lg"
                      : "bg-white/5 text-white/30 hover:text-white/60"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Items Section - Premium */}
        {filteredItems.length > 0 &&
          searchQuery === "" &&
          selectedCategory === "all" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-emerald-400" />
                  {t.popular[lang]}
                </span>
                <span className="text-[8px] text-white/20">
                  Today&apos;s picks
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {popularItems.map((item) => {
                  const name =
                    lang === "EN"
                      ? item.nameEN
                      : lang === "AM"
                        ? item.nameAM
                        : item.nameOR;
                  const desc =
                    lang === "EN"
                      ? item.descEN
                      : lang === "AM"
                        ? item.descAM
                        : item.descOR;
                  return (
                    <div
                      key={item.id}
                      className="relative bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900">
                          <img
                            src={item.imageUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {name}
                            <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                              {t.popular[lang]}
                            </span>
                          </h4>
                          <p className="text-xs text-white/40 line-clamp-1">
                            {desc}
                          </p>
                          <p className="text-sm font-black text-emerald-400 mt-1">
                            {item.price}{" "}
                            <span className="text-[8px] font-normal text-white/30">
                              {t.currency[lang]}
                            </span>
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Menu Items Grid - Enhanced */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              {filteredItems.length} items
            </span>
            {filteredItems.length > 0 && (
              <span className="text-[8px] text-white/20">Swipe to explore</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const name =
                  lang === "EN"
                    ? item.nameEN
                    : lang === "AM"
                      ? item.nameAM
                      : item.nameOR;
                const desc =
                  lang === "EN"
                    ? item.descEN
                    : lang === "AM"
                      ? item.descAM
                      : item.descOR;
                return (
                  <div
                    key={item.id}
                    className="group bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 cursor-pointer"
                  >
                    {/* Food Picture with overlay */}
                    <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                        }}
                      />
                      {/* Badge overlay */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {item.isPopular && (
                          <span className="px-2 py-0.5 bg-emerald-500/90 text-[8px] font-black uppercase text-white rounded-full backdrop-blur-sm">
                            ★
                          </span>
                        )}
                        {item.isNew && (
                          <span className="px-2 py-0.5 bg-blue-500/90 text-[8px] font-black uppercase text-white rounded-full backdrop-blur-sm">
                            {t.new[lang]}
                          </span>
                        )}
                      </div>
                      {/* Quick view hint */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-white/60">
                          Tap to view
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 space-y-2">
                      <div>
                        <h3 className="text-xs font-bold text-white/90 line-clamp-1">
                          {name}
                        </h3>
                        {desc && (
                          <p className="text-[9px] text-white/30 mt-0.5 line-clamp-2 leading-relaxed">
                            {desc}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-xs font-black text-emerald-400">
                          {item.price}{" "}
                          <span className="text-[8px] font-normal text-white/30">
                            {t.currency[lang]}
                          </span>
                        </span>
                        <button className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-16 space-y-4">
                <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-sm font-medium text-white/30">
                  {t.empty[lang]}
                </p>
                <p className="text-xs text-white/20">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Call Waiter Button - Enhanced */}
      <button
        onClick={() => setIsCallingWaiter(true)}
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-2xl shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all duration-300 hover:shadow-emerald-500/50"
      >
        <div className="relative">
          <Bell className="w-5 h-5 animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
        </div>
        <span className="text-xs uppercase tracking-wider">
          {t.callWaiter[lang]}
        </span>
      </button>

      {/* Call Waiter Modal - Enhanced Premium */}
      {isCallingWaiter && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsCallingWaiter(false)}
          />
          <div className="relative bg-neutral-900 border-t border-white/10 w-full max-w-md rounded-t-[32px] p-6 z-10 animate-slide-up">
            {/* Handle bar */}
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-4" />

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">
                    {t.callWaiter[lang]}
                  </h2>
                  <p className="text-[8px] text-white/30 uppercase tracking-widest">
                    Assistance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCallingWaiter(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {callSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 text-2xl font-bold">
                  ✓
                </div>
                <h3 className="font-bold text-white text-lg">
                  {t.success[lang]}
                </h3>
                <p className="text-sm text-white/40">{t.successDesc[lang]}</p>
                <p className="text-xs text-emerald-400/60">
                  Table {tableNumber}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCallWaiter} className="space-y-6 pb-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/30 block mb-3">
                    {t.tableNumber[lang]}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="Enter number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full text-center text-3xl font-black py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-white/20 transition-all duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingCall}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-2xl text-sm uppercase tracking-wider active:scale-95 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-50"
                >
                  {isSendingCall ? t.sending[lang] : t.confirm[lang]}
                </button>

                {/* Quick info */}
                <div className="flex items-center gap-2 justify-center text-[8px] text-white/20 uppercase tracking-widest">
                  <Phone className="w-3 h-3" />
                  <span>Staff will arrive shortly</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CSS for slide-up animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
