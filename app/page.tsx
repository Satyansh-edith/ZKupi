"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: "🔑",
    title: "Anonymous Wallets",
    desc: "Your wallet is a SHA-256 commitment hash. No name, no email — just cryptographic identity.",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    icon: "📲",
    title: "QR Merchant Payments",
    desc: "Merchants generate QR codes. Users scan and pay — privately, instantly.",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.2)",
  },
  {
    icon: "✅",
    title: "Zero Knowledge Proofs",
    desc: "Payments verified with cryptographic proofs. The network learns nothing about you.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
  {
    icon: "🔍",
    title: "Public Explorer",
    desc: "Transactions are visible and auditable. But the payer? Completely anonymous.",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.2)",
  },
];

const FLOW = [
  { step: "01", label: "Enter Secret", icon: "🔐", desc: "Your secret key, never shared" },
  { step: "02", label: "Commitment", icon: "🔗", desc: "SHA-256 hash stored on server" },
  { step: "03", label: "ZK Proof", icon: "⚡", desc: "Prove ownership without revealing" },
  { step: "04", label: "Verified", icon: "✅", desc: "Payment recorded anonymously" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function HomePage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c >= 50000 ? 50000 : c + 721)), 30);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ overflow: "hidden" }}>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center" }}>
        {/* Background orbs */}
        <div className="orb orb-purple" style={{ width: 600, height: 600, top: -100, left: -100 }} />
        <div className="orb orb-cyan"   style={{ width: 400, height: 400, top: 100, right: -50 }} />
        <div className="orb orb-pink"   style={{ width: 300, height: 300, bottom: 0, left: "40%" }} />

        <div className="page-container" style={{ position: "relative", zIndex: 1, textAlign: "center", paddingTop: 60, paddingBottom: 80 }}>
          <motion.div initial="hidden" animate="show" variants={stagger}>

            {/* Badge */}
            <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
              <span className="badge badge-purple" style={{ fontSize: 13, padding: "6px 18px" }}>
                ✨ Privacy-First Payment System
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(48px, 7vw, 88px)", fontWeight: 900, marginBottom: 24, lineHeight: 1.05 }}>
              <span className="text-gradient-purple">Pay Privately.</span>
              <br />
              <span style={{ color: "var(--text-primary)" }}>Zero Knowledge.</span>
            </motion.h1>

            {/* Subline */}
            <motion.p variants={fadeUp} style={{ fontSize: 20, maxWidth: 540, margin: "0 auto 44px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
              A UPI-style payment system where transactions are verified with cryptographic proofs —
              your identity stays completely private.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
              <Link href="/wallet" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 16 }}>
                🚀 Create Wallet
              </Link>
              <Link href="/merchant" className="btn btn-cyan" style={{ padding: "14px 32px", fontSize: 16 }}>
                🏪 Register Merchant
              </Link>
              <Link href="/explorer" className="btn btn-ghost" style={{ padding: "14px 32px", fontSize: 16 }}>
                🔍 Explorer
              </Link>
            </motion.div>

            {/* Live stats */}
            <motion.div variants={fadeUp} style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { value: count.toLocaleString() + "+", label: "Proofs Generated" },
                { value: "100%",  label: "Anonymous" },
                { value: "< 1s",  label: "Verification" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--neon-purple)" }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── ZK Flow ───────────────────────────────────────────────────── */}
      <section className="section" style={{ background: "rgba(13,18,32,0.5)" }}>
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
              How <span className="text-gradient-cyan">ZK-UPI</span> Works
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
              Four steps from secret to verified anonymous payment
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {FLOW.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="glass"
                style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden" }}
              >
                <div style={{
                  position: "absolute", top: 12, right: 14,
                  fontSize: 11, fontWeight: 700, color: "var(--neon-purple)", opacity: 0.5,
                  fontFamily: "monospace",
                }}>{f.step}</div>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{f.desc}</div>
                {i < FLOW.length - 1 && (
                  <div style={{
                    position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)",
                    fontSize: 18, color: "var(--neon-purple)", zIndex: 2,
                    display: "none",
                  }}>→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
              Built for <span className="text-gradient-pink">Privacy</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
              Every feature engineered to keep your identity hidden
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass"
                style={{ padding: 32, border: `1px solid ${f.border}`, background: f.bg }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: `${f.bg}`,
                  border: `1px solid ${f.border}`, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 20,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>{f.desc}</p>
                <div style={{
                  marginTop: 20, height: 2, borderRadius: 1,
                  background: `linear-gradient(90deg, ${f.color}, transparent)`,
                }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0" }}>
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.15))",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 28,
              padding: "60px 40px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="orb orb-purple" style={{ width: 300, height: 300, top: -80, right: -80, opacity: 0.4 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>
                Ready to pay <span className="text-gradient-purple">privately?</span>
              </h2>
              <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
                Create your anonymous wallet in seconds. No signup. No KYC. Just pure cryptography.
              </p>
              <Link href="/wallet" className="btn btn-primary" style={{ padding: "16px 40px", fontSize: 17, display: "inline-flex" }}>
                🚀 Get Started Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>🔐</span>
          <span style={{ fontWeight: 800, fontSize: 16 }} className="text-gradient-purple">ZK-UPI</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Built for Hackathon · Privacy-First Payments · Zero Knowledge
        </p>
      </footer>
    </div>
  );
}