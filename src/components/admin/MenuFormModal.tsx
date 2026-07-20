"use client";

import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { toast } from "react-hot-toast";

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
}

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MenuItem | null;
  categories: Category[];
  onSubmitSuccess: () => void;
}

export default function MenuFormModal({
  isOpen,
  onClose,
  editingItem,
  categories,
  onSubmitSuccess,
}: MenuFormModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    nameEN: editingItem?.nameEN || "",
    nameAM: editingItem?.nameAM || "",
    nameOR: editingItem?.nameOR || "",
    price: editingItem?.price.toString() || "",
    imageUrl: editingItem?.imageUrl || "",
    categoryId: editingItem?.categoryId || (categories[0]?.id || ""),
    subCategory: editingItem?.subCategory || "all",
  });

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploaderData = new FormData();
    uploaderData.append("file", file);

    const uploadToastId = toast.loading("Uploading image asset...");

    try {
      // Fixed endpoint route path to use the newly created /api/upload stream route
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploaderData,
      });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        toast.success("Image uploaded successfully to cloud!", { id: uploadToastId });
      } else {
        toast.error(data.error || "Upload failed", { id: uploadToastId });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Server connection failed during upload.", { id: uploadToastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const saveToastId = toast.loading("Saving item details...");

    try {
      const endpoint = editingItem ? `/api/menu/${editingItem.id}` : "/api/menu";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingItem ? "Item updated successfully!" : "Item created successfully!", { id: saveToastId });
        onSubmitSuccess();
        onClose();
      } else {
        toast.error("Operation failed: " + data.error, { id: saveToastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred saving changes.", { id: saveToastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral-950 border border-neutral-800 w-full max-w-lg rounded-3xl p-6 z-10 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-neutral-900">
          <h2 className="text-lg font-black text-white">
            {editingItem ? "Edit Menu Item" : "Create Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Multilingual Names */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-neutral-500 font-black uppercase tracking-wider block mb-1.5">
                Name (EN)
              </label>
              <input
                type="text"
                required
                value={formData.nameEN}
                onChange={(e) => setFormData((p) => ({ ...p, nameEN: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800/80 rounded-xl focus:outline-none focus:border-emerald-500 text-sm text-neutral-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 font-black uppercase tracking-wider block mb-1.5">
                Name (AM)
              </label>
              <input
                type="text"
                value={formData.nameAM}
                onChange={(e) => setFormData((p) => ({ ...p, nameAM: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800/80 rounded-xl focus:outline-none focus:border-emerald-500 text-sm text-neutral-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 font-black uppercase tracking-wider block mb-1.5">
                Name (OR)
              </label>
              <input
                type="text"
                value={formData.nameOR}
                onChange={(e) => setFormData((p) => ({ ...p, nameOR: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800/80 rounded-xl focus:outline-none focus:border-emerald-500 text-sm text-neutral-100"
              />
            </div>
          </div>

          {/* Pricing, Category, Sub-Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-neutral-500 font-black uppercase tracking-wider block mb-1.5">
                Price (ETB)
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800/80 rounded-xl focus:outline-none focus:border-emerald-500 text-sm text-neutral-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 font-black uppercase tracking-wider block mb-1.5">
                Main Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800/80 rounded-xl focus:outline-none focus:border-emerald-500 text-sm text-neutral-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEN}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 font-black uppercase tracking-wider block mb-1.5">
                Sub-Category
              </label>
              <select
                value={formData.subCategory}
                onChange={(e) => setFormData((p) => ({ ...p, subCategory: e.target.value }))}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800/80 rounded-xl focus:outline-none focus:border-emerald-500 text-sm text-neutral-100"
              >
                <option value="all">None</option>
                <option value="common">Common (All Day)</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Snack</option>
                <option value="dinner">Dinner</option>
                <option value="cold">Cold Drink</option>
                <option value="hot">Hot Drink</option>
              </select>
            </div>
          </div>

          {/* Image Asset Path / Upload */}
          <div className="space-y-2">
            <label className="text-[10px] text-neutral-500 font-black uppercase tracking-wider block">
              Image Asset URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Cloud URL auto-populates here..."
                value={formData.imageUrl}
                onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
                className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800/80 rounded-xl focus:outline-none focus:border-emerald-500 text-sm text-neutral-100"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="upload-file-trigger"
                />
                <label
                  htmlFor="upload-file-trigger"
                  className="cursor-pointer flex items-center justify-center px-4 py-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800/60 rounded-xl text-xs font-bold text-neutral-300 select-none whitespace-nowrap h-full transition-colors"
                >
                  {isUploading ? "Uploading..." : "Upload File"}
                </label>
              </div>
            </div>
          </div>

          {/* Form Control Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-900">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-xl text-xs font-black uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 rounded-xl text-xs font-black uppercase transition-colors"
            >
              <Save className="w-4 h-4" /> Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}