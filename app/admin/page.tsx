"use client";

import React, { useEffect, useState } from "react";
import { ADMIN_PASSCODE } from "@/lib/adminConfig";
import { toast } from "react-hot-toast";

// Module Components
import PasscodeGuard from "@/components/admin/PasscodeGuard";
import WaiterCalls from "@/components/admin/WaiterCalls";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminDailyStockPage from "@/components/admin/AdminDailyStockPage";
import AdminMenuPage from "@/components/admin/AdminMenuPage";
import AdminQRCodeGenerator from "@/components/admin/AdminQRCodeGenerator";

interface Category {
  id: string;
  nameEN: string;
  slug: string;
}

interface MenuItem {
  id: string;
  nameEN: string;
  nameAM: string;
  nameOR: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  totalSold: number;
  subCategory: string;
  categoryId: string;
  stockQuantity: number;
  morningStock: number;
  totalSoldToday: number;
}

interface WaiterCall {
  id: string;
  tableNumber: string;
  createdAt: number;
}

export default function AdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCalls, setActiveCalls] = useState<WaiterCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"daily-stock" | "menu-items" | "qr-codes">(
    "daily-stock"
  );

  const fetchAdminMenuItems = async (silent = false) => {
    try {
      if (!silent) console.log("🔄 Fetching menu items from /api/menu?category=all");
      const res = await fetch("/api/menu?category=all");
      if (!res.ok) throw new Error("Server returned non-200");
      const data = await res.json();

      if (data.success && Array.isArray(data.menuItems)) {
        const freshItems = data.menuItems.map((item: MenuItem) => ({
          ...item,
          stockQuantity: Number.isNaN(Number(item.stockQuantity))
            ? 0
            : Number(item.stockQuantity),
          morningStock: Number.isNaN(Number(item.morningStock))
            ? 0
            : Number(item.morningStock),
          totalSoldToday: Number.isNaN(Number(item.totalSoldToday))
            ? 0
            : Number(item.totalSoldToday),
          price: Number.isNaN(Number(item.price)) ? 0 : Number(item.price),
        }));

        if (!silent) console.log("✅ Fetched items:", freshItems.length);
        setItems(freshItems);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } else {
        if (!silent) console.warn("⚠️ Unexpected menu data shape", data);
        setItems([]);
        setCategories([]);
      }
    } catch (e) {
      if (!silent) {
        console.error("Fetch catalog error:", e);
        toast.error("Failed to sync client items catalog.");
      }
    }
  };

  const fetchActiveCalls = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;

      const data = await res.json();
      if (data.success) {
        const newCalls: WaiterCall[] = data.calls || [];
        setActiveCalls((prev) => {
          newCalls.forEach((incoming) => {
            if (!prev.some((existing) => existing.id === incoming.id)) {
              triggerVoiceCall(incoming.tableNumber);
            }
          });
          return newCalls;
        });
      }
    } catch (e) {
      console.log("Active call poll aborted or skipped.");
    }
  };

  const triggerVoiceCall = (tableNum: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const alertPhrase = `Table number ${tableNum} is calling the waiter.`;
      const utterance = new SpeechSynthesisUtterance(alertPhrase);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleResolveCall = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveCalls((prev) => prev.filter((call) => call.id !== id));
        toast.success("Table call resolved!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Safe Double-Tap Real-time Manual Sale Logging - MOVED TO AdminDailyStockPage

  // Morning Inventory Stock Setup - MOVED TO AdminDailyStockPage

  // Daily Closeout Ledger Trigger - MOVED TO AdminDailyStockPage

  // Check if already authenticated from previous session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Initial data load on component mount
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        await fetchAdminMenuItems();
        await fetchActiveCalls();
      } catch (err) {
        console.error("Initial data load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // Real-time silent sync (simulates socket updates for the frontend)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const pollInterval = setInterval(() => {
      // Silently fetch items without triggering full-page loading spinner
      fetchAdminMenuItems(true).catch(console.error);
      fetchActiveCalls().catch(console.error);
    }, 3000); // Sync every 3 seconds for near-instant updates

    return () => clearInterval(pollInterval);
  }, [isAuthenticated]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setAuthError("");
      toast.success("Welcome back, manager!");
    } else {
      setAuthError("Incorrect passcode. Access Denied.");
      toast.error("Incorrect Passcode!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasscode("");
    sessionStorage.removeItem("admin_auth");
    toast.success("Logged out successfully!");
  };

  // No duplicate polling effect needed here; the watcher above handles it.

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-500 mt-4">Loading Admin Space...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <PasscodeGuard
        passcode={passcode}
        setPasscode={setPasscode}
        authError={authError}
        onSubmit={handleLoginSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Admin Navbar */}
      <AdminNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {/* Waiter Calls Notifications */}
        <WaiterCalls calls={activeCalls} onResolve={handleResolveCall} />

        {/* Tab Content */}
        <div>
          {activeTab === "daily-stock" && (
            <AdminDailyStockPage
              items={items}
              categories={categories}
              onFetchItems={fetchAdminMenuItems}
            />
          )}

          {activeTab === "menu-items" && (
            <AdminMenuPage
              items={items}
              categories={categories}
              onFetchItems={fetchAdminMenuItems}
            />
          )}

          {activeTab === "qr-codes" && <AdminQRCodeGenerator />}
        </div>
      </main>
    </div>
  );
}
