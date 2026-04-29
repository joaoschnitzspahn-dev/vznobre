"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashLogo() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 4200);
    const hideTimer = setTimeout(() => setVisible(false), 5000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#050d1d] transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative h-36 w-36 animate-pulse overflow-hidden rounded-full border border-cyan-300/40 bg-[#0a1628] p-2 shadow-[0_0_50px_rgba(0,212,255,0.35)]">
        <Image src="/logo.png" alt="Visão Nobre" fill className="object-contain" priority />
      </div>
    </div>
  );
}
