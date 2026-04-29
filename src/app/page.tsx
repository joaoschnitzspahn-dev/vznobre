import Image from "next/image";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { getCursosLanding, getSiteConfig } from "@/lib/site-config";
import { Reveal } from "@/components/reveal";

export default async function Home() {
  const config = await getSiteConfig();
  const cursos = await getCursosLanding();

  return (
    <main className="mx-auto w-full max-w-[980px] pb-16">
      <Reveal className="apple-section text-center">
        <div className="mx-auto mb-6 h-16 w-16 overflow-hidden rounded-full">
          <Image src="/logo.png" alt="Logo Visão Nobre" width={64} height={64} className="h-full w-full object-cover" />
        </div>
        <h1 className="text-[56px] font-bold leading-[1.05] tracking-[-0.02em] text-[#1d1d1f] md:text-[76px]">Visão Nobre</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-light text-[#6e6e73]">{config.slogan}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/inscricao" className="apple-button-primary px-6 py-2.5 text-sm">
            Fazer inscrição
          </Link>
          <Link href="/login" className="apple-button-secondary px-6 py-2.5 text-sm">
            Área do aluno
          </Link>
        </div>
      </Reveal>

      <Reveal className="apple-section border-t border-[#e5e5ea] pt-16">
        <section>
          <h2 className="text-[44px] font-bold tracking-[-0.01em] text-[#1d1d1f]">Sobre o Projeto</h2>
          <p className="mt-6 max-w-3xl text-lg font-light text-[#6e6e73]">{config.missao}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {config.valores.map((valor) => (
              <span key={valor} className="rounded-full bg-[#f0f0f2] px-3 py-1 text-xs text-[#6e6e73]">
                {valor}
              </span>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal className="apple-section border-t border-[#e5e5ea] pt-16">
        <section>
          <h2 className="mb-8 text-[44px] font-bold tracking-[-0.01em] text-[#1d1d1f]">Nossos Cursos</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {cursos.filter((curso) => curso.ativo).map((curso) => (
              <CourseCard key={curso.id} {...curso} />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal className="apple-section border-t border-[#e5e5ea] pt-16">
        <section>
          <h2 className="text-[34px] font-bold tracking-[-0.01em] text-[#1d1d1f]">Contato</h2>
          <div className="mt-4 space-y-1 text-base text-[#6e6e73]">
            <p>WhatsApp: {config.whatsapp}</p>
            <p>Email: {config.email}</p>
            <p>Instagram: {config.instagram}</p>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
