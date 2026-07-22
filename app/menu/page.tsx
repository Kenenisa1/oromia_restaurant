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
      AM: "አስተናጋጅ በመምጣት ላይ ነው እባክዎ ይታገሱ!",
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
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-bold text-neutral-400 mt-6 tracking-wider animate-pulse">
          {t.loading[lang]}
        </p>
      </div>
    );
  }

  const popularItems = filteredItems.slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 text-neutral-100 pb-32">
      {/* Sticky Top Header - Premium */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-2xl border-b border-white/10 px-4 py-4 flex items-center justify-between shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <Utensils className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              Oromia Garden
            </h1>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-400">
              {t.digitalMenu[lang]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <Globe className="w-4 h-4 text-white/40 ml-1.5 shrink-0" />
          {(["EN", "AM", "OR"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-300 ${
                lang === l
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-6 space-y-8">
        {/* Search Input - Premium */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              placeholder={t.searchPlaceholder[lang]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4.5 bg-white/10 border-2 border-white/10 rounded-3xl text-base font-semibold focus:outline-none focus:border-emerald-500/50 placeholder-white/30 text-white/95 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-black/20"
            />
          </div>
        </div>

        {/* Categories - Premium Scroller */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Explore Menu
            </span>
            <span className="text-xs font-bold text-white/20">
              {categories.length} categories
            </span>
          </div>
          <div className="overflow-x-auto scrollbar-none flex gap-2.5 pb-2">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSubCategory("all");
              }}
              className={`px-6 py-3.5 rounded-2xl text-sm font-black whitespace-nowrap border-2 transition-all duration-300 shrink-0 ${
                selectedCategory === "all"
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "bg-white/10 border-white/10 text-white/50 hover:bg-white/20 hover:text-white/80"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Utensils className="w-4 h-4" />
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
                  className={`px-6 py-3.5 rounded-2xl text-sm font-black whitespace-nowrap border-2 transition-all duration-300 shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20"
                      : "bg-white/10 border-white/10 text-white/50 hover:bg-white/20 hover:text-white/80"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories - Premium */}
        {selectedCategory !== "all" && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Dietary Options
            </span>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
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
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all duration-300 ${
                    selectedSubCategory === sub
                      ? "bg-white text-neutral-950 shadow-xl shadow-white/20"
                      : "bg-white/10 text-white/40 hover:text-white/80"
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2.5">
                  <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                  {t.popular[lang]}
                </span>
                <span className="text-xs font-bold text-emerald-400/60">
                  Chef&apos;s Picks
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
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
                      className="relative bg-gradient-to-r from-emerald-500/10 to-transparent border-2 border-emerald-500/20 rounded-2xl overflow-hidden group cursor-pointer hover:border-emerald-500/40 transition-all duration-300 shadow-xl shadow-emerald-500/5"
                    >
                      <div className="flex items-center gap-5 p-5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-900 border-2 border-white/10 group-hover:border-emerald-500/30 transition-all duration-300">
                          <img
                            src={item.imageUrl}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-black text-white flex items-center gap-3">
                            {name}
                            <span className="text-xs bg-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-wider border border-emerald-500/30">
                              {t.popular[lang]}
                            </span>
                          </h4>
                          <p className="text-sm font-medium text-white/50 line-clamp-1 mt-1">
                            {desc}
                          </p>
                          <p className="text-xl font-black text-emerald-400 mt-2">
                            {item.price}{" "}
                            <span className="text-sm font-bold text-white/40">
                              {t.currency[lang]}
                            </span>
                          </p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/20 group-hover:translate-x-2 group-hover:text-emerald-400 transition-all duration-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Menu Items Grid - Premium */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              {filteredItems.length} items
            </span>
            {filteredItems.length > 0 && (
              <span className="text-xs font-bold text-white/20">
                Swipe to explore
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                    className="group bg-white/10 border-2 border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:bg-white/15 transition-all duration-300 cursor-pointer shadow-lg shadow-black/20"
                  >
                    <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                        }}
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {item.isPopular && (
                          <span className="px-3 py-1.5 bg-emerald-500/95 text-xs font-black uppercase text-white rounded-full backdrop-blur-sm shadow-lg shadow-emerald-500/30">
                            ★ {t.popular[lang]}
                          </span>
                        )}
                        {item.isNew && (
                          <span className="px-3 py-1.5 bg-blue-500/95 text-xs font-black uppercase text-white rounded-full backdrop-blur-sm shadow-lg shadow-blue-500/30">
                            {t.new[lang]}
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-sm font-black uppercase tracking-wider text-white/80">
                          View Details
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-base font-black text-white/95 line-clamp-1">
                          {name}
                        </h3>
                        {desc && (
                          <p className="text-xs font-semibold text-white/40 mt-1 line-clamp-2 leading-relaxed">
                            {desc}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t-2 border-white/10">
                        <span className="text-lg font-black text-emerald-400">
                          {item.price}{" "}
                          <span className="text-sm font-bold text-white/30">
                            {t.currency[lang]}
                          </span>
                        </span>
                        <button className="w-9 h-9 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-110">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-20 space-y-5">
                <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                  <Utensils className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-xl font-black text-white/30">
                  {t.empty[lang]}
                </p>
                <p className="text-sm font-semibold text-white/20">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Call Waiter Button - Premium */}
      <button
        onClick={() => setIsCallingWaiter(true)}
        className="fixed bottom-8 right-8 z-50 group flex items-center gap-3 px-7 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-2xl shadow-2xl shadow-emerald-500/40 active:scale-95 transition-all duration-300 hover:shadow-emerald-500/60 hover:scale-105"
      >
        <div className="relative">
          <Bell className="w-6 h-6 animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
        </div>
        <span className="text-sm font-black uppercase tracking-wider">
          {t.callWaiter[lang]}
        </span>
      </button>

      {/* Call Waiter Modal - Premium */}
      {isCallingWaiter && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={() => setIsCallingWaiter(false)}
          />
          <div className="relative bg-neutral-900/95 border-t-2 border-white/10 w-full max-w-md rounded-t-[40px] p-8 z-10 animate-slide-up shadow-2xl shadow-black/50 backdrop-blur-sm">
            <div className="w-16 h-1.5 bg-white/20 rounded-full mx-auto mb-5" />

            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500/30">
                  <User className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    {t.callWaiter[lang]}
                  </h2>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Immediate Assistance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCallingWaiter(false)}
                className="w-10 h-10 flex items-center justify-center bg-white/10 border-2 border-white/10 rounded-xl text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {callSuccess ? (
              <div className="py-10 text-center space-y-5">
                <div className="w-20 h-20 mx-auto bg-emerald-500/20 border-4 border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 text-4xl font-black">
                  ✓
                </div>
                <h3 className="font-black text-white text-2xl">
                  {t.success[lang]}
                </h3>
                <p className="text-base font-bold text-white/50">
                  {t.successDesc[lang]}
                </p>
                <p className="text-lg font-black text-emerald-400/80">
                  Table {tableNumber}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCallWaiter} className="space-y-8 pb-4">
                <div>
                  <label className="text-sm font-black uppercase tracking-widest text-white/40 block mb-4">
                    {t.tableNumber[lang]}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="Enter table number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full text-center text-4xl font-black py-6 bg-white/10 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-white/20 transition-all duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingCall}
                  className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-2xl text-base uppercase tracking-wider active:scale-95 transition-all duration-300 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50"
                >
                  {isSendingCall ? t.sending[lang] : t.confirm[lang]}
                </button>

                <div className="flex items-center gap-3 justify-center text-xs font-bold text-white/20 uppercase tracking-widest">
                  <Phone className="w-4 h-4" />
                  <span>Staff will arrive shortly</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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