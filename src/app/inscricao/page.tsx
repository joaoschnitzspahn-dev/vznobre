import { InscricaoForm } from "@/components/inscricao-form";

export default async function InscricaoPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-4xl font-black text-white">Inscrição</h1>
      <p className="mb-6 text-slate-300">Preencha os dados para participar da próxima turma do Visão Nobre.</p>
      <InscricaoForm cursoInicial={params.curso} />
    </div>
  );
}
