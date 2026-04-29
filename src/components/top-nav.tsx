import Image from "next/image";
import Link from "next/link";

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e5ea] bg-[rgba(255,255,255,0.72)] backdrop-blur-[20px]">
      <div className="mx-auto flex h-12 w-full max-w-[980px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1f]">
          <Image src="/logo.png" alt="Visão Nobre" width={22} height={22} className="rounded-full" />
          Visão Nobre
        </Link>
        <nav className="flex items-center gap-4 text-sm text-[#1d1d1f]">
          <Link href="/">Início</Link>
          <Link href="/inscricao">Inscrição</Link>
          <Link href="/login" className="apple-button-primary px-4 py-1.5 text-xs">
            Área do aluno
          </Link>
        </nav>
      </div>
    </header>
  );
}
