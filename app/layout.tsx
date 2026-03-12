import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ZK-UPI | Privacy-First Payments",
  description: "Zero Knowledge UPI Payment System — pay privately with cryptographic proof, no identity revealed.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ paddingTop: "72px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}