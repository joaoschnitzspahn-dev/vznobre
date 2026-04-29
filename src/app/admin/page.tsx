import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateTemporaryPassword } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function atualizarStatus(id: string, status: "aprovado" | "reprovado") {
  "use server";
  const adminSupabase = createAdminClient();

  if (status === "reprovado") {
    await adminSupabase.from("candidaturas").update({ status }).eq("id", id);
    revalidatePath("/admin");
    return;
  }

  const { data: candidatura, error: candidaturaError } = await adminSupabase
    .from("candidaturas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (candidaturaError || !candidatura) return;
  if (!candidatura.email) return;

  const { data: curso } = await adminSupabase
    .from("cursos")
    .select("id")
    .eq("tipo", candidatura.curso_id)
    .maybeSingle();

  let userId = "";
  const senhaProvisoria = generateTemporaryPassword(12);

  const { data: profileExists } = await adminSupabase
    .from("profiles")
    .select("user_id")
    .eq("cpf", candidatura.cpf)
    .maybeSingle();

  if (profileExists?.user_id) {
    userId = profileExists.user_id;
    await adminSupabase.auth.admin.updateUserById(userId, {
      password: senhaProvisoria,
      user_metadata: { role: "aluno", first_login: true },
    });
  } else {
    const { data: userData, error: createUserError } = await adminSupabase.auth.admin.createUser({
      email: candidatura.email,
      password: senhaProvisoria,
      email_confirm: true,
      user_metadata: { role: "aluno", first_login: true },
    });

    if (createUserError) {
      const { data: usersPage } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = usersPage?.users?.find((user) => user.email?.toLowerCase() === candidatura.email.toLowerCase());
      if (!existing?.id) return;
      userId = existing.id;
      await adminSupabase.auth.admin.updateUserById(userId, {
        password: senhaProvisoria,
        user_metadata: { role: "aluno", first_login: true },
      });
    } else {
      userId = userData.user.id;
    }
  }

  if (!userId) return;

  await adminSupabase.from("profiles").upsert(
    {
      user_id: userId,
      nome: candidatura.nome,
      cpf: candidatura.cpf,
      data_nascimento: candidatura.data_nascimento,
      escolaridade: candidatura.escolaridade,
      endereco: {
        cep: candidatura.cep,
        rua: candidatura.rua,
        numero: candidatura.numero,
        bairro: candidatura.bairro,
        cidade: candidatura.cidade,
        estado: candidatura.estado,
      },
      whatsapp: candidatura.whatsapp,
      email: candidatura.email,
      foto_url: candidatura.foto_url,
      curso_id: curso?.id ?? null,
      turma_id: candidatura.turma_id ?? null,
      status: "aprovado",
    },
    { onConflict: "user_id" },
  );

  await adminSupabase
    .from("student_credentials")
    .upsert({ user_id: userId, email: candidatura.email, temp_password: senhaProvisoria, updated_at: new Date().toISOString() });

  await adminSupabase.from("candidaturas").update({ status: "aprovado" }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/alunos");
  revalidatePath("/admin/credenciais");
}

export default async function AdminInscricoesPage() {
  const supabase = await createClient();
  const { data: candidaturas } = await supabase
    .from("candidaturas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <section className="surface-panel rounded-[28px] p-6">
      <h1 className="text-3xl font-black text-white">Gestão de Inscrições</h1>
      <p className="mt-2 text-sm text-slate-300">Ao aprovar, o sistema cria automaticamente login do aluno com senha provisória.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-300">
              <th className="p-2">Nome</th>
              <th className="p-2">Curso</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {candidaturas?.map((c) => (
              <tr key={c.id} className="border-t border-white/10">
                <td className="p-2">{c.nome}</td>
                <td className="p-2">{c.curso_id}</td>
                <td className="p-2">{c.status}</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-2">
                    <form action={atualizarStatus.bind(null, c.id, "aprovado")}>
                      <button className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">Aprovar</button>
                    </form>
                    <form action={atualizarStatus.bind(null, c.id, "reprovado")}>
                      <button className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">Reprovar</button>
                    </form>
                    <a
                      href={`https://wa.me/55${String(c.whatsapp).replace(/\D/g, "")}`}
                      target="_blank"
                      className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white"
                    >
                      WhatsApp
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
