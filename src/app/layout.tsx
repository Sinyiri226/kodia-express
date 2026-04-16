import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Utilisation de Inter comme prévu
import "./globals.css";
import { cn } from "@/lib/utils";

// Configuration de la police Inter
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KODIA EXPRESS | Livraison à domicile à Ouagadougou",
  description: "La plateforme premium pour vos livraisons rapides et sécurisées à Ouagadougou.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("antialiased", inter.variable)}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}