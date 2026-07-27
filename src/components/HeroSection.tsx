"use client";

import React, { useState } from "react";
import {
  Menu,
  X,
  Info,
  Globe,
  Phone,
  MapPin,
  ChevronRight,
  ExternalLink,
  Utensils,
  Clock,
  Award,
} from "lucide-react";
import { useMenu } from "@/context/MenuContext";
import { translations } from "@/utils/translations";

export default function HeroSection() {
  const { language, setLanguage } = useMenu();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<"en" | "am" | "or">(
    language || "en",
  );

  // Fallback translations with enhanced structure
  const t = translations?.[language] || {
    welcome: "WELCOME TO",
    restaurantName: "OROMIA GARDEN RESTAURANT",
    subWelcome: "What would you like to order?",
    description:
      "Experience authentic Ethiopian cuisine in an elegant garden setting",
    cta: "Explore Menu",
  };

  const handleLanguageChange = (lang: "en" | "am" | "or") => {
    setActiveLang(lang);
    setLanguage(lang);
    // Close drawer after selection with a small delay for visual feedback
    setTimeout(() => setIsDrawerOpen(false), 300);
  };

  return (
    <header className="relative w-full h-[70vh] md:h-[85vh] lg:h-[90vh] overflow-hidden bg-neutral-950">
      {/* 1. SPLIT-SCREEN BACKGROUND */}
      <div className="absolute inset-0 flex w-full h-full">
        {/* Left Side: Restaurant Ambiance with Enhanced Gradient */}
        <div
          className="w-[60%] h-full bg-cover bg-center relative"
          style={{
            backgroundImage: `url('/hero-bg.jpg')`,
            backgroundPosition: "center 30%",
          }}
        >
          {/* Multi-layered gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-black/20" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/30 to-transparent" />

          {/* Decorative element - subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(16,185,129,0.1) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Right Side: Waiter Portrait with Enhanced Treatment */}
        <div
          className="w-[40%] h-full bg-cover bg-center relative"
          style={{
            backgroundImage: `url('/malewaiter.jpg')`,
            backgroundPosition: "center 20%",
          }}
        >
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />

          {/* Subtle border glow */}
          <div className="absolute inset-0 border-l border-white/10 shadow-[inset_-20px_0_40px_rgba(0,0,0,0.3)]" />
        </div>
      </div>

      {/* 2. FLOATING HEADER - Refined Glass Morphism */}
      <div className="absolute top-0 inset-x-0 flex justify-between items-center px-4 sm:px-8 py-5 z-20">
        {/* Decorative badge - optional, adds elegance */}
        <div className="hidden md:flex items-center gap-2 glass-panel rounded-full px-4 py-1.5 animate-float">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
          <span className="text-xs font-medium text-white/90 tracking-wider">
            OPEN DAILY
          </span>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-12 h-12 flex items-center justify-center rounded-2xl glass-panel text-white hover:bg-white/10 active:scale-95 transition-all duration-300 shadow-lg shadow-black/20 group ml-auto animate-pulse-glow"
          aria-label="Open Navigation Drawer"
        >
          <Menu className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* 3. HERO CONTENT - Refined Typography & Layout */}
      <div className="absolute inset-0 flex items-center z-10 px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-2xl w-full flex flex-col justify-between">
          <div>
            {/* Pre-title with accent line */}
            <div className="flex items-center gap-3 mb-2 animate-float">
              <span className="w-12 h-[2px] bg-emerald-400/60" />
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-white/80">
                {language === "en"
                  ? "Premium Dining"
                  : language === "am"
                    ? "ከፍተኛ ምግብ"
                    : "Nyaata Addaa"}
              </span>
            </div>

            {/* Main Title with enhanced hierarchy */}
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] block leading-none">
                {language === "en"
                  ? "WELCOME TO"
                  : language === "am"
                    ? "እንኳን ደህና መጡ"
                    : "BAGA NAGAAN DHUFTAN"}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                <span className="text-gradient">OROMIA GARDEN</span>
              </h1>
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-wide text-white/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] block">
                RESTAURANT
              </span>
            </div>

            {/* Divider */}
            <div className="w-20 h-[3px] bg-gradient-to-r from-emerald-400 to-transparent my-3 rounded-full" />
          </div>

          <div className="mt-12 sm:mt-16 md:mt-24 space-y-4">
            {/* Subtitle with enhanced presence */}
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-emerald-300/90 leading-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] italic">
              {language === "en"
                ? "What would you like to order?"
                : language === "am"
                  ? "ምን ልታዘዝ?"
                  : "Maal isiniif Dhiheessina?"}
            </p>

            {/* Description - hidden on mobile, visible on larger screens */}
            <p className="hidden md:block text-base lg:text-lg text-white/70 max-w-md leading-relaxed mt-2 glass-panel p-4 rounded-xl">
              {t.subWelcome}
            </p>

            {/* CTA Button - hidden on mobile, visible on larger screens */}
            <button className="hidden md:flex items-center gap-2 px-8 py-3.5 glass-panel rounded-full text-emerald-300 font-medium hover:bg-emerald-500/20 hover:text-white transition-all duration-300 group mt-4">
              <span>{t.cta}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. ENHANCED MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${
          isDrawerOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop with blur */}
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 ${
            isDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* Drawer Panel - Glassmorphism Design */}
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-gradient-to-b from-neutral-900/95 to-neutral-950/95 backdrop-blur-xl text-white p-6 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] border-l border-white/5 flex flex-col ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header with elegant design */}
          <div className="flex justify-between items-center border-b border-white/10 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-wide">
                  Oromia Garden
                </h2>
                <p className="text-xs text-white/40">Fine Dining</p>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all duration-200"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-8 pb-4">
            {/* Language Selector - Enhanced */}
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Language
              </h3>
              <div className="space-y-2">
                {[
                  { code: "en", label: "English", icon: "🇬🇧" },
                  { code: "am", label: "አማርኛ", icon: "🇪🇹" },
                  { code: "or", label: "Afan Oromo", icon: "🌍" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() =>
                      handleLanguageChange(lang.code as "en" | "am" | "or")
                    }
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-medium transition-all duration-200 border ${
                      activeLang === lang.code
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                        : "bg-white/5 text-white/70 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{lang.icon}</span>
                      {lang.label}
                    </span>
                    {activeLang === lang.code && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Info - Enhanced */}
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" /> Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-xs text-white/50">
                      Bole, near Millennium Hall, Addis Ababa
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Contact</p>
                    <p className="text-xs text-white/50">+251 911 00 0000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Hours</p>
                    <p className="text-xs text-white/50">
                      Mon - Sun: 10:00 AM - 11:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating/Feature Badge */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
              <Award className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-sm font-bold">Award Winning Cuisine</p>
                <p className="text-xs text-white/40">
                  Authentic Ethiopian flavors since 2010
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/30">© 2026 Oromia Garden</span>
              <span className="text-white/20 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Digital Menu
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SCROLL INDICATOR - Modern touch */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs font-medium tracking-widest text-white/30 uppercase">
          Scroll
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-emerald-400/50 to-transparent" />
      </div>
    </header>
  );
}
