"use client";

import { clsx } from "clsx";
import { CheckCircle2, Minus, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  priceAtOrder: number;
  quantity: number;
}

function formatPrice(value: number) {
  return `${value.toLocaleString("en-ET")} ETB`;
}

export default function OrderCalculator() {
  const [selectedTable, setSelectedTable] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [serviceChargePercent, setServiceChargePercent] = useState(10);
  const [applyServiceCharge, setApplyServiceCharge] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await fetch("/api/menu");
        if (!response.ok) {
          throw new Error("Unable to load menu");
        }
        const data = await response.json();
        const items = (data.categories ?? []).flatMap((category: { items: Array<{ id: string; name: string; description: string; price: number; stockQuantity: number }> }) =>
          category.items.map((item) => ({ id: item.id, name: item.name, description: item.description, price: item.price, stock: item.stockQuantity })),
        );
        setMenuItems(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMenu();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return menuItems;
    }

    const query = searchQuery.toLowerCase();
    return menuItems.filter((item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
  }, [menuItems, searchQuery]);

  const billDetails = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.quantity * item.priceAtOrder, 0);
    const serviceCharge = applyServiceCharge ? subtotal * (serviceChargePercent / 100) : 0;
    const total = subtotal + serviceCharge;

    return { subtotal, serviceCharge, total };
  }, [applyServiceCharge, orderItems, serviceChargePercent]);

  const addItemToOrder = (itemId: string) => {
    const menuItem = menuItems.find((item) => item.id === itemId);
    if (!menuItem || menuItem.stock === 0) {
      return;
    }

    setOrderItems((prev) => {
      const existing = prev.find((item) => item.menuItemId === itemId);
      if (existing) {
        return prev.map((item) => (item.menuItemId === itemId ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...prev, { menuItemId: itemId, name: menuItem.name, priceAtOrder: menuItem.price, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prev) => prev.filter((item) => item.menuItemId !== itemId));
      return;
    }

    setOrderItems((prev) => prev.map((item) => (item.menuItemId === itemId ? { ...item, quantity } : item)));
  };

  const removeItemFromOrder = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.menuItemId !== itemId));
  };

  const confirmOrder = async () => {
    if (orderItems.length === 0) {
      return;
    }

    setIsConfirming(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: selectedTable,
          items: orderItems,
          serviceChargePercent,
          applyServiceCharge,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create order");
      }

      setConfirmSuccess(true);
      setOrderItems([]);
      window.setTimeout(() => setConfirmSuccess(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      <div className="border-b border-emerald-500/20 bg-zinc-950/95 px-4 py-4 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-400">Waiter Panel</p>
            <h1 className="text-xl font-semibold text-white">Order Calculator</h1>
          </div>
          <div className="rounded-full bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300">
            Table {selectedTable}
          </div>
        </div>

        <div className="mb-3">
          <p className="mb-2 text-sm font-semibold text-zinc-300">Select table</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((tableNumber) => (
              <button
                key={tableNumber}
                onClick={() => setSelectedTable(tableNumber)}
                className={clsx(
                  "flex-shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition",
                  selectedTable === tableNumber
                    ? "bg-emerald-500 text-zinc-950"
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                )}
              >
                Table {tableNumber}
              </button>
            ))}
          </div>
        </div>

        <label className="relative mb-4 block">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search menu items"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-emerald-500"
          />
        </label>

        <div className="space-y-2">
          {isLoading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3 text-sm text-zinc-400">Loading menu...</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-zinc-900/80 px-3 py-3 text-sm text-red-400">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3 text-sm text-zinc-400">No menu items found.</div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{item.name}</p>
                <p className="text-sm text-zinc-400">{formatPrice(item.price)}</p>
              </div>
              <button
                onClick={() => addItemToOrder(item.id)}
                disabled={item.stock === 0}
                className={clsx(
                  "rounded-full px-3 py-2 text-sm font-semibold transition",
                  item.stock === 0
                    ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                    : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400",
                )}
              >
                Add
              </button>
            </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Active Bill</h2>
            <span className="text-sm text-zinc-400">{orderItems.length} items</span>
          </div>

          {orderItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">No items added yet.</div>
          ) : (
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.menuItemId} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-sm text-zinc-400">{formatPrice(item.priceAtOrder)}</p>
                    </div>
                    <button onClick={() => removeItemFromOrder(item.menuItemId)} className="text-red-400 transition hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1">
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="rounded-full p-1 hover:bg-zinc-800">
                        <Minus size={14} />
                      </button>
                      <span className="min-w-5 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="rounded-full p-1 hover:bg-zinc-800">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">{formatPrice(item.quantity * item.priceAtOrder)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4">
          <label className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-3">
            <span className="text-sm font-semibold text-zinc-300">Service charge</span>
            <input
              type="checkbox"
              checked={applyServiceCharge}
              onChange={(event) => setApplyServiceCharge(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 accent-emerald-500"
            />
          </label>

          {applyServiceCharge && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
                <span>Tax/Service</span>
                <span>{serviceChargePercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={serviceChargePercent}
                onChange={(event) => setServiceChargePercent(Number(event.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Subtotal</span>
              <span>{formatPrice(billDetails.subtotal)}</span>
            </div>
            {applyServiceCharge && (
              <div className="flex items-center justify-between text-zinc-400">
                <span>Service charge ({serviceChargePercent}%)</span>
                <span>+ {formatPrice(billDetails.serviceCharge)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-zinc-800 pt-3 text-base font-semibold text-zinc-100">
              <span>Total</span>
              <span className="text-2xl font-bold text-emerald-400">{formatPrice(billDetails.total)}</span>
            </div>
          </div>

          <button
            onClick={confirmOrder}
            disabled={orderItems.length === 0 || isConfirming}
            className={clsx(
              "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold transition",
              confirmSuccess
                ? "bg-emerald-600 text-white"
                : orderItems.length === 0 || isConfirming
                  ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                  : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400",
            )}
          >
            {confirmSuccess ? (
              <>
                <CheckCircle2 size={18} />
                Confirmed
              </>
            ) : isConfirming ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Confirm & Deduct Stock
              </>
            )}
          </button>
        </section>
      </div>
    </div>
  );
}
