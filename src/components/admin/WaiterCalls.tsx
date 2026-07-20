"use client";

import React from "react";
import { Bell, Check } from "lucide-react";

interface WaiterCall {
  id: string;
  tableNumber: string;
  createdAt: string | number; 
}

interface WaiterCallsProps {
  calls: WaiterCall[];
  onResolve: (id: string) => void;
}

export default function WaiterCalls({ calls, onResolve }: WaiterCallsProps) {
  if (calls.length === 0) return null;

  return (
    <section className="bg-red-950/20 border border-red-900/40 rounded-3xl p-5 space-y-4">
      <h2 className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
        <Bell className="w-4 h-4 animate-pulse" /> Active Table Calls ({calls.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {calls.map((call) => (
          <div
            key={call.id}
            className="flex items-center justify-between bg-black/45 border border-red-900/30 p-4 rounded-2xl"
          >
            <div>
              <span className="text-xs text-neutral-400 block">TABLE</span>
              <span className="text-lg font-black text-neutral-100">
                Table {call.tableNumber}
              </span>
            </div>
            <button
              onClick={() => onResolve(call.id)}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}