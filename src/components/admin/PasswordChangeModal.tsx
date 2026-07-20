"use client";

import React, { useState } from "react";
import { X, Lock, Check } from "lucide-react";
import toast from "react-hot-toast";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPassword: string;
}

export default function PasswordChangeModal({
  isOpen,
  onClose,
  currentPassword,
}: PasswordChangeModalProps) {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!currentPass || !newPass || !confirmPass) {
      setError("All fields are required");
      return;
    }

    if (newPass.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPass !== confirmPass) {
      setError("Passwords do not match");
      return;
    }

    if (currentPass === newPass) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Password changed successfully!");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
        onClose();
      } else {
        setError(data.message || "Failed to change password");
        toast.error(data.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl border border-white/10 p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Change Password</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
              Current Password
            </label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Enter current password"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/70 text-white placeholder:text-neutral-600 transition-all disabled:opacity-50"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Enter new password"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/70 text-white placeholder:text-neutral-600 transition-all disabled:opacity-50"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Confirm new password"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/70 text-white placeholder:text-neutral-600 transition-all disabled:opacity-50"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
              <p className="text-xs text-rose-400 font-semibold">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
