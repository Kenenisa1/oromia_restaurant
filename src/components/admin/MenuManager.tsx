"use client";

import { clsx } from "clsx";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  isTrackable: boolean;
  categoryId: string;
  imageUrl?: string | null;
}

interface MenuItemForm {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  stockQuantity: string;
  isTrackable: boolean;
  isAvailable: boolean;
  imageUrl: string;
}

interface InlineDraft {
  price: string;
  stock: string;
}

const emptyForm: MenuItemForm = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  stockQuantity: "0",
  isTrackable: false,
  isAvailable: true,
  imageUrl: "",
};

function getAccent(item: MenuItem) {
  const name = item.name.toLowerCase();
  if (name.includes("tea") || name.includes("coffee") || name.includes("espresso")) {
    return "☕";
  }
  if (name.includes("burger") || name.includes("pizza") || name.includes("sandwich")) {
    return "🍔";
  }
  if (name.includes("juice") || name.includes("drink") || name.includes("cola")) {
    return "🥤";
  }
  if (name.includes("dessert") || name.includes("cake") || name.includes("tiramisu")) {
    return "🍰";
  }
  return "🍽️";
}

function formatPrice(value: number) {
  return `${value.toLocaleString("en-ET")} ETB`;
}

export default function MenuManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<MenuItemForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, InlineDraft>>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/menu");
      if (!response.ok) {
        throw new Error("Unable to load menu");
      }

      const data = await response.json();
      const fetchedCategories = (data.categories ?? []) as Category[];
      const flattenedItems = fetchedCategories.flatMap((category: Category & { items?: MenuItem[] }) =>
        (category.items ?? []).map((item: MenuItem) => ({ ...item, categoryId: item.categoryId || category.id })),
      );

      setCategories(fetchedCategories);
      setItems(flattenedItems);
      setDrafts((prev) => {
        const nextDrafts: Record<string, InlineDraft> = {};
        for (const item of flattenedItems) {
          nextDrafts[item.id] = prev[item.id] ?? {
            price: String(item.price),
            stock: String(item.stockQuantity),
          };
        }
        return nextDrafts;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const categoryNameById = useMemo<Record<string, string>>(() => {
    return Object.fromEntries(categories.map((category) => [category.id, category.name])) as Record<string, string>;
  }, [categories]);

  const lowStockItems = useMemo(() => items.filter((item) => item.stockQuantity > 0 && item.stockQuantity < 5), [items]);
  const soldOutItems = useMemo(() => items.filter((item) => item.stockQuantity === 0), [items]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Unable to upload image");
      }

      const data = await response.json();
      setForm((prev) => ({ ...prev, imageUrl: data.url ?? "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const updateDraft = (itemId: string, field: keyof InlineDraft, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: {
        price: prev[itemId]?.price ?? "",
        stock: prev[itemId]?.stock ?? "",
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        categoryId: form.categoryId || categories[0]?.id || "",
        stockQuantity: Number(form.stockQuantity),
        isTrackable: Boolean(form.isTrackable),
        isAvailable: Boolean(form.isAvailable),
        imageUrl: form.imageUrl || "",
      };

      if (!payload.name || !payload.description || !payload.categoryId || Number.isNaN(payload.price)) {
        throw new Error("Please complete the dish details before saving.");
      }

      const requestOptions = {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };

      const response = await fetch(editingId ? `/api/menu/${editingId}` : "/api/menu", requestOptions);
      if (!response.ok) {
        throw new Error("Unable to save menu item");
      }

      await loadData();
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      categoryId: item.categoryId,
      stockQuantity: String(item.stockQuantity),
      isTrackable: item.isTrackable,
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl ?? "",
    });
    setIsFormOpen(true);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (!response.ok) {
        throw new Error("Unable to update availability");
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  const handleSaveItem = async (item: MenuItem) => {
    const draft = drafts[item.id];
    if (!draft) {
      return;
    }

    const price = Number(draft.price);
    const stock = Number(draft.stock);
    if (Number.isNaN(price) || Number.isNaN(stock)) {
      setError("Please enter valid price and stock values.");
      return;
    }

    setIsSavingId(item.id);
    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, stockQuantity: stock }),
      });
      if (!response.ok) {
        throw new Error("Unable to save item changes");
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsSavingId(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    setIsDeletingId(itemId);
    try {
      const response = await fetch(`/api/menu/${itemId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Unable to delete menu item");
      }
      setDeleteConfirmId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_45%),linear-gradient(135deg,_#030303_0%,_#090909_45%,_#111111_100%)] px-3 py-4 text-zinc-100 sm:px-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex gap-3 overflow-x-auto pb-2 sm:gap-4">
          <div className="min-w-[220px] shrink-0 rounded-[24px] border border-emerald-500/20 bg-zinc-900/80 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_24px_70px_rgba(16,185,129,0.1)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <Sparkles size={18} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Live</span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">{items.length}</p>
            <p className="mt-1 text-sm text-zinc-400">Total dishes</p>
          </div>

          <div className="min-w-[220px] shrink-0 rounded-[24px] border border-amber-500/20 bg-zinc-900/80 p-4 shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_24px_70px_rgba(245,158,11,0.08)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
                <AlertTriangle size={18} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Watch</span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">{lowStockItems.length}</p>
            <p className="mt-1 text-sm text-zinc-400">Need restock</p>
          </div>

          <div className="min-w-[220px] shrink-0 rounded-[24px] border border-rose-500/20 bg-zinc-900/80 p-4 shadow-[0_0_0_1px_rgba(244,63,94,0.08),0_24px_70px_rgba(244,63,94,0.08)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
                <AlertTriangle size={18} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Critical</span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-white">{soldOutItems.length}</p>
            <p className="mt-1 text-sm text-zinc-400">Sold out</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-zinc-800/80 bg-zinc-900/80 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsFormOpen((value) => !value)}
            className="flex w-full items-center justify-between rounded-[22px] border border-zinc-800/80 bg-zinc-950/70 px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">✨ Add New Dish</p>
                <p className="text-xs text-zinc-400">Create a polished menu entry</p>
              </div>
            </div>
            <ChevronDown className={clsx("transition duration-300 text-zinc-400", isFormOpen && "rotate-180")} size={18} />
          </button>

          <div className={clsx("grid transition-all duration-300 ease-out", isFormOpen ? "mt-3 max-h-[1000px] opacity-100" : "max-h-0 opacity-0")}>
            <form onSubmit={handleSubmit} className="space-y-3 rounded-[24px] border border-zinc-800/70 bg-zinc-950/60 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Dish name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="e.g. House Platter"
                    required
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Price</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">ETB</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                      placeholder="180"
                      min="0"
                      required
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3 pl-12 pr-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Describe the dish and its appeal"
                  required
                  className="min-h-24 w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Category</span>
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Food image</span>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full text-sm text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-500/15 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-300"
                  />
                  {isUploadingImage ? (
                    <p className="mt-2 text-xs text-zinc-400">Uploading image...</p>
                  ) : null}
                  {form.imageUrl ? (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800">
                      <img src={form.imageUrl} alt="Selected food" className="h-28 w-full object-cover" />
                    </div>
                  ) : null}
                </div>
              </label>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Initial stock</span>
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(event) => setForm((prev) => ({ ...prev, stockQuantity: event.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3 text-sm text-zinc-300 sm:min-w-[170px]">
                  <span className="font-medium">Track stock</span>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, isTrackable: !prev.isTrackable }))}
                    className={clsx(
                      "relative inline-flex h-7 w-12 items-center rounded-full transition",
                      form.isTrackable ? "bg-emerald-500" : "bg-zinc-700",
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-block h-5 w-5 rounded-full bg-white transition",
                        form.isTrackable ? "translate-x-6" : "translate-x-1",
                      )}
                    />
                  </button>
                </label>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {editingId ? "Update Dish" : "Add Food to Menu"}
                </button>
                {editingId ? (
                  <button type="button" onClick={resetForm} className="rounded-2xl border border-zinc-700 px-3 py-3 text-sm font-semibold text-zinc-300">
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>

        {error ? <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}

        <div className="space-y-3">
          {isLoading ? (
            <div className="rounded-[28px] border border-zinc-800/80 bg-zinc-900/80 p-5 text-sm text-zinc-400 backdrop-blur-md">
              Loading menu from the database...
            </div>
          ) : (
            items.map((item) => {
              const draft = drafts[item.id];
              return (
                <article
                  key={item.id}
                  className={clsx(
                    "rounded-[28px] border border-zinc-800/80 bg-zinc-900/80 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-md transition",
                    !item.isAvailable && "opacity-60",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-950 text-2xl">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{getAccent(item)}</span>
                      )}
                      <span
                        className={clsx(
                          "absolute right-1 top-1 h-2.5 w-2.5 rounded-full",
                          item.isAvailable ? "bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]" : "bg-zinc-500",
                        )}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-[15px] font-semibold text-white">{item.name}</h3>
                        <span className="rounded-full border border-zinc-700/80 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                          {categoryNameById[item.categoryId] ?? "Menu"}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{item.description}</p>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-2 py-1">
                          <button
                            type="button"
                            onClick={() => updateDraft(item.id, "stock", String(Math.max(0, Number(draft?.stock ?? item.stockQuantity) - 1)))}
                            className="rounded-full p-1 text-zinc-300 hover:bg-zinc-800"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={draft?.stock ?? item.stockQuantity}
                            onChange={(event) => updateDraft(item.id, "stock", event.target.value)}
                            className="w-14 bg-transparent text-center text-sm font-semibold text-zinc-100 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateDraft(item.id, "stock", String(Number(draft?.stock ?? item.stockQuantity) + 1))}
                            className="rounded-full p-1 text-zinc-300 hover:bg-zinc-800"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="relative flex-1">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                            ETB
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={draft?.price ?? item.price}
                            onChange={(event) => updateDraft(item.id, "price", event.target.value)}
                            className="h-10 w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 pl-10 pr-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-2 text-zinc-300 transition hover:bg-zinc-800"
                      >
                        {item.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveItem(item)}
                        disabled={isSavingId === item.id}
                        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed"
                      >
                        {isSavingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        disabled={isDeletingId === item.id}
                        className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 transition hover:bg-rose-500/20 disabled:cursor-not-allowed"
                      >
                        {isDeletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {deleteConfirmId ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/70 p-3 sm:items-center sm:justify-center">
          <div className="w-full max-w-sm rounded-[28px] border border-zinc-800/80 bg-zinc-900/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-md">
            <p className="text-sm font-semibold text-white">Delete this dish?</p>
            <p className="mt-1 text-sm text-zinc-400">This action removes it from the live menu immediately.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-2xl border border-zinc-700 px-3 py-3 text-sm font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-2xl bg-rose-500 px-3 py-3 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
