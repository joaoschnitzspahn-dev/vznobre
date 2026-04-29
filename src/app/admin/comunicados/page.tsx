import { createClient } from "@/lib/supabase/server";

async function criarComunicado(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("comunicados").insert({
    titulo: String(formData.get("titulo") ?? ""),
    conteudo: String(formData.get("conteudo") ?? ""),
    turma_id: String(formData.get("turma_id") ?? "") || null,
  });
}

export default async function AdminComunicadosPage() {
  const supabase = await createClient();
  const { data: comunicados } = await supabase.from("comunicados").select("*").order("created_at", { ascending: false });

  return (
    <section className="glass-card space-y-4 rounded-3xl p-5">
      <h1 className="text-3xl font-extrabold text-cyan-200">Comunicados</h1>
      <form action={criarComunicado} className="space-y-2 rounded-2xl bg-[#0a1628]/80 p-3">
        <input name="titulo" placeholder="Título" className="w-full rounded-xl bg-[#10223d] p-2" />
        <textarea name="conteudo" placeholder="Conteúdo" className="h-24 w-full rounded-xl bg-[#10223d] p-2" />
        <input name="turma_id" placeholder="Turma (opcional)" className="w-full rounded-xl bg-[#10223d] p-2" />
        <button className="rounded-full bg-cyan-400 px-4 py-1.5 text-sm font-bold text-[#0a1628]">Publicar</button>
      </form>
      <ul className="space-y-2 text-sm">
        {comunicados?.map((c) => (
          <li key={c.id} className="rounded-2xl bg-[#0a1628]/80 p-3">
            <p className="font-semibold">{c.titulo}</p>
            <p>{c.conteudo}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
