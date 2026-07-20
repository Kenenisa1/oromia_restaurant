"use client";

import React from "react";
import { Lock, Shield } from "lucide-react";

interface PasscodeGuardProps {
  passcode: string;
  setPasscode: (val: string) => void;
  authError: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PasscodeGuard({
  passcode,
  setPasscode,
  authError,
  onSubmit,
}: PasscodeGuardProps) {
  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-emerald-700/10 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-xs glass-card rounded-[32px] p-8 text-center space-y-7 border border-white/10 shadow-2xl shadow-black/50 relative z-10">
        {/* Brand + Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Oromia <span className="text-emerald-400">Admin</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              Secure Manager Access
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            <input
              type="password"
              placeholder="Enter password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full text-center tracking-[0.5em] text-lg font-black pl-10 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-emerald-500/70 focus:bg-black/60 text-neutral-100 placeholder:tracking-normal placeholder:text-neutral-600 transition-all"
              required
            />
          </div>

          {authError && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
              <p className="text-[11px] text-rose-400 font-bold uppercase tracking-widest">
                {authError}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/25 active:scale-95 hover:scale-105 transition-all duration-200"
          >
            Unlock Portal
          </button>
        </form>

        <p className="text-[10px] text-neutral-600 font-medium">
          Oromia Garden Restaurant • Manager Only
        </p>
      </div>
    </main>
  );
}
