"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND = "http://localhost:4000";

type Step = "input" | "proving" | "submitting" | "success" | "error";

type ProofData = {
  proof: object;
  publicSignals: string[];
  nullifier: string;
  commitment: string;
};

export default function PayPage() {
  const [step, setStep] = useState<Step>("input");

  // Form fields
  const [userId, setUserId] = useState("");
  const [secret,     setSecret]     = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [amount,     setAmount]     = useState("");

  // Results
  const [proofData,   setProofData]   = useState<ProofData | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [errorMsg,    setErrorMsg]    = useState("");

  const reset = () => {
    setStep("input"); setUserId(""); setSecret(""); setMerchantId(""); setAmount("");
    setProofData(null); setTransactionId(""); setErrorMsg("");
  };

  const handlePay = async () => {
    if (!userId || !secret || !merchantId || !amount) {
      setErrorMsg("All fields are required."); return;
    }
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) { setErrorMsg("Amount must be a positive number."); return; }

    setErrorMsg("");
    setStep("proving");

    try {
      // Step 1: Generate ZK proof on backend
      const proofRes = await fetch(`${BACKEND}/api/verify/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, merchantId, amount: amtNum }),
      });
      const proofJson = await proofRes.json();
      if (!proofJson.success) throw new Error(proofJson.message || "Proof generation failed.");

      const pd: ProofData = {
        proof:         { mockProof: proofJson.proof },
        publicSignals: [String(amtNum), proofJson.nullifier, proofJson.commitment],
        nullifier:     proofJson.nullifier,
        commitment:    proofJson.commitment,
      };
      setProofData(pd);
      setStep("submitting");

      // Step 2: Submit payment
      const payRes = await fetch(`${BACKEND}/api/payment/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId:    userId,
          toAddress:     merchantId,
          amount:        amtNum,
          proof:         pd.proof,
          publicSignals: pd.publicSignals,
        }),
      });
      const payJson = await payRes.json();
      if (!payJson.success) throw new Error(payJson.message || "Payment submission failed.");

      setTransactionId(payJson.transactionId);
      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
      setStep("error");
    }
  };

  const STEPS_INDICATOR = [
    { id: "input",     label: "Details" },
    { id: "proving",   label: "ZK Proof" },
    { id: "submitting", label: "Submit" },
    { id: "success",   label: "Done" },
  ];

  const stepIndex = STEPS_INDICATOR.findIndex((s) => s.id === step);
  const effectiveIndex = step === "error" ? 1 : stepIndex;

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", position: "relative", overflow: "hidden" }}>
      <div className="orb orb-purple" style={{ width: 400, height: 400, top: -100, left: "30%" }} />
      <div className="orb orb-cyan"   style={{ width: 350, height: 350, bottom: 0, right: -60 }} />

      <div className="page-container" style={{ position: "relative", zIndex: 1, paddingTop: 60, paddingBottom: 80 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="badge badge-purple" style={{ marginBottom: 16, display: "inline-flex" }}>⚡ ZK Payment</span>
          <h1 style={{ fontSize: 52, fontWeight: 900, marginBottom: 14 }}>
            Pay <span className="text-gradient-purple">Privately</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto" }}>
            Your payment is verified with a Zero Knowledge proof. The merchant gets paid — your identity stays hidden.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 44 }}>
          {STEPS_INDICATOR.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: i <= effectiveIndex
                    ? "linear-gradient(135deg, #8b5cf6, #06b6d4)"
                    : "rgba(255,255,255,0.06)",
                  border: i === effectiveIndex ? "2px solid #8b5cf6" : "2px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700,
                  color: i <= effectiveIndex ? "#fff" : "var(--text-muted)",
                  boxShadow: i === effectiveIndex ? "0 0 16px rgba(139,92,246,0.5)" : "none",
                  transition: "all 0.3s",
                  margin: "0 auto 6px",
                }}>
                  {i < effectiveIndex ? "✓" : i + 1}
                </div>
                <div style={{ fontSize: 11, color: i <= effectiveIndex ? "var(--neon-purple)" : "var(--text-muted)", fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
              {i < STEPS_INDICATOR.length - 1 && (
                <div style={{
                  width: 60, height: 2, margin: "0 8px",
                  background: i < effectiveIndex
                    ? "linear-gradient(90deg, #8b5cf6, #06b6d4)"
                    : "rgba(255,255,255,0.08)",
                  borderRadius: 1, marginBottom: 22, transition: "all 0.3s",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Card Container */}
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <AnimatePresence mode="wait">

            {/* ── Input Step ──────────────────────────────────────────────── */}
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass glow-purple"
                style={{ padding: 36 }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Payment Details</h2>

                {[
                  { label: "Your User ID", key: "userId", val: userId, set: setUserId, placeholder: "Wallet User ID from /wallet", type: "text" },
                  { label: "Secret Phrase", key: "secret", val: secret, set: setSecret, placeholder: "Your wallet secret", type: "password" },
                  { label: "Merchant ID", key: "merchantId", val: merchantId, set: setMerchantId, placeholder: "merchant_xxxxxxxx from /merchant", type: "text" },
                  { label: "Amount (₹)", key: "amount", val: amount, set: setAmount, placeholder: "e.g. 500", type: "number" },
                ].map((field) => (
                  <div className="form-group" style={{ marginBottom: 20 }} key={field.key}>
                    <label className="form-label">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={field.val}
                      onChange={(e) => { field.set(e.target.value); setErrorMsg(""); }}
                      style={{ fontSize: 14 }}
                    />
                  </div>
                ))}

                {errorMsg && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {errorMsg}</div>}

                <button className="btn btn-primary" onClick={handlePay} style={{ width: "100%", padding: "14px", fontSize: 16 }}>
                  ⚡ Generate Proof & Pay
                </button>
              </motion.div>
            )}

            {/* ── Proving Step ─────────────────────────────────────────────── */}
            {step === "proving" && (
              <motion.div
                key="proving"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass"
                style={{ padding: 56, textAlign: "center" }}
              >
                <div style={{ fontSize: 56, marginBottom: 24 }} className="animate-float">🔐</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Generating ZK Proof</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                  Creating a cryptographic proof that proves payment authorization without revealing your identity…
                </p>
                <div style={{
                  marginTop: 28, height: 4, borderRadius: 2,
                  background: "var(--border-subtle)",
                  overflow: "hidden",
                }}>
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      height: "100%", width: "40%",
                      background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ── Submitting Step ───────────────────────────────────────────── */}
            {step === "submitting" && (
              <motion.div
                key="submitting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass"
                style={{ padding: 56, textAlign: "center" }}
              >
                <div style={{ fontSize: 56, marginBottom: 24 }} className="animate-float">📡</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Submitting Payment</h3>
                {proofData && (
                  <div style={{
                    padding: "14px 18px", background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, marginBottom: 20,
                    textAlign: "left",
                  }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Nullifier (one-time use)</div>
                    <code className="mono" style={{ fontSize: 11 }}>{proofData.nullifier.slice(0, 40)}…</code>
                  </div>
                )}
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                  Verifying proof on-chain and recording anonymous transaction…
                </p>
              </motion.div>
            )}

            {/* ── Success Step ──────────────────────────────────────────────── */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass glow-cyan"
                style={{ padding: 48, textAlign: "center", border: "1px solid rgba(6,182,212,0.3)" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1, duration: 0.5 }}
                  style={{ fontSize: 68, marginBottom: 20 }}
                >✅</motion.div>
                <h3 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }} className="text-gradient-cyan">
                  Payment Successful!
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 28 }}>
                  Your private payment was verified with a Zero Knowledge proof.
                  The merchant received the funds. Your identity was never revealed.
                </p>

                {transactionId && (
                  <div style={{ marginBottom: 28 }}>
                    <div className="form-label" style={{ marginBottom: 8 }}>Transaction ID</div>
                    <code className="mono" style={{
                      display: "block", padding: "12px 16px",
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 10, border: "1px solid var(--border-subtle)",
                      fontSize: 12,
                    }}>
                      {transactionId}
                    </code>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={reset} style={{ flex: 1 }}>
                    ⚡ New Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Error Step ────────────────────────────────────────────────── */}
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass"
                style={{ padding: 48, textAlign: "center", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Payment Failed</h3>
                <div className="alert alert-error" style={{ marginBottom: 28, textAlign: "left" }}>
                  {errorMsg}
                </div>
                <button className="btn btn-ghost" onClick={reset} style={{ width: "100%" }}>
                  ← Try Again
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}