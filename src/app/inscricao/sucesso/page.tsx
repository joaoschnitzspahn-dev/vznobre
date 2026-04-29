export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ protocolo?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto mt-12 w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#10223d] p-8 text-center">
      <h1 className="text-2xl font-bold text-cyan-300">Inscrição enviada com sucesso</h1>
      <p className="mt-3 text-slate-200">Número de protocolo:</p>
      <p className="mt-2 text-2xl font-extrabold text-cyan-200">{params.protocolo ?? "N/A"}</p>
    </div>
  );
}
