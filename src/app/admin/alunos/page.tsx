import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function atualizarVinculos(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const userId = String(formData.get("user_id") ?? "");
  const cursoId = String(formData.get("curso_id") ?? "") || null;
  const turmaId = String(formData.get("turma_id") ?? "") || null;
  if (!userId) return;

  await admin.from("profiles").update({ curso_id: cursoId, turma_id: turmaId }).eq("user_id", userId);
  revalidatePath("/admin/alunos");
}

export default async function AdminAlunosPage() {
  const supabase = await createClient();
  const [{ data: alunos }, { data: cursos }, { data: turmas }] = await Promise.all([
    supabase.from("profiles").select("*").eq("status", "aprovado").order("nome"),
    supabase.from("cursos").select("id,nome").eq("ativo", true).order("nome"),
    supabase.from("turmas").select("id,trimestre,ano,status").order("ano", { ascending: false }),
  ]);

  return (
    <section className="surface-panel rounded-[28px] p-6">
      <h1 className="text-3xl font-black text-white">Gestão de Alunos</h1>
      <p className="mt-2 text-sm text-slate-300">Você pode ajustar manualmente curso e turma de cada aluno aprovado.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {alunos?.map((aluno) => (
          <article key={aluno.id} className="liquid-panel rounded-2xl p-4 text-sm">
            <p className="font-semibold text-white">{aluno.nome}</p>
            <p className="text-slate-300">Contato: {aluno.whatsapp}</p>
            <form action={atualizarVinculos} className="mt-3 space-y-2">
              <input type="hidden" name="user_id" value={aluno.user_id} />
              <select name="curso_id" defaultValue={aluno.curso_id ?? ""} className="input-modern">
                <option value="">Selecionar curso</option>
                {cursos?.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
              <select name="turma_id" defaultValue={aluno.turma_id ?? ""} className="input-modern">
                <option value="">Selecionar turma</option>
                {turmas?.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.trimestre}º tri/{turma.ano} - {turma.status}
                  </option>
                ))}
              </select>
              <button className="neon-button px-4 py-1.5 text-xs">Salvar vínculo</button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}
