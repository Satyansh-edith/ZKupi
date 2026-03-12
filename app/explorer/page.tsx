"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const BACKEND = "http://localhost:4000";

type Tx = {
  id: string;
  amount: number;
  status: string;
  date: string;
  merchantId: string;
};

export default function ExplorerPage() {
  const [userId, setUserId] = useState("");
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [proofModal, setProofModal] = useState<{ txId: string; hash: string } | null>(null);

  const fetchHistory = async () => {
    if (!userId.trim()) { setError("Please enter a User ID."); return; }
    setLoading(true); setError(""); setSearched(false);
    try {
      const res = await fetch(`${BACKEND}/api/transactions/history/${userId.trim()}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
        setSearched(true);
      } else {
        setError(data.message || "User not found.");
      }
    } catch {
      setError("Cannot connect to backend (port 4000).");
    }
    setLoading(false);
  };

  const fetchProof = async (txId: string) => {
    try {
      const res = await fetch(`${BACKEND}/api/transactions/${txId}/proof`);
      const data = await res.json();
      if (data.success) setProofModal({ txId, hash: data.proofHash });
    } catch {/* noop */}
  };

  const filtered = statusFilter === "all"
    ? transactions
    : transactions.filter((t) => t.status === statusFilter);

  const STATUS_COLOR: Record<string, string> = {
    completed: "var(--neon-green)",
    pending:   "#f59e0b",
    failed:    "#ef4444",
  };

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", position: "relative" }}>
      <div className="orb orb-pink"   style={{ width: 400, height: 400, top: -60, right: "10%" }} />
      <div className="orb orb-purple" style={{ width: 300, height: 300, bottom: 100, left: -60 }} />

      <div className="page-container" style={{ position: "relative", zIndex: 1, paddingTop: 60, paddingBottom: 80 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="badge badge-purple" style={{ marginBottom: 16, display: "inline-flex" }}>🔍 Transaction Explorer</span>
          <h1 style={{ fontSize: 52, fontWeight: 900, marginBottom: 14 }}>
            <span className="text-gradient-pink">Explore</span> Transactions
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto" }}>
            Look up any user's payment history. Transactions are publicly auditable —
            but the payer stays completely anonymous.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass" style={{ padding: 28, marginBottom: 28, maxWidth: 700, margin: "0 auto 32px" }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Enter User ID (from wallet creation)..."
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && fetchHistory()}
              style={{ flex: 1, minWidth: 200, fontSize: 14, padding: "12px 18px" }}
            />
            <button
              className="btn btn-primary"
              onClick={fetchHistory}
              disabled={loading}
              style={{ padding: "12px 28px", flexShrink: 0 }}
            >
              {loading ? "⏳ Searching..." : "🔍 Search"}
            </button>
          </div>
          {error && <div className="alert alert-error" style={{ marginTop: 16 }}>⚠️ {error}</div>}
        </motion.div>

        {/* Results */}
        {searched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Stats Bar */}
            <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span className="badge badge-purple">Total: {total}</span>
                <span className="badge badge-green">Completed: {transactions.filter(t => t.status === "completed").length}</span>
                {transactions.filter(t => t.status === "pending").length > 0 && (
                  <span style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }} className="badge">
                    Pending: {transactions.filter(t => t.status === "pending").length}
                  </span>
                )}
              </div>

              {/* Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="glass" style={{ padding: 56, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-secondary)" }}>No transactions found</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>
                  This wallet has no transaction history yet.
                </div>
              </div>
            ) : (
              <div className="glass" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      {["Transaction ID", "Amount", "Merchant", "Status", "Date", "Proof"].map((h) => (
                        <th key={h} style={{
                          padding: "14px 18px", textAlign: "left", fontSize: 11,
                          fontWeight: 600, color: "var(--text-muted)",
                          textTransform: "uppercase", letterSpacing: "0.06em",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tx, i) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                      >
                        <td style={{ padding: "14px 18px" }}>
                          <code className="mono" style={{ fontSize: 11 }}>{tx.id.slice(0, 16)}…</code>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ fontWeight: 700, color: "var(--neon-green)" }}>₹{tx.amount}</span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <code className="mono" style={{ fontSize: 11 }}>{tx.merchantId.slice(0, 18)}…</code>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span className={`status-dot ${tx.status}`} />
                            <span style={{ fontSize: 13, color: STATUS_COLOR[tx.status] || "var(--text-secondary)", fontWeight: 600, textTransform: "capitalize" }}>
                              {tx.status}
                            </span>
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-muted)" }}>
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <button
                            onClick={() => fetchProof(tx.id)}
                            className="btn btn-ghost"
                            style={{ padding: "5px 12px", fontSize: 12 }}
                          >
                            🔍 View
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Proof Modal */}
      {proofModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: 24,
          }}
          onClick={() => setProofModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass glow-purple"
            style={{ maxWidth: 540, width: "100%", padding: 36, border: "1px solid rgba(139,92,246,0.3)" }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>🔍 Proof Hash</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Transaction: {proofModal.txId.slice(0, 20)}…</p>
            <code className="mono" style={{ display: "block", padding: 16, background: "rgba(255,255,255,0.04)", borderRadius: 10, fontSize: 12, border: "1px solid var(--border-subtle)", wordBreak: "break-all" }}>
              {proofModal.hash}
            </code>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 16 }}>
              This ZK commitment hash proves the transaction was authorized without revealing the payer's identity.
            </p>
            <button className="btn btn-ghost" onClick={() => setProofModal(null)} style={{ marginTop: 20, width: "100%" }}>Close</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}