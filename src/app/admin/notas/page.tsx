import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function criarAtividade(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const payload = {
    turma_id: String(formData.get("turma_id") ?? ""),
    titulo: String(formData.get("titulo") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    data_entrega: String(formData.get("data_entrega") ?? ""),
    nota_maxima: Number(formData.get("nota_maxima") ?? 10),
  };
  await supabase.from("atividades").insert(payload);
  revalidatePath("/admin/notas");
}

async function lancarNota(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const payload = {
    aluno_id: String(formData.get("aluno_id") ?? ""),
    atividade_id: String(formData.get("atividade_id") ?? ""),
    nota: Number(formData.get("nota") ?? 0),
    status: String(formData.get("status") ?? "entregue"),
    observacao: String(formData.get("observacao") ?? ""),
  };

  const { data: existente } = await supabase
    .from("notas")
    .select("id")
    .eq("aluno_id", payload.aluno_id)
    .eq("atividade_id", payload.atividade_id)
    .maybeSingle();

  if (existente?.id) {
    await supabase.from("notas").update(payload).eq("id", existente.id);
  } else {
    await supabase.from("notas").insert(payload);
  }

  revalidatePath("/admin/notas");
}

export default async function AdminNotasPage() {
  const supabase = await createClient();
  const [{ data: atividades }, { data: notas }, { data: turmas }, { data: alunos }] = await Promise.all([
    supabase.from("atividades").select("*").order("created_at", { ascending: false }).limit(30),
    supabase.from("notas").select("*, atividades(titulo), profiles(nome)").order("id", { ascending: false }).limit(30),
    supabase.from("turmas").select("id,trimestre,ano").order("ano", { ascending: false }),
    supabase.from("profiles").select("user_id,nome").eq("status", "aprovado").order("nome"),
  ]);

  return (
    <section className="glass-card space-y-5 rounded-3xl p-5">
      <h1 className="text-3xl font-extrabold text-cyan-200">Notas e Atividades</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <form action={criarAtividade} className="rounded-2xl bg-[#0a1628]/80 p-4 text-sm">
          <h2 className="font-semibold text-cyan-100">Criar atividade</h2>
          <div className="mt-3 space-y-2">
            <select name="turma_id" className="w-full rounded-xl bg-[#10223d] p-2">
              <option value="">Selecione a turma</option>
              {turmas?.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  Turma {turma.trimestre}º tri/{turma.ano}
                </option>
              ))}
            </select>
            <input name="titulo" placeholder="Nome da atividade" className="w-full rounded-xl bg-[#10223d] p-2" />
            <textarea name="descricao" placeholder="Descrição" className="h-20 w-full rounded-xl bg-[#10223d] p-2" />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" name="data_entrega" className="rounded-xl bg-[#10223d] p-2" />
              <input type="number" step="0.5" min="0" max="10" name="nota_maxima" placeholder="Nota máxima" className="rounded-xl bg-[#10223d] p-2" />
            </div>
            <button className="rounded-full bg-cyan-400 px-4 py-1.5 font-bold text-[#0a1628]">Salvar atividade</button>
          </div>
        </form>

        <form action={lancarNota} className="rounded-2xl bg-[#0a1628]/80 p-4 text-sm">
          <h2 className="font-semibold text-cyan-100">Lançar nota</h2>
          <div className="mt-3 space-y-2">
            <select name="aluno_id" className="w-full rounded-xl bg-[#10223d] p-2">
              <option value="">Selecione o aluno</option>
              {alunos?.map((aluno) => (
                <option key={aluno.user_id} value={aluno.user_id}>
                  {aluno.nome}
                </option>
              ))}
            </select>
            <select name="atividade_id" className="w-full rounded-xl bg-[#10223d] p-2">
              <option value="">Selecione a atividade</option>
              {atividades?.map((atividade) => (
                <option key={atividade.id} value={atividade.id}>
                  {atividade.titulo}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" step="0.5" min="0" max="10" name="nota" placeholder="Nota" className="rounded-xl bg-[#10223d] p-2" />
              <select name="status" className="rounded-xl bg-[#10223d] p-2">
                <option value="entregue">Entregue</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
            <textarea name="observacao" placeholder="Observação (opcional)" className="h-20 w-full rounded-xl bg-[#10223d] p-2" />
            <button className="rounded-full bg-cyan-400 px-4 py-1.5 font-bold text-[#0a1628]">Salvar nota</button>
          </div>
        </form>
      </div>

      <article className="rounded-2xl bg-[#0a1628]/80 p-3 text-sm">
        <h2 className="font-semibold text-cyan-100">Atividades criadas</h2>
        <ul className="mt-2 space-y-1 text-slate-200">
          {atividades?.map((a) => (
            <li key={a.id}>{a.titulo} - entrega {a.data_entrega} - nota máxima {a.nota_maxima}</li>
          ))}
        </ul>
      </article>
      <article className="rounded-2xl bg-[#0a1628]/80 p-3 text-sm">
        <h2 className="font-semibold text-cyan-100">Notas lançadas</h2>
        <ul className="mt-2 space-y-1 text-slate-200">
          {notas?.map((n) => (
            <li key={n.id}>
              {(n.profiles as { nome?: string })?.nome ?? "Aluno"} - {(n.atividades as { titulo?: string })?.titulo ?? "Atividade"}: {n.nota} ({n.status})
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
