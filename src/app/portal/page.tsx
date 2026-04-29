import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/reveal";

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
    <main className="mx-auto w-full max-w-[980px] pb-16">
      <Reveal className="apple-section">
        <h1 className="text-[56px] font-bold tracking-[-0.02em] text-[#1d1d1f]">Portal do Aluno</h1>
        <p className="mt-3 text-lg font-light text-[#6e6e73]">Bem-vindo(a), {perfil?.nome ?? user?.email}</p>
      </Reveal>

      <Reveal className="apple-section border-t border-[#e5e5ea] pt-14">
        <section className="space-y-2">
          <h2 className="text-3xl font-bold text-[#1d1d1f]">Perfil</h2>
          <p className="text-[#6e6e73]">Curso atual: {perfil?.curso_id ?? "-"}</p>
          <p className="text-[#6e6e73]">Turma: {perfil?.turma_id ?? "-"}</p>
          <p className="text-[#6e6e73]">WhatsApp: {perfil?.whatsapp ?? "-"}</p>
        </section>
      </Reveal>

      <Reveal className="apple-section border-t border-[#e5e5ea] pt-14">
        <section>
          <h2 className="text-3xl font-bold text-[#1d1d1f]">Comunicados</h2>
          <ul className="mt-5 space-y-4 text-base">
            {comunicados?.map((c) => (
              <li key={c.id} className="border-b border-[#e5e5ea] pb-4">
                <p className="font-semibold text-[#1d1d1f]">{c.titulo}</p>
                <p className="mt-1 font-light text-[#6e6e73]">{c.conteudo}</p>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal className="apple-section border-t border-[#e5e5ea] pt-14">
        <section>
        <h2 className="text-3xl font-bold text-[#1d1d1f]">Atividades</h2>
        <ul className="mt-5 space-y-4 text-base">
          {atividades?.map((a) => (
            <li key={a.id} className="border-b border-[#e5e5ea] pb-4">
              <p className="font-semibold text-[#1d1d1f]">{a.titulo}</p>
              <p className="font-light text-[#6e6e73]">{a.descricao}</p>
              <p className="mt-1 text-sm text-[#6e6e73]">Entrega: {a.data_entrega}</p>
            </li>
          ))}
        </ul>
      </section>
      </Reveal>

      <Reveal className="apple-section border-t border-[#e5e5ea] pt-14">
        <section>
        <h2 className="text-3xl font-bold text-[#1d1d1f]">Notas</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5e5ea] text-[11px] uppercase tracking-[0.08em] text-[#6e6e73]">
                <th className="py-3">Atividade</th>
                <th className="py-3">Data</th>
                <th className="py-3">Nota</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {notas?.map((n) => (
                <tr key={n.atividade_id} className="border-b border-[#f0f0f2] text-[#1d1d1f]">
                  <td className="py-3">{(n.atividades as { titulo?: string })?.titulo ?? "-"}</td>
                  <td className="py-3 text-[#6e6e73]">{(n.atividades as { data_entrega?: string })?.data_entrega ?? "-"}</td>
                  <td className="py-3">{n.nota ?? "-"}</td>
                  <td className="py-3 text-[#6e6e73]">{n.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </Reveal>

      <Reveal className="apple-section border-t border-[#e5e5ea] pt-14">
      <section className="grid gap-10 md:grid-cols-2">
        <article>
          <h2 className="text-3xl font-bold text-[#1d1d1f]">Roteiros das Aulas</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {roteiros.map((aula) => (
              <li key={aula.id} className="border-b border-[#e5e5ea] pb-3">
                <p className="font-semibold text-[#1d1d1f]">
                  Aula {aula.numero_aula} - {aula.titulo}
                </p>
                <p className="text-xs text-[#6e6e73]">{aula.data_aula}</p>
                <p className="mt-1 font-light text-[#6e6e73]">{aula.roteiro}</p>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <h2 className="text-3xl font-bold text-[#1d1d1f]">Minha Chamada</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {presencas.map((registro) => {
              const aula = registro.aulas as { numero_aula?: number; data_aula?: string; titulo?: string; roteiro?: string } | null;
              return (
                <li key={registro.aula_id} className="border-b border-[#e5e5ea] pb-3">
                  <p className="font-semibold text-[#1d1d1f]">
                    Aula {aula?.numero_aula ?? "-"} - {aula?.titulo ?? "-"}
                  </p>
                  <p className="text-xs text-[#6e6e73]">{aula?.data_aula ?? "-"}</p>
                  <p className={registro.status === "presente" ? "text-[#1d1d1f]" : "text-[#6e6e73]"}>
                    {registro.status === "presente" ? "Presente" : "Falta"}
                  </p>
                  {aula?.roteiro && <p className="mt-1 font-light text-[#6e6e73]">{aula.roteiro}</p>}
                  {registro.observacao && <p className="text-xs text-[#6e6e73]">Obs: {registro.observacao}</p>}
                </li>
              );
            })}
          </ul>
        </article>
      </section>
      </Reveal>
    </main>
  );
}
