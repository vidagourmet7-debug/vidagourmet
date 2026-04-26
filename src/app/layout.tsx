import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/context/CarritoContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vida Gourmet - Viandas Saludables",
  description: "Elaboración de viandas saludables para el delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${caveat.variable} font-sans antialiased bg-gray-50 text-gray-800`}
      >
        <CarritoProvider>
          <AuthProvider>{children}</AuthProvider>
        </CarritoProvider>
      </body>
    </html>
  );
}
