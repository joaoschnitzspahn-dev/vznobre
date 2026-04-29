import { createAdminClient } from "@/lib/supabase/admin";
import { generateTemporaryPassword } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function resetarSenha(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const userId = String(formData.get("user_id") ?? "");
  const email = String(formData.get("email") ?? "");
  if (!userId || !email) return;

  const novaSenha = generateTemporaryPassword(12);
  await admin.auth.admin.updateUserById(userId, {
    password: novaSenha,
    user_metadata: { role: "aluno", first_login: true },
  });

  await admin
    .from("student_credentials")
    .upsert({ user_id: userId, email, temp_password: novaSenha, updated_at: new Date().toISOString() });

  revalidatePath("/admin/credenciais");
}

export default async function AdminCredenciaisPage() {
  const admin = createAdminClient();
  const { data: credentials } = await admin
    .from("student_credentials")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <section className="surface-panel rounded-[28px] p-6">
      <h1 className="text-3xl font-black text-white">Credenciais dos Alunos</h1>
      <p className="mt-2 text-sm text-slate-300">As senhas exibidas são provisórias e podem ser regeneradas quando necessário.</p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-300">
              <th className="p-2">Login (email)</th>
              <th className="p-2">Senha provisória</th>
              <th className="p-2">Última atualização</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {credentials?.map((cred) => (
              <tr key={cred.user_id} className="border-t border-white/10">
                <td className="p-2">{cred.email}</td>
                <td className="p-2 font-bold text-cyan-300">{cred.temp_password}</td>
                <td className="p-2">{new Date(cred.updated_at).toLocaleString("pt-BR")}</td>
                <td className="p-2">
                  <form action={resetarSenha}>
                    <input type="hidden" name="user_id" value={cred.user_id} />
                    <input type="hidden" name="email" value={cred.email} />
                    <button className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                      Gerar nova senha
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
