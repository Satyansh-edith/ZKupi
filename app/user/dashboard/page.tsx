"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const BACKEND = "http://localhost:4000";

type Transaction = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  merchantName: string;
};

type WalletDashboardData = {
  id: string;
  commitment: string;
  balance: number;
  createdAt: string;
  recentTransactions: Transaction[];
};

export default function UserDashboard() {
  const [data, setData] = useState<WalletDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const secret = localStorage.getItem("zk_secret");
      if (!secret) {
        window.location.href = "/wallet";
        return;
      }

      try {
        const res = await fetch(`${BACKEND}/api/wallet/dashboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret }),
        });
        const result = await res.json();
        if (result.success) {
          setData(result.wallet);
        } else {
          setError(result.message || "Failed to load dashboard data.");
          localStorage.removeItem("zk_secret");
        }
      } catch {
        setError("Cannot connect to backend.");
      }
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("zk_secret");
    window.location.href = "/wallet";
  };

  if (loading) {
    return <div style={{ minHeight: "calc(100vh - 72px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <h2 style={{ color: "var(--text-muted)" }}>Loading Dashboard...</h2>
    </div>;
  }

  if (error || !data) {
    return <div style={{ minHeight: "calc(100vh - 72px)", display: "flex", flexDirection: "column", gap: 20, alignItems: "center", justifyContent: "center" }}>
      <h2 style={{ color: "var(--neon-purple)" }}>⚠️ {error}</h2>
      <button className="btn btn-primary" onClick={() => window.location.href = "/wallet"}>Return to Login</button>
    </div>;
  }

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", position: "relative", overflow: "hidden", paddingBottom: 80 }}>
      {/* Orbs */}
      <div className="orb orb-purple" style={{ width: 400, height: 400, top: -50, left: -50 }} />
      <div className="orb orb-cyan"   style={{ width: 300, height: 300, bottom: 50, right: 0 }} />

      <div className="page-container" style={{ position: "relative", zIndex: 1, paddingTop: 60 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="badge badge-purple" style={{ marginBottom: 12, display: "inline-flex" }}>🔐 Private Dashboard</span>
            <h1 style={{ fontSize: 36, fontWeight: 900 }}>My <span className="text-gradient-purple">ZK Wallet</span></h1>
          </motion.div>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ border: "1px solid var(--border-subtle)" }}>
            Log Out
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32, alignItems: "start" }}>
          {/* Balance Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass glow-purple" style={{ padding: 32 }}>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Current Balance</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: "var(--neon-green)", marginBottom: 24 }}>
              ₹{data.balance.toLocaleString()}
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 24, marginBottom: 24 }}>
               <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Wallet ID (Public View)</div>
               <code className="mono" style={{ fontSize: 11, display: "block", overflow: "hidden", textOverflow: "ellipsis", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
                 {data.id}
               </code>
            </div>

            <button className="btn btn-primary" onClick={() => window.location.href = "/pay"} style={{ width: "100%", padding: "14px", fontSize: 16 }}>
              💸 Send Payment
            </button>
          </motion.div>

          {/* Transactions List */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass glow-cyan" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Recent Payments</h2>
            
            {data.recentTransactions.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                No completed transactions yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.recentTransactions.map((tx) => (
                  <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Paid: {tx.merchantName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(tx.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "var(--neon-purple)", fontWeight: 700, fontSize: 18 }}>- ₹{tx.amount}</div>
                      <div style={{ fontSize: 11, color: "var(--neon-cyan)", marginTop: 4 }}>ZK Verified ✓</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
