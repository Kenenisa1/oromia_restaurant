"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// Module Components
import PasscodeGuard from "@/components/admin/PasscodeGuard";
import WaiterCalls from "@/components/admin/WaiterCalls";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminDailyStockPage from "@/components/admin/AdminDailyStockPage";
import AdminMenuPage from "@/components/admin/AdminMenuPage";
import AdminQRCodeGenerator from "@/components/admin/AdminQRCodeGenerator";
import PasswordChangeModal from "@/components/admin/PasswordChangeModal";

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
  createdAt: string | number;
}

// Global lookup collection to track spoken notifications across asynchronous rendering loops
const spokenCallIds = new Set<string>();

export default function AdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCalls, setActiveCalls] = useState<WaiterCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "daily-stock" | "menu-items" | "qr-codes"
  >("daily-stock");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fetchAdminMenuItems = async (silent = false) => {
    try {
      if (!silent)
        console.log("🔄 Fetching menu items from /api/menu?category=all");
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
      // FIX: Pointed to the database-backed endpoint
      const res = await fetch("/api/waiter-call");
      if (!res.ok) return;

      const data = await res.json();
      if (data.success && Array.isArray(data.calls)) {
        // FIX: Map the schema's 'tableNo' to the component's expected 'tableNumber'
        const mappedCalls: WaiterCall[] = data.calls.map((call: any) => ({
          id: call.id,
          tableNumber: call.tableNo || "N/A",
          createdAt: call.createdAt,
        }));
        
        // Immediate defensive lookahead loop using our global tracker
        mappedCalls.forEach((incoming) => {
          if (!spokenCallIds.has(incoming.id)) {
            triggerVoiceCall(incoming.id, incoming.tableNumber);
          }
        });

        setActiveCalls(mappedCalls);
      }
    } catch (e) {
      console.log("Active call poll aborted or skipped.");
    }
  };

  const triggerVoiceCall = (id: string, tableNum: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // 1. Instantly register that this tracking key has been verbalized
      spokenCallIds.add(id);

      // 2. Clear out any previous audio queue chunks to prevent backlog stuttering
      window.speechSynthesis.cancel();
      
      const alertPhrase = `ጠረጴዛ ቁጥር ${tableNum} አስተናጋጅ እየጠራ ነው።`;
      const utterance = new SpeechSynthesisUtterance(alertPhrase);
      utterance.lang = "am-ET";
      utterance.rate = 0.90;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleResolveCall = async (id: string) => {
    try {
      // Force cancel speaking streams immediately when the manager asserts resolution
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // FIX: Standardized method logic to cleanly handle inline PUT changes to our schema status fields
      const res = await fetch("/api/waiter-call", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "resolved" }),
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
      fetchAdminMenuItems(true).catch(console.error);
      fetchActiveCalls().catch(console.error);
    }, 3000); // Sync every 3 seconds for near-instant updates

    return () => clearInterval(pollInterval);
  }, [isAuthenticated]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_auth", "true");
        setAuthError("");
        toast.success("Welcome back, manager!");
      } else {
        setAuthError(data.error || "Incorrect passcode. Access Denied.");
        toast.error("Incorrect Passcode!");
      }
    } catch (err) {
      setAuthError("Server error. Please try again later.");
      toast.error("Login failed due to server error.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasscode("");
    sessionStorage.removeItem("admin_auth");
    toast.success("Logged out successfully!");
  };

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
        onSettingsClick={() => setIsPasswordModalOpen(true)}
      />

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        currentPassword={passcode}
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