"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND = "http://localhost:4000";

type Wallet = {
  id: string;
  commitment: string;
  balance: number;
  createdAt?: string;
};

export default function WalletPage() {
  const [secret, setSecret] = useState("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"create" | "unlock">("create");

  const handleSubmit = async () => {
    if (!secret || secret.length < 8) {
      setError("Secret must be at least 8 characters long.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (mode === "create") {
        const res = await fetch(`${BACKEND}/api/wallet/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("zk_secret", secret);
          window.location.href = "/user/dashboard";
        } else setError(data.message || "Failed to create wallet.");
      } else {
        const res = await fetch(`${BACKEND}/api/wallet/balance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("zk_secret", secret);
          window.location.href = "/user/dashboard";
        }
        else setError(data.message || "Wallet not found for this secret.");
      }
    } catch {
      setError("Cannot connect to backend. Make sure the backend is running on port 4000.");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", position: "relative", overflow: "hidden" }}>
      {/* Orbs */}
      <div className="orb orb-purple" style={{ width: 500, height: 500, top: -100, left: -100 }} />
      <div className="orb orb-cyan"   style={{ width: 350, height: 350, bottom: 50, right: 0 }} />

      <div className="page-container" style={{ position: "relative", zIndex: 1, paddingTop: 60, paddingBottom: 80 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="badge badge-purple" style={{ marginBottom: 16, display: "inline-flex" }}>🔐 Anonymous Wallet</span>
          <h1 style={{ fontSize: 52, fontWeight: 900, marginBottom: 14 }}>
            Your <span className="text-gradient-purple">ZK Wallet</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto" }}>
            Enter a secret phrase to create or access your anonymous wallet. Your secret never leaves your device.
          </p>
        </motion.div>

        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          {/* Mode Toggle */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div style={{
              display: "flex", gap: 6, padding: 6, background: "rgba(255,255,255,0.04)",
              borderRadius: 12, border: "1px solid var(--border-subtle)", marginBottom: 28,
            }}>
              {["create", "unlock"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m as "create" | "unlock"); setWallet(null); setError(""); }}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 600,
                    background: mode === m ? "linear-gradient(135deg, #8b5cf6, #6d28d9)" : "transparent",
                    color: mode === m ? "#fff" : "var(--text-muted)",
                    boxShadow: mode === m ? "0 4px 14px rgba(139,92,246,0.3)" : "none",
                    transition: "all 0.2s",
                    border: "none", cursor: "pointer",
                  }}
                >
                  {m === "create" ? "✨ Create Wallet" : "🔓 Unlock Wallet"}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass glow-purple" style={{ padding: 36 }}>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Secret Phrase</label>
              <input
                type="password"
                placeholder="Enter your secret phrase (min. 8 chars)"
                value={secret}
                onChange={(e) => { setSecret(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{ fontSize: 15, padding: "14px 18px" }}
              />
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                💡 This secret is hashed locally. The server only sees your commitment hash.
              </div>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: "100%", padding: "14px", fontSize: 16, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "⏳ Processing..." : mode === "create" ? "🚀 Create Wallet" : "🔓 Unlock Wallet"}
            </button>
          </motion.div>

          {/* Wallet Result */}
          <AnimatePresence>
            {wallet && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="glass glow-cyan"
                style={{ marginTop: 24, padding: 32, border: "1px solid rgba(6,182,212,0.25)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))",
                    border: "1px solid rgba(6,182,212,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>💎</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Wallet Active</div>
                    <div style={{ fontSize: 12, color: "var(--neon-green)" }}>✓ Successfully {mode === "create" ? "created" : "unlocked"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  <div style={{
                    flex: 1, padding: "16px 20px",
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    borderRadius: 12, textAlign: "center",
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "var(--neon-green)" }}>
                      ₹{wallet.balance.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Balance (Paise Demo)</div>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div className="form-label" style={{ marginBottom: 8 }}>Wallet ID</div>
                  <div style={{
                    padding: "12px 16px", background: "rgba(255,255,255,0.03)",
                    borderRadius: 8, border: "1px solid var(--border-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  }}>
                    <code className="mono" style={{ fontSize: 12, flexShrink: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {wallet.id}
                    </code>
                    <button onClick={() => copyToClipboard(wallet.id)} className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12, flexShrink: 0 }}>
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {wallet.commitment && (
                  <div>
                    <div className="form-label" style={{ marginBottom: 8 }}>Commitment Hash (Public)</div>
                    <div style={{
                      padding: "12px 16px", background: "rgba(255,255,255,0.03)",
                      borderRadius: 8, border: "1px solid var(--border-subtle)",
                    }}>
                      <code className="mono" style={{ fontSize: 11 }}>{wallet.commitment}</code>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                      This hash is stored on server. It proves your identity without revealing your secret.
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}