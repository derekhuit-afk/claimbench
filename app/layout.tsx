import type { Metadata } from "next";
import "./globals.css";
import AgentWidget from '@/components/AgentWidget';
export const metadata: Metadata = {
  title: "ClaimBench — Workers Comp Claim Frequency Heatmap",
  description: "Claim frequency and loss ratio benchmarks by NAICS code and state — sourced from NCCI public filings, BLS injury data, a",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#0A0600", color: "#E8EAF0", fontFamily: "monospace", margin: 0 }}>
        {children}
            <AgentWidget />
    </body>
    </html>
  );
}
