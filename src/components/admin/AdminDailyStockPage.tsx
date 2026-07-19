"use client";

import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Edit2, Trash2, X, Check } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  nameEN: string;
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

interface DailyStockPageProps {
  items: MenuItem[];
  categories: Category[];
  onFetchItems: () => Promise<void>;
}

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Food", value: "food" },
  { label: "Drinks", value: "drinks" },
  { label: "Special", value: "special" },
];

export default function AdminDailyStockPage({
  items,
  categories,
  onFetchItems,
}: DailyStockPageProps) {
  const [stockInputs, setStockInputs] = useState<{ [id: string]: string }>({});
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [confirmingSell, setConfirmingSell] = useState<string | null>(null);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>("");

  const categorySlugById = useMemo(
    () =>
      categories.reduce((acc, category) => {
        acc[category.id] = category.slug;
        return acc;
      }, {} as Record<string, string>),
    [categories],
  );

  const filteredItems = useMemo(() => {
    if (selectedFilter === "all") return items;
    return items.filter(
      (item) => categorySlugById[item.categoryId] === selectedFilter,
    );
  }, [items, categorySlugById, selectedFilter]);

  const totalStock = useMemo(() => items.reduce((sum, i) => sum + i.stockQuantity, 0), [items]);
  const totalValue = useMemo(() => items.reduce((sum, i) => sum + i.stockQuantity * i.price, 0), [items]);
  const totalSoldToday = useMemo(() => items.reduce((sum, i) => sum + i.totalSoldToday, 0), [items]);
  const totalRevenueToday = useMemo(() => items.reduce((sum, i) => sum + i.totalSoldToday * i.price, 0), [items]);

  // Open modal: snapshot current DB values - NOT linked to polling updates
  const handleOpenStockModal = () => {
    const snapshot: { [id: string]: string } = {};
    items.forEach((item) => {
      snapshot[item.id] = String(item.stockQuantity);
    });
    setStockInputs(snapshot);
    setIsStockModalOpen(true);
  };

  const handleSaveStock = async () => {
    setIsBusy(true);
    try {
      const stockData: Record<string, number> = {};
      items.forEach((item) => {
        const raw = stockInputs[item.id] ?? "";
        const parsed = raw === "" || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
        stockData[item.id] = parsed;
      });

      const res = await fetch("/api/admin/daily-report", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockData }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not save.");
      toast.success("Stock updated!");
      setIsStockModalOpen(false);
      await onFetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveInlineEdit = async (item: MenuItem) => {
    const val = parseInt(editingStockValue, 10);
    if (isNaN(val) || val < 0) { toast.error("Enter a valid number."); return; }
    setIsBusy(true);
    try {
      const res = await fetch("/api/admin/daily-report", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockData: { [item.id]: val } }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not update.");
      toast.success(`${item.nameEN} → ${val} units`);
      setEditingStockId(null);
      await onFetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteStock = async (item: MenuItem) => {
    setIsBusy(true);
    try {
      const res = await fetch("/api/admin/daily-report", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockData: { [item.id]: 0 } }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not clear.");
      toast.success(`${item.nameEN} cleared.`);
      await onFetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Clear failed.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleSellClick = (item: MenuItem) => {
    if (item.stockQuantity <= 0) return;
    if (confirmingSell !== item.id) {
      setConfirmingSell(item.id);
      setTimeout(() => setConfirmingSell((c) => (c === item.id ? null : c)), 3000);
      return;
    }
    setConfirmingSell(null);
    executeSell(item);
  };

  const executeSell = async (item: MenuItem) => {
    setIsBusy(true);
    try {
      const res = await fetch("/api/admin/menu/sell", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not deduct.");
      toast.custom(
        (t) => (
          <div className="flex items-center justify-between gap-4 rounded-2xl glass-card bg-neutral-900/90 p-4 shadow-xl border border-white/10">
            <span className="text-sm font-bold text-white">Sold 1 <span className="text-emerald-400">{item.nameEN}</span></span>
            <button
              onClick={async () => { toast.dismiss(t.id); await handleUndoSale(item); }}
              className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider hover:bg-rose-500 hover:text-white transition"
            >Undo</button>
          </div>
        ),
        { duration: 4000 },
      );
      await onFetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sell failed.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleUndoSale = async (item: MenuItem) => {
    setIsBusy(true);
    try {
      const res = await fetch("/api/admin/menu/unsell", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not restore.");
      toast.success("Order reversed.");
      await onFetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Undo failed.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleCloseDailyStock = async () => {
    if (!confirm("Close daily stock?")) return;
    setIsBusy(true);
    try {
      const res = await fetch("/api/admin/daily-report", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not close.");
      toast.success("Daily stock closed.");
      await onFetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Close failed.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Stats */}
      <section className="glass-card rounded-[28px] p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Total Stock</p>
            <p className="text-xl font-black text-white">{totalStock}</p>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3">
            <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Stock Value</p>
            <p className="text-xl font-black text-emerald-400">{totalValue.toLocaleString()} <span className="text-xs">ETB</span></p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Sold Today</p>
            <p className="text-xl font-black text-white">{totalSoldToday}</p>
          </div>
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-[9px] uppercase tracking-widest text-amber-400 font-bold mb-1">Revenue</p>
            <p className="text-xl font-black text-amber-400">{totalRevenueToday.toLocaleString()} <span className="text-xs">ETB</span></p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedFilter(opt.value)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedFilter === opt.value
                    ? "bg-white text-neutral-950 shadow"
                    : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >{opt.label}</button>
            ))}
          </div>
          <button
            onClick={handleOpenStockModal}
            className="shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-neutral-950 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
          >+ Stock</button>
        </div>
      </section>

      {/* Stock Item List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl glass-panel p-8 text-center text-neutral-400 text-sm">No items in this category.</div>
        ) : (
          filteredItems.map((item) => {
            const isConfirming = confirmingSell === item.id;
            const isDepleted = item.stockQuantity <= 0;
            const isEditing = editingStockId === item.id;

            return (
              <div key={item.id} className={`glass-card rounded-2xl px-4 py-3 flex items-center gap-3 transition-all ${isDepleted ? "opacity-60" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-sm truncate">{item.nameEN}</p>
                  <p className="text-[10px] text-neutral-500">{item.price} ETB each &bull; Sold today: {item.totalSoldToday}</p>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      autoFocus
                      type="number"
                      min="0"
                      value={editingStockValue}
                      onChange={(e) => setEditingStockValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveInlineEdit(item);
                        if (e.key === "Escape") setEditingStockId(null);
                      }}
                      className="w-16 rounded-xl border border-emerald-500/40 bg-black/60 px-2 py-1.5 text-center text-sm font-black text-white outline-none focus:border-emerald-400"
                    />
                    <button onClick={() => handleSaveInlineEdit(item)} disabled={isBusy}
                      className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-neutral-950 hover:bg-emerald-400 transition">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingStockId(null)}
                      className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-neutral-400 hover:bg-white/10 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-lg font-black min-w-[2rem] text-center ${isDepleted ? "text-rose-400" : "text-emerald-400"}`}>
                      {item.stockQuantity}
                    </span>
                    <button
                      onClick={() => { setEditingStockId(item.id); setEditingStockValue(String(item.stockQuantity)); }}
                      className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center text-neutral-400 hover:text-emerald-400 transition"
                      title="Edit stock">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStock(item)}
                      disabled={isBusy || isDepleted}
                      className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition disabled:opacity-30"
                      title="Clear stock">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSellClick(item)}
                      disabled={isDepleted || isBusy}
                      className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide transition-all duration-200 min-w-[72px] ${
                        isDepleted ? "bg-neutral-900 border border-neutral-800 text-neutral-600 cursor-not-allowed"
                        : isConfirming ? "bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-neutral-950"
                      }`}>
                      {isDepleted ? "Empty" : isConfirming ? "Confirm?" : "− Sell"}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button onClick={handleCloseDailyStock} disabled={isBusy}
          className="rounded-full bg-rose-500/10 border border-rose-500/30 px-6 py-3 text-xs font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500 hover:text-white transition disabled:opacity-40">
          Close Daily Stock
        </button>
      </div>

      {/* Morning Stock Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md sm:p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-t-[36px] sm:rounded-[32px] glass-card bg-neutral-950/95 p-5 sm:p-8 max-h-[90vh] flex flex-col slide-up-animation border-t border-white/10">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-black text-white">Set Morning Stock</h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">Enter quantities for each item.</p>
              </div>
              <button onClick={() => setIsStockModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="truncate pr-4">
                    <p className="font-bold text-sm text-white truncate">{item.nameEN}</p>
                    <p className="text-[10px] text-emerald-400">{item.price} ETB</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={stockInputs[item.id] ?? ""}
                    onChange={(e) =>
                      setStockInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    className="w-20 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-right text-sm font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4">
              <button onClick={handleSaveStock} disabled={isBusy}
                className="w-full rounded-full bg-emerald-500 py-4 text-sm font-black uppercase tracking-widest text-neutral-950 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition disabled:opacity-50">
                {isBusy ? "Saving..." : "Save Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
