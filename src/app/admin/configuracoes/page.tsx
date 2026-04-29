import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function salvarLanding(formData: FormData) {
  "use server";
  const supabase = await createClient();

  const valoresTexto = String(formData.get("valores") ?? "");
  const valores = valoresTexto
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await supabase.from("site_config").upsert(
    {
      id: 1,
      slogan: String(formData.get("slogan") ?? ""),
      missao: String(formData.get("missao") ?? ""),
      valores,
      whatsapp: String(formData.get("whatsapp") ?? ""),
      email: String(formData.get("email") ?? ""),
      instagram: String(formData.get("instagram") ?? ""),
    },
    { onConflict: "id" },
  );

  const cursos = [
    {
      id: String(formData.get("curso_barbeiro_id") ?? ""),
      descricao: String(formData.get("curso_barbeiro_descricao") ?? ""),
      ativo: formData.get("curso_barbeiro_ativo") === "on",
    },
    {
      id: String(formData.get("curso_info_id") ?? ""),
      descricao: String(formData.get("curso_info_descricao") ?? ""),
      ativo: formData.get("curso_info_ativo") === "on",
    },
  ].filter((curso) => curso.id);

  for (const curso of cursos) {
    await supabase.from("cursos").update({ descricao: curso.descricao, ativo: curso.ativo }).eq("id", curso.id);
  }

  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
}

export default async function AdminConfiguracoesPage() {
  const supabase = await createClient();
  const [{ data: config }, { data: cursos }] = await Promise.all([
    supabase.from("site_config").select("*").eq("id", 1).maybeSingle(),
    supabase.from("cursos").select("*").order("nome"),
  ]);

  const barbeiro = cursos?.find((curso) => curso.tipo === "barbeiro");
  const info = cursos?.find((curso) => curso.tipo === "informatica");

  return (
    <section className="glass-card space-y-5 rounded-3xl p-6">
      <div>
        <h1 className="text-3xl font-extrabold text-cyan-200">Configurações da Landing</h1>
        <p className="mt-1 text-sm text-slate-300">Edite os conteúdos públicos do site de forma rápida.</p>
      </div>

      <form action={salvarLanding} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-[#0a1628]/80 p-4">
            <label className="text-sm text-cyan-200">Slogan</label>
            <textarea
              name="slogan"
              defaultValue={config?.slogan ?? ""}
              className="mt-2 h-24 w-full rounded-xl bg-[#091427] p-3 text-sm"
            />
          </div>
          <div className="rounded-2xl bg-[#0a1628]/80 p-4">
            <label className="text-sm text-cyan-200">Missão</label>
            <textarea
              name="missao"
              defaultValue={config?.missao ?? ""}
              className="mt-2 h-24 w-full rounded-xl bg-[#091427] p-3 text-sm"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[#0a1628]/80 p-4">
          <label className="text-sm text-cyan-200">Valores (separados por vírgula)</label>
          <input
            name="valores"
            defaultValue={(config?.valores ?? []).join(", ")}
            className="mt-2 w-full rounded-xl bg-[#091427] p-3 text-sm"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <input name="whatsapp" defaultValue={config?.whatsapp ?? ""} placeholder="WhatsApp" className="rounded-xl bg-[#091427] p-3 text-sm" />
          <input name="email" defaultValue={config?.email ?? ""} placeholder="E-mail" className="rounded-xl bg-[#091427] p-3 text-sm" />
          <input name="instagram" defaultValue={config?.instagram ?? ""} placeholder="Instagram" className="rounded-xl bg-[#091427] p-3 text-sm" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-[#0a1628]/80 p-4">
            <p className="font-semibold text-cyan-200">Curso de Barbeiro</p>
            <input type="hidden" name="curso_barbeiro_id" defaultValue={barbeiro?.id ?? ""} />
            <textarea
              name="curso_barbeiro_descricao"
              defaultValue={barbeiro?.descricao ?? ""}
              className="mt-2 h-24 w-full rounded-xl bg-[#091427] p-3 text-sm"
            />
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" name="curso_barbeiro_ativo" defaultChecked={barbeiro?.ativo ?? true} />
              Inscrições ativas
            </label>
          </div>

          <div className="rounded-2xl bg-[#0a1628]/80 p-4">
            <p className="font-semibold text-cyan-200">Informática Básica</p>
            <input type="hidden" name="curso_info_id" defaultValue={info?.id ?? ""} />
            <textarea
              name="curso_info_descricao"
              defaultValue={info?.descricao ?? ""}
              className="mt-2 h-24 w-full rounded-xl bg-[#091427] p-3 text-sm"
            />
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" name="curso_info_ativo" defaultChecked={info?.ativo ?? true} />
              Inscrições ativas
            </label>
          </div>
        </div>

        <button className="rounded-full bg-cyan-400 px-5 py-2 font-bold text-[#0a1628]">Salvar alterações</button>
      </form>
    </section>
  );
}
