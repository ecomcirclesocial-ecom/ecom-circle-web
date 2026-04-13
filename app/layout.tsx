import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Ecom Circle — Comunidad #1 de Ecommerce con IA en LATAM",
  description:
    "+$3.1M USD facturados. La comunidad de ecommerce y dropshipping más comprometida de LATAM. Únete con Nain Guevara.",
  openGraph: {
    title: "Ecom Circle by Nain",
    description: "Comunidad #1 de Ecommerce y dropshipping 100% con IA en LATAM.",
    siteName: "Ecom Circle",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body className="min-h-[100dvh] bg-[#0A0A0A] text-white font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
