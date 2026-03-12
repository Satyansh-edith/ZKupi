"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",         label: "Home"       },
  { href: "/wallet",   label: "Wallet"     },
  { href: "/merchant", label: "Merchant"   },
  { href: "/explorer", label: "Explorer"   },
  { href: "/pay",      label: "Pay Now"    },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      background: "rgba(8, 11, 20, 0.85)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      height: "72px",
      display: "flex",
      alignItems: "center",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 24px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            boxShadow: "0 0 16px rgba(139,92,246,0.4)",
          }}>🔐</div>
          <span style={{
            fontSize: 18,
            fontWeight: 800,
            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>ZK-UPI</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {NAV_LINKS.slice(0, -1).map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? "#8b5cf6" : "#94a3b8",
                  background: isActive ? "rgba(139,92,246,0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(139,92,246,0.25)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA Button */}
        <Link
          href="/pay"
          className="btn btn-primary"
          style={{ padding: "9px 20px", fontSize: 14 }}
        >
          ⚡ Pay Now
        </Link>
      </div>
    </nav>
  );
}