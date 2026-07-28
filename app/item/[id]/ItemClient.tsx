"use client";

import React from "react";
import Link from "next/link";
import { useMenu } from "@/context/MenuContext";
import { ArrowLeft, Sparkles, Leaf, Star, ChevronRight } from "lucide-react";

interface MenuItem {
  id: string;
  nameEN: string;
  nameAM: string;
  nameOR: string;
  descEN: string | null;
  descAM: string | null;
  descOR: string | null;
  price: number;
  imageUrl: string;
  subCategory: string;
  categoryId: string;
  isAvailable: boolean;
}

const t = {
  en: {
    back: "Back to Menu",
    currency: "ETB",
    fasting: "Fasting",
    traditional: "Traditional",
    special: "Special",
    related: "You might also like",
    addToOrder: "Add to Order (In-store)",
    ingredients: "Details & Contents",
  },
  am: {
    back: "ወደ ሜኑ ተመለስ",
    currency: "ብር",
    fasting: "የጾም",
    traditional: "ባህላዊ",
    special: "ልዩ",
    related: "ይህንም ሊወዱት ይችላሉ",
    addToOrder: "ትዕዛዝ ላይ ጨምር",
    ingredients: "ይዘቶች እና ማብራሪያ",
  },
  or: {
    back: "Gara Menuutti Deebi'i",
    currency: "ETB",
    fasting: "Tsooma",
    traditional: "Aadaa",
    special: "Addaa",
    related: "Kanas jaallachuu dandeessu",
    addToOrder: "Ajaja keessatti dabali",
    ingredients: "Qabiyyeewwan",
  },
};

export default function ItemClient({
  item,
  relatedItems,
}: {
  item: MenuItem;
  relatedItems: MenuItem[];
}) {
  const { language } = useMenu();
  const currentT = t[language as keyof typeof t] || t.en;

  const localizedName =
    language === "am" ? item.nameAM : language === "or" ? item.nameOR : item.nameEN;
  const localizedDesc =
    language === "am" ? item.descAM : language === "or" ? item.descOR : item.descEN;

  // Derive badges from subCategory or categoryId (heuristics since we don't have category slug here)
  // We can just rely on subCategory for fasting/traditional.
  const isSpecial = item.subCategory === "special";
  const isFasting = item.subCategory === "fasting" || item.categoryId.includes("fasting"); // rough heuristic if slug missing
  const isTraditional = item.subCategory === "traditional";

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 text-neutral-100 pb-28 font-outfit">
      
      {/* 1. Header with Beautiful Back Button */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20 flex justify-between items-center">
        <Link
          href="/"
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all duration-300 shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* 2. Full-Width Image Hero */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-neutral-950 rounded-b-[40px] shadow-2xl">
        <img
          src={item.imageUrl}
          alt={localizedName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        
        {/* Badges Over Image */}
        <div className="absolute bottom-6 left-6 flex gap-2">
          {isSpecial && (
            <div className="bg-emerald-500 text-neutral-950 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/30 uppercase tracking-widest animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentT.special}</span>
            </div>
          )}
          {isFasting && (
            <div className="bg-blue-600 text-white font-black text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-blue-500/30 uppercase tracking-widest">
              <Leaf className="w-3.5 h-3.5" />
              <span>{currentT.fasting}</span>
            </div>
          )}
          {isTraditional && (
            <div className="bg-amber-500 text-neutral-950 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/30 uppercase tracking-widest">
              <Star className="w-3.5 h-3.5" />
              <span>{currentT.traditional}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Item Details Content */}
      <div className="px-6 sm:px-10 -mt-2 relative z-10 space-y-8">
        
        {/* Title and Price */}
        <div className="flex justify-between items-start gap-4 pt-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            {localizedName}
          </h1>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center min-w-[100px] shrink-0">
            <span className="block text-2xl font-black text-emerald-400 leading-none">
              {item.price}
            </span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">
              {currentT.currency}
            </span>
          </div>
        </div>

        {/* Details & Contents Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-emerald-500">
            {currentT.ingredients}
          </h2>
          <p className="text-neutral-300 font-semibold leading-relaxed text-sm md:text-base">
            {localizedDesc || "Deliciously prepared fresh local dish."}
          </p>
        </div>

        <div className="w-full h-[1px] bg-white/5" />

        {/* 4. Related Items (Horizontal Scroll) */}
        {relatedItems && relatedItems.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400 flex items-center justify-between">
              {currentT.related}
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 snap-x">
              {relatedItems.map((rItem) => {
                const rName =
                  language === "am" ? rItem.nameAM : language === "or" ? rItem.nameOR : rItem.nameEN;
                return (
                  <Link
                    href={`/item/${rItem.id}`}
                    key={rItem.id}
                    className="snap-start min-w-[160px] max-w-[160px] bg-neutral-900/50 border border-neutral-850/80 rounded-[24px] p-2 hover:border-emerald-500/30 transition-all block"
                  >
                    <div className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-950 mb-3">
                      <img
                        src={rItem.imageUrl}
                        alt={rName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                        }}
                      />
                    </div>
                    <div className="px-1 text-center mb-1">
                      <h4 className="text-[11px] font-black text-neutral-50 line-clamp-1">{rName}</h4>
                      <span className="text-[10px] font-bold text-emerald-400 mt-1 block">
                        {rItem.price} {currentT.currency}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
