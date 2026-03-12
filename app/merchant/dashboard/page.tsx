"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

const BACKEND = "http://localhost:4000";

type Transaction = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
};

type MerchantDashboardData = {
  id: string;
  name: string;
  createdAt: string;
  totalRevenue: number;
  recentTransactions: Transaction[];
};

export default function MerchantDashboard() {
  const [data, setData] = useState<MerchantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const merchantId = localStorage.getItem("zk_merchant_id");
      if (!merchantId) {
        window.location.href = "/merchant";
        return;
      }

      try {
        const res = await fetch(`${BACKEND}/api/merchant/${merchantId}/dashboard`);
        const result = await res.json();
        if (result.success) {
          setData(result.merchant);
        } else {
          setError(result.message || "Failed to load dashboard data.");
          localStorage.removeItem("zk_merchant_id");
        }
      } catch {
        setError("Cannot connect to backend.");
      }
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("zk_merchant_id");
    window.location.href = "/merchant";
  };

  if (loading) {
    return <div style={{ minHeight: "calc(100vh - 72px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <h2 style={{ color: "var(--text-muted)" }}>Loading Dashboard...</h2>
    </div>;
  }

  if (error || !data) {
    return <div style={{ minHeight: "calc(100vh - 72px)", display: "flex", flexDirection: "column", gap: 20, alignItems: "center", justifyContent: "center" }}>
      <h2 style={{ color: "var(--neon-cyan)" }}>⚠️ {error}</h2>
      <button className="btn btn-cyan" onClick={() => window.location.href = "/merchant"}>Return to Registration</button>
    </div>;
  }

  const qrValue = JSON.stringify({ merchantId: data.id, name: data.name, type: "zk-upi-payment" });

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", position: "relative", overflow: "hidden", paddingBottom: 80 }}>
      {/* Orbs */}
      <div className="orb orb-cyan" style={{ width: 450, height: 450, top: -80, right: -80 }} />
      <div className="orb orb-purple" style={{ width: 300, height: 300, bottom: 0, left: -60 }} />

      <div className="page-container" style={{ position: "relative", zIndex: 1, paddingTop: 60 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="badge badge-cyan" style={{ marginBottom: 12, display: "inline-flex" }}>🏪 Merchant Hub</span>
            <h1 style={{ fontSize: 36, fontWeight: 900 }}>{data.name}</h1>
          </motion.div>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ border: "1px solid var(--border-subtle)" }}>
            Sign Out
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32, alignItems: "start" }}>
          {/* Revenue & QR Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass glow-cyan" style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Total Revenue</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "var(--neon-green)", marginBottom: 24 }}>
              ₹{data.totalRevenue.toLocaleString()}
            </div>

            <div style={{ background: "#fff", padding: 20, borderRadius: 16, display: "inline-block", boxShadow: "0 0 30px rgba(6,182,212,0.15)", marginBottom: 20 }}>
              <QRCodeSVG value={qrValue} size={160} level="H" marginSize={2} />
            </div>
            
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Display this QR code to accept private payments.</p>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
               <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Merchant ID</div>
               <code className="mono" style={{ fontSize: 10, display: "block", padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
                 {data.id}
               </code>
            </div>
          </motion.div>

          {/* Incoming Transactions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass glow-purple" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Incoming Payments</h2>
            
            {data.recentTransactions.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                No payments received yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.recentTransactions.map((tx) => (
                  <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: "var(--text-primary)" }}>Received via ZK-Proof</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(tx.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "var(--neon-green)", fontWeight: 700, fontSize: 18 }}>+ ₹{tx.amount}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>Completed ✓</div>
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
