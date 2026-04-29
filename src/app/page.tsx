import Image from "next/image";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { getCursosLanding, getSiteConfig } from "@/lib/site-config";

export default async function Home() {
  const config = await getSiteConfig();
  const cursos = await getCursosLanding();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <main className="space-y-10">
        <section className="liquid-panel fade-up relative p-8 text-center md:p-14">
          <div className="relative z-10 mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border border-cyan-300/40 bg-[#0a1628] shadow-[0_0_35px_rgba(34,211,238,0.35)]">
            <Image src="/logo.png" alt="Logo Visão Nobre" width={96} height={96} className="h-full w-full object-cover" />
          </div>
          <h1 className="relative z-10 text-4xl font-black tracking-tight text-white md:text-6xl">Visão Nobre</h1>
          <p className="relative z-10 mx-auto mt-4 max-w-2xl text-slate-300">{config.slogan}</p>
          <div className="relative z-10 mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/inscricao" className="neon-button px-6 py-2.5">
              Fazer inscrição
            </Link>
            <Link href="/login" className="rounded-full border border-white/25 px-6 py-2.5 font-semibold text-slate-100">
              Área do aluno
            </Link>
          </div>
        </section>

        <section className="liquid-panel fade-up fade-up-delay-1 p-8">
          <h2 className="text-2xl font-black text-white">Sobre o Projeto</h2>
          <p className="mt-4 text-slate-300">{config.missao}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {config.valores.map((valor) => (
              <span key={valor} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-slate-200">
                {valor}
              </span>
            ))}
          </div>
        </section>

        <section className="fade-up fade-up-delay-2">
          <h2 className="mb-5 text-3xl font-black text-white">Nossos Cursos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {cursos.filter((curso) => curso.ativo).map((curso) => (
              <CourseCard key={curso.id} {...curso} />
            ))}
          </div>
        </section>

        <section className="liquid-panel fade-up fade-up-delay-3 p-8 text-sm text-slate-200">
          <h2 className="text-xl font-bold text-white">Contato e Redes</h2>
          <p className="mt-3">WhatsApp: {config.whatsapp}</p>
          <p>Email: {config.email}</p>
          <p>Instagram: {config.instagram}</p>
        </section>
      </main>
    </div>
  );
}
