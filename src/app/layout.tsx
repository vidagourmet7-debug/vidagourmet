import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CarritoProvider } from "@/context/CarritoContext";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CarritoProvider>
        <AuthProvider>{children}</AuthProvider>
      </CarritoProvider>
      </body>
    </html>
  );
}
