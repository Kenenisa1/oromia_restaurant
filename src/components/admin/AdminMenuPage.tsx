"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import MenuFormModal from "./MenuFormModal";

interface Category {
  id: string;
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

interface AdminMenuPageProps {
  items: MenuItem[];
  categories: Category[];
  onFetchItems: () => Promise<void>;
}

export default function AdminMenuPage({
  items,
  categories,
  onFetchItems,
}: AdminMenuPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id || "",
  );

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleToggleVisibility = async (item: MenuItem) => {
    const toastId = toast.loading(
      item.isAvailable ? "Hiding item..." : "Showing item...",
    );
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          item.isAvailable
            ? `"${item.nameEN}" hidden from menu.`
            : `"${item.nameEN}" is now visible.`,
          { id: toastId },
        );
        await onFetchItems();
      } else {
        toast.error(data.error || "Could not update visibility.", {
          id: toastId,
        });
      }
    } catch {
      toast.error("Failed to connect to the server.", { id: toastId });
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" permanently?`))
      return;

    const deleteToastId = toast.loading("Deleting item...");
    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Item permanently deleted!", { id: deleteToastId });
        await onFetchItems();
      } else {
        toast.error(data.error || "Could not delete item", {
          id: deleteToastId,
        });
      }
    } catch (error) {
      toast.error("Failed to connect to the server.", { id: deleteToastId });
    }
  };

  const filteredItems = items.filter(
    (item) => item.categoryId === activeCategory,
  );
  const getCategoryName = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    return cat?.nameEN || "Unknown";
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Header with Add Button */}
      <div className="glass-card rounded-[28px] p-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white">Menu Management</h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {items.length} total items across {categories.length} categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Category Tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 bg-neutral-900/50 p-1.5 rounded-2xl border border-white/5 w-fit min-w-full sm:w-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-200 ${
                activeCategory === category.id
                  ? "bg-emerald-500 text-neutral-950 shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {category.nameEN}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-black text-emerald-400">
            {getCategoryName(activeCategory)} Menu
          </h2>
          <p className="text-xs text-neutral-400 font-bold bg-white/5 px-3 py-1 rounded-full">
            {filteredItems.length} ITEM{filteredItems.length !== 1 ? "S" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-[24px] p-4 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md">
                    <img
                      src={item.imageUrl}
                      alt={item.nameEN}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-base truncate">
                      {item.nameEN}
                    </h3>
                    <p className="text-[10px] font-bold text-neutral-500 truncate mt-0.5">
                      {item.nameAM} • {item.nameOR}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {item.price} ETB
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          item.isAvailable
                            ? "bg-white/10 text-white"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {item.isAvailable ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">
                        Stock
                      </p>
                      <p
                        className={`text-sm font-black ${item.stockQuantity > 0 ? "text-emerald-300" : "text-rose-400"}`}
                      >
                        {item.stockQuantity}
                      </p>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="text-center">
                      <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">
                        Sold
                      </p>
                      <p className="text-sm font-black text-white">
                        {item.totalSold}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                      title="Edit item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(item)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        item.isAvailable
                          ? "glass-panel text-neutral-400 hover:bg-amber-500/20 hover:text-amber-300"
                          : "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-neutral-950"
                      }`}
                      title={
                        item.isAvailable ? "Hide from menu" : "Show on menu"
                      }
                    >
                      {item.isAvailable ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.nameEN)}
                      className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-[32px] glass-panel p-10 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-neutral-500" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">
                No items yet
              </h3>
              <p className="text-sm text-neutral-400 font-medium mb-6">
                This category is currently empty.
              </p>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsFormOpen(true);
                }}
                className="px-6 py-3 bg-emerald-500 text-neutral-950 font-black rounded-full text-sm uppercase tracking-wide hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
              >
                Add First Item
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Menu Form Modal */}
      {isFormOpen && (
        <MenuFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
          categories={categories}
          onSubmitSuccess={onFetchItems}
        />
      )}
    </div>
  );
}
