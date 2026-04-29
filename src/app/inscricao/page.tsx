import { InscricaoForm } from "@/components/inscricao-form";
import { Reveal } from "@/components/reveal";

export default async function InscricaoPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto w-full max-w-[980px]">
      <Reveal className="apple-section">
        <h1 className="text-[56px] font-bold tracking-[-0.02em] text-[#1d1d1f]">Inscrição</h1>
        <p className="mt-3 text-lg font-light text-[#6e6e73]">Preencha os dados para participar da próxima turma do Visão Nobre.</p>
        <div className="mt-10">
          <InscricaoForm cursoInicial={params.curso} />
        </div>
      </Reveal>
    </main>
  );
}
