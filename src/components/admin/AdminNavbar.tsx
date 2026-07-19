"use client";

import React from "react";
import { LogOut } from "lucide-react";

interface AdminNavbarProps {
  activeTab: "daily-stock" | "menu-items" | "qr-codes";
  onTabChange: (tab: "daily-stock" | "menu-items" | "qr-codes") => void;
  onLogout: () => void;
}

export default function AdminNavbar({
  activeTab,
  onTabChange,
  onLogout,
}: AdminNavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5 shadow-xl">
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-4">
          {/* Top Row: Title & Logout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="font-black text-white text-lg">OG</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                  Oromia <span className="text-emerald-400">Admin</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-1 font-bold">
                  Management Portal
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded-xl sm:rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-md border border-rose-500/20"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline text-sm font-bold tracking-wider">LOGOUT</span>
            </button>
          </div>

          {/* Bottom Row: Tab Switchers */}
          <div className="flex bg-neutral-900/50 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => onTabChange("daily-stock")}
              className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${
                activeTab === "daily-stock"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Daily Stock
            </button>
            <button
              onClick={() => onTabChange("menu-items")}
              className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${
                activeTab === "menu-items"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Menu Data
            </button>
            <button
              onClick={() => onTabChange("qr-codes")}
              className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${
                activeTab === "qr-codes"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              QR Codes
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
