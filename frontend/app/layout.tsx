import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "./provider"; 
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css"; // <-- match the actual file name

// Optimized fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });

export const metadata: Metadata = {
  title: "Impact Rewards - Volunteer Platform",
  description: "Connect volunteers with NGOs and make a difference",
  generator: "v0.app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
