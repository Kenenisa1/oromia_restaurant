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
  Sparkles,
  Flame,
  Info,
  CheckCircle2,
  Clock,
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
  
  // Waiter Call State
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [callSuccess, setCallSuccess] = useState(false);
  const [isSendingCall, setIsSendingCall] = useState(false);

  // Detail Modal Drawer State
  const [activeItemModal, setActiveItemModal] = useState<MenuItem | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("/api/menu?category=all");
        const data = await res.json();
        if (data.success) {
          const availableItems = (data.menuItems as MenuItem[]).filter(
            (item) => item.isAvailable,
          );
          setItems(availableItems);
          setCategories(data.categories || []);
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

  const t = {
    searchPlaceholder: {
      EN: "Search delicious food...",
      AM: "ጣፋጭ ምግብ ይፈልጉ...",
      OR: "Nyaata mi'aawaa barbaadi...",
    },
    all: { EN: "All", AM: "ሁሉም", OR: "Hunda" },
    currency: { EN: "ETB", AM: "ብር", OR: "ETB" },
    loading: {
      EN: "Crafting Menu...",
      AM: "ምግብ ዝርዝር በመጫን ላይ...",
      OR: "Kataloogii qopheessaa jira...",
    },
    empty: {
      EN: "No items match your query.",
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
      EN: "Confirm & Send Call",
      AM: "አረጋግጥ እና ደውል",
      OR: "Mirkaneessi & Waamsi",
    },
    sending: { EN: "Dispatching...", AM: "በመላክ ላይ...", OR: "Ergaa jira..." },
    success: {
      EN: "Waiter Dispatched!",
      AM: "አስተናጋጅ በመምጣት ላይ ነው!",
      OR: "Tajaajilaan karaa irra jira!",
    },
    successDesc: {
      EN: "Our staff has been notified at the counter.",
      AM: "ቆጣሪውን አሳውቀናል።",
      OR: "Kauntarii beeksifneerra.",
    },
    digitalMenu: {
      EN: "Digital Experience",
      AM: "ዲጂታል ምግብ ዝርዝር",
      OR: "Kataloogii Dijitaalaa",
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <Utensils className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mt-6 animate-pulse">
          {t.loading[lang]}
        </p>
      </div>
    );
  }

  const popularItems = filteredItems.filter((i) => i.isPopular).slice(0, 4);

  return (
    <main className="min-h-screen bg-black text-neutral-100 pb-32 selection:bg-emerald-500 selection:text-black">
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-emerald-600/10 blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-2xl border-b border-white/5 px-4 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Utensils className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              Oromia Garden
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400/80">
              {t.digitalMenu[lang]}
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-white/10">
          <Globe className="w-3.5 h-3.5 text-neutral-500 ml-1 shrink-0" />
          {(["EN", "AM", "OR"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all duration-300 ${
                lang === l
                  ? "bg-emerald-500 text-neutral-950 font-black shadow-md shadow-emerald-500/20 scale-105"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <div className="relative z-10 px-4 py-5 space-y-6 max-w-3xl mx-auto">
        {/* Search Field */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-emerald-500/0 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              placeholder={t.searchPlaceholder[lang]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl text-sm font-semibold text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Categories Scroller */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Categories
            </span>
            <span className="text-[10px] font-bold text-neutral-600">
              {categories.length} Options
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-none flex gap-2 pb-1">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSubCategory("all");
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap border transition-all duration-300 shrink-0 ${
                selectedCategory === "all"
                  ? "bg-emerald-500 text-neutral-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700"
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
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubCategory("all");
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap border transition-all duration-300 shrink-0 ${
                    isSelected
                      ? "bg-emerald-500 text-neutral-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                      : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dietary Sub-Categories */}
        {selectedCategory !== "all" && (
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block px-1">
              Filter By Type
            </span>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {[
                "all",
                "common",
                "breakfast",
                "lunch",
                "dinner",
                "cold",
                "hot",
              ].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 transition-all duration-200 border ${
                    selectedSubCategory === sub
                      ? "bg-white text-neutral-950 border-white shadow-md"
                      : "bg-neutral-900/50 border-neutral-800/80 text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Highlights Horizontal Showcase */}
        {popularItems.length > 0 &&
          searchQuery === "" &&
          selectedCategory === "all" && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {t.popular[lang]}
                </span>
                <span className="text-[10px] font-bold text-neutral-600">
                  Customer Favorites
                </span>
              </div>

              <div className="overflow-x-auto scrollbar-none flex gap-3.5 pb-2">
                {popularItems.map((item) => {
                  const name =
                    lang === "EN"
                      ? item.nameEN
                      : lang === "AM"
                        ? item.nameAM
                        : item.nameOR;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveItemModal(item)}
                      className="w-60 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shrink-0 group cursor-pointer hover:border-emerald-500/30 transition-all duration-300 shadow-xl"
                    >
                      <div className="relative aspect-[16/10] bg-neutral-950 overflow-hidden">
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
                        <div className="absolute top-2 left-2 bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Star className="w-2.5 h-2.5 fill-neutral-950" /> Top Choice
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-black text-white truncate">
                          {name}
                        </h4>
                        <p className="text-[11px] font-black text-emerald-400 mt-1">
                          {item.price}{" "}
                          <span className="text-[9px] font-bold text-neutral-500">
                            {t.currency[lang]}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Main Food Items Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
              Menu Items ({filteredItems.length})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    onClick={() => setActiveItemModal(item)}
                    className="group bg-neutral-900/80 border border-neutral-800/80 hover:border-emerald-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-lg"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden">
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

                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {item.isPopular && (
                            <span className="px-2 py-0.5 bg-amber-500/90 text-[8px] font-black uppercase text-neutral-950 rounded-md shadow-md backdrop-blur-sm">
                              ★ Popular
                            </span>
                          )}
                          {item.isNew && (
                            <span className="px-2 py-0.5 bg-blue-500/90 text-[8px] font-black uppercase text-white rounded-md shadow-md backdrop-blur-sm">
                              New
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-3">
                        <h3 className="text-xs font-black text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                          {name}
                        </h3>
                        {desc && (
                          <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                            {desc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="px-3 pb-3 pt-1 flex items-center justify-between border-t border-neutral-800/50">
                      <span className="text-xs font-black text-emerald-400">
                        {item.price}{" "}
                        <span className="text-[8px] font-bold text-neutral-500">
                          {t.currency[lang]}
                        </span>
                      </span>
                      <button className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-neutral-900/40 border border-neutral-800/50 rounded-3xl p-6">
                <Utensils className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                <p className="text-sm font-black text-neutral-400">
                  {t.empty[lang]}
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  Try adjusting your search query or switching categories.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Call Waiter Button */}
      <button
        onClick={() => setIsCallingWaiter(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 bg-emerald-500 text-neutral-950 font-black rounded-2xl shadow-2xl shadow-emerald-500/40 hover:bg-emerald-400 active:scale-95 transition-all duration-300"
      >
        <div className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-neutral-950 rounded-full animate-ping" />
        </div>
        <span className="text-xs uppercase tracking-wider font-black">
          {t.callWaiter[lang]}
        </span>
      </button>

      {/* Item Detail Modal Drawer */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveItemModal(null)}
          />
          <div className="relative bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden z-10 animate-slide-up">
            <div className="relative aspect-video w-full bg-neutral-900">
              <img
                src={activeItemModal.imageUrl}
                alt={activeItemModal.nameEN}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                }}
              />
              <button
                onClick={() => setActiveItemModal(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full text-neutral-300 flex items-center justify-center hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-black text-white">
                    {lang === "EN"
                      ? activeItemModal.nameEN
                      : lang === "AM"
                        ? activeItemModal.nameAM
                        : activeItemModal.nameOR}
                  </h2>
                  <span className="text-base font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    {activeItemModal.price} {t.currency[lang]}
                  </span>
                </div>
                <p className="text-xs font-bold text-neutral-500 mt-1">
                  {activeItemModal.nameAM} • {activeItemModal.nameOR}
                </p>
              </div>

              {(activeItemModal.descEN ||
                activeItemModal.descAM ||
                activeItemModal.descOR) && (
                <div className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
                  {lang === "EN"
                    ? activeItemModal.descEN
                    : lang === "AM"
                      ? activeItemModal.descAM
                      : activeItemModal.descOR}
                </div>
              )}

              <button
                onClick={() => {
                  setActiveItemModal(null);
                  setIsCallingWaiter(true);
                }}
                className="w-full py-3.5 bg-emerald-500 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-400 transition"
              >
                Call Waiter To Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Waiter Modal */}
      {isCallingWaiter && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsCallingWaiter(false)}
          />
          <div className="relative bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 z-10 animate-slide-up space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">
                    {t.callWaiter[lang]}
                  </h2>
                  <p className="text-[10px] font-bold text-neutral-500">
                    Counter Dispatch System
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCallingWaiter(false)}
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {callSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-black text-white text-base">
                  {t.success[lang]}
                </h3>
                <p className="text-xs text-neutral-400">
                  {t.successDesc[lang]}
                </p>
                <p className="text-xs font-black text-emerald-400 pt-2">
                  Table Number: {tableNumber}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCallWaiter} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-2">
                    {t.tableNumber[lang]}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 12"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full text-center text-2xl font-black py-4 bg-neutral-900 border border-neutral-800 rounded-2xl focus:outline-none focus:border-emerald-500 text-white placeholder-neutral-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingCall}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50"
                >
                  {isSendingCall ? t.sending[lang] : t.confirm[lang]}
                </button>

                <div className="flex items-center gap-2 justify-center text-[10px] text-neutral-500">
                  <Phone className="w-3 h-3" />
                  <span>A staff member will arrive at your table shortly</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx global>{`
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
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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