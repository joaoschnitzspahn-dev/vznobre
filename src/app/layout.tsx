import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { SplashLogo } from "@/components/splash-logo";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Visão Nobre",
  description: "Projeto social Visão Nobre",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SplashLogo />
        {children}
      </body>
    </html>
  );
}
