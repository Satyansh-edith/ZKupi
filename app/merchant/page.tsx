"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

const BACKEND = "http://localhost:4000";

type Merchant = {
  merchantId: string;
  name: string;
  createdAt: string;
};

export default function MerchantPage() {
  const [name, setName] = useState("");
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { setError("Please enter a merchant name."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BACKEND}/api/merchant/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (data.success) { 
        localStorage.setItem("zk_merchant_id", data.merchant.merchantId);
        window.location.href = "/merchant/dashboard"; 
      }
      else setError(data.message || "Failed to register merchant.");
    } catch {
      setError("Cannot connect to backend. Make sure it is running on port 4000.");
    }
    setLoading(false);
  };

  const qrValue = merchant
    ? JSON.stringify({ merchantId: merchant.merchantId, name: merchant.name, type: "zk-upi-payment" })
    : "";

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", position: "relative", overflow: "hidden" }}>
      <div className="orb orb-purple" style={{ width: 450, height: 450, top: -80, right: -80 }} />
      <div className="orb orb-cyan"   style={{ width: 300, height: 300, bottom: 0, left: -60 }} />

      <div className="page-container" style={{ position: "relative", zIndex: 1, paddingTop: 60, paddingBottom: 80 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="badge badge-cyan" style={{ marginBottom: 16, display: "inline-flex" }}>🏪 Merchant Portal</span>
          <h1 style={{ fontSize: 52, fontWeight: 900, marginBottom: 14 }}>
            Register <span className="text-gradient-cyan">Merchant</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto" }}>
            Register your business and get a unique QR code. Customers scan it to pay you privately.
          </p>
        </motion.div>

        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: merchant ? "1fr 1fr" : "1fr", gap: 28, alignItems: "start" }}>
          {/* Form Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass glow-purple" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Business Details</h2>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Business Name</label>
              <input
                type="text"
                placeholder="e.g. Coffee House, Tech Store..."
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                style={{ fontSize: 15, padding: "14px 18px" }}
              />
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

            <button
              className="btn btn-cyan"
              onClick={handleCreate}
              disabled={loading}
              style={{ width: "100%", padding: "14px", fontSize: 16, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "⏳ Registering..." : "🏪 Register Merchant"}
            </button>

            {/* Info */}
            <div style={{ marginTop: 28, borderTop: "1px solid var(--border-subtle)", paddingTop: 20 }}>
              {[
                { icon: "🔑", text: "Unique merchant ID generated instantly" },
                { icon: "📲", text: "QR code ready for customer scanning" },
                { icon: "🔒", text: "All payments to you are ZK-verified" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <span>{item.icon}</span>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* QR Result */}
          <AnimatePresence>
            {merchant && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="glass glow-cyan"
                style={{ padding: 36, border: "1px solid rgba(6,182,212,0.25)", textAlign: "center" }}
              >
                <div style={{ marginBottom: 20 }}>
                  <span className="badge badge-green" style={{ marginBottom: 12, display: "inline-flex" }}>
                    ✓ Registered Successfully
                  </span>
                  <h3 style={{ fontSize: 20, fontWeight: 700 }}>{merchant.name}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    {new Date(merchant.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* QR Code */}
                <div style={{
                  padding: 20, background: "#fff", borderRadius: 16, display: "inline-flex",
                  boxShadow: "0 0 40px rgba(6,182,212,0.2)",
                  marginBottom: 20,
                }}>
                  <QRCodeSVG
                    value={qrValue}
                    size={180}
                    level="H"
                    marginSize={2}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div className="form-label" style={{ marginBottom: 8 }}>Merchant ID</div>
                  <code className="mono" style={{
                    display: "block", padding: "10px 14px",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 8, border: "1px solid var(--border-subtle)",
                    textAlign: "left",
                  }}>
                    {merchant.merchantId}
                  </code>
                </div>

                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Share this QR code with customers. They'll scan it in the Pay Now page to send you private payments.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}