"use client";

import React, { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const DEFAULT_TABLE = "1";

export default function AdminQRCodeGenerator() {
  const [tableNumber, setTableNumber] = useState(DEFAULT_TABLE);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const qrValue = useMemo(() => {
    const domain = origin || "https://yourdomain.com";
    return `${domain}/?table=${encodeURIComponent(tableNumber)}`;
  }, [origin, tableNumber]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-[28px] border border-white/10 shadow-xl shadow-emerald-500/10 print:hidden">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-black text-white">QR Code Generator</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Print QR codes for restaurant tables and let guests open the menu directly.
            </p>
          </div>

          <label className="grid gap-2 text-sm font-bold text-neutral-200">
            Table number
            <input
              type="number"
              min={1}
              value={tableNumber}
              onChange={(event) => setTableNumber(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
            <div className="glass-panel rounded-3xl p-4 text-sm text-neutral-200">
              <p className="font-bold text-emerald-300">Preview QR target</p>
              <p className="mt-2 break-all">{qrValue}</p>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-400 active:scale-95"
            >
              Print QR Code
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 items-center">
            <div className="rounded-3xl bg-white/5 p-4 text-sm text-neutral-300">
              <p className="font-bold text-white">Instructions</p>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-xs text-neutral-400">
                <li>Choose or type a table number.</li>
                <li>Click <span className="font-black text-white">Print QR Code</span>.</li>
                <li>Use the printed label at the guest table.</li>
              </ol>
            </div>

            <div className="rounded-3xl bg-white/5 p-4 text-sm text-neutral-300">
              <p className="font-bold text-white">Label output</p>
              <p className="mt-2 text-xs text-neutral-400">
                This prints a high-contrast QR image with a direct table query parameter. Guests scan it to open the menu automatically for that table.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden print:flex items-center justify-center min-h-screen px-6 py-10 bg-white print:bg-white w-full">
        <div className="print-card flex flex-col items-center justify-center rounded-[32px] border border-black/10 bg-white p-8 shadow-lg shadow-black/5" style={{ width: 340 }}>
          <div className="mb-5 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Oromia Restaurant</p>
            <h1 className="mt-3 text-2xl font-black text-neutral-950">Table {tableNumber}</h1>
          </div>

          <QRCodeSVG
            value={qrValue}
            size={280}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            className="rounded-3xl border border-neutral-200 bg-white"
          />

          <p className="mt-5 text-center text-sm text-neutral-700">
            Scan to open the menu for Table {tableNumber}.
          </p>
        </div>
      </div>
    </div>
  );
}
