import { createClient } from "@/lib/supabase/server";

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: perfil }, { data: notas }, { data: atividades }, { data: comunicados }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user?.id).maybeSingle(),
    supabase.from("notas").select("nota,status,observacao,atividade_id,atividades(titulo,data_entrega)").eq("aluno_id", user?.id),
    supabase.from("atividades").select("*").order("data_entrega", { ascending: true }).limit(10),
    supabase.from("comunicados").select("*").order("created_at", { ascending: false }).limit(5),
  ]);
  const [roteirosRes, presencasRes] = await Promise.all([
    perfil?.turma_id
      ? supabase
          .from("aulas")
          .select("id,numero_aula,data_aula,titulo,roteiro")
          .eq("turma_id", perfil.turma_id)
          .order("data_aula", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] as Array<{ id: string; numero_aula: number; data_aula: string; titulo: string; roteiro: string }> }),
    supabase
      .from("presencas")
      .select("status,observacao,aula_id,aulas(numero_aula,data_aula,titulo,roteiro)")
      .eq("aluno_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const roteiros = roteirosRes.data ?? [];
  const presencas = presencasRes.data ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-cyan-300">Portal do Aluno</h1>
      <p className="mt-2 text-slate-200">Bem-vindo(a), {perfil?.nome ?? user?.email}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-cyan-500/30 bg-[#10223d] p-4">
          <h2 className="font-semibold text-cyan-200">Perfil e Curso</h2>
          <p className="mt-2 text-sm">Curso atual: {perfil?.curso_id ?? "-"}</p>
          <p className="text-sm">Turma: {perfil?.turma_id ?? "-"}</p>
          <p className="text-sm">WhatsApp: {perfil?.whatsapp ?? "-"}</p>
        </section>
        <section className="rounded-2xl border border-cyan-500/30 bg-[#10223d] p-4">
          <h2 className="font-semibold text-cyan-200">Comunicados</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {comunicados?.map((c) => (
              <li key={c.id} className="rounded bg-[#0a1628] p-2">
                <p className="font-medium">{c.titulo}</p>
                <p>{c.conteudo}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-cyan-500/30 bg-[#10223d] p-4">
        <h2 className="font-semibold text-cyan-200">Atividades</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {atividades?.map((a) => (
            <li key={a.id} className="rounded bg-[#0a1628] p-2">
              <p className="font-medium">{a.titulo}</p>
              <p>{a.descricao}</p>
              <p>Entrega: {a.data_entrega}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-cyan-500/30 bg-[#10223d] p-4">
        <h2 className="font-semibold text-cyan-200">Notas</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-cyan-100">
                <th className="p-2">Atividade</th>
                <th className="p-2">Data</th>
                <th className="p-2">Nota</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {notas?.map((n) => (
                <tr key={n.atividade_id} className="border-t border-cyan-900/40">
                  <td className="p-2">{(n.atividades as { titulo?: string })?.titulo ?? "-"}</td>
                  <td className="p-2">{(n.atividades as { data_entrega?: string })?.data_entrega ?? "-"}</td>
                  <td className="p-2">{n.nota ?? "-"}</td>
                  <td className="p-2">{n.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-cyan-500/30 bg-[#10223d] p-4">
          <h2 className="font-semibold text-cyan-200">Roteiros das Aulas</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {roteiros.map((aula) => (
              <li key={aula.id} className="rounded bg-[#0a1628] p-2">
                <p className="font-medium">
                  Aula {aula.numero_aula} - {aula.titulo}
                </p>
                <p className="text-xs text-slate-300">{aula.data_aula}</p>
                <p className="mt-1 text-slate-200">{aula.roteiro}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-cyan-500/30 bg-[#10223d] p-4">
          <h2 className="font-semibold text-cyan-200">Minha Chamada</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {presencas.map((registro) => {
              const aula = registro.aulas as { numero_aula?: number; data_aula?: string; titulo?: string; roteiro?: string } | null;
              return (
                <li key={registro.aula_id} className="rounded bg-[#0a1628] p-2">
                  <p className="font-medium">
                    Aula {aula?.numero_aula ?? "-"} - {aula?.titulo ?? "-"}
                  </p>
                  <p className="text-xs text-slate-300">{aula?.data_aula ?? "-"}</p>
                  <p className={registro.status === "presente" ? "text-emerald-300" : "text-rose-300"}>
                    {registro.status === "presente" ? "Presente" : "Falta"}
                  </p>
                  {aula?.roteiro && <p className="mt-1 text-slate-200">{aula.roteiro}</p>}
                  {registro.observacao && <p className="text-xs text-slate-300">Obs: {registro.observacao}</p>}
                </li>
              );
            })}
          </ul>
        </article>
      </section>
    </div>
  );
}
