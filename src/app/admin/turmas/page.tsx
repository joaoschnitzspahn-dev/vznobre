import { createClient } from "@/lib/supabase/server";

export default async function AdminTurmasPage() {
  const supabase = await createClient();
  const { data: turmas } = await supabase.from("turmas").select("*").order("ano", { ascending: false });

  return (
    <section className="glass-card rounded-3xl p-5">
      <h1 className="text-3xl font-extrabold text-cyan-200">Gestão de Turmas</h1>
      <p className="mt-2 text-sm text-slate-200">
        Regra de negócio aplicada no banco: turma trimestral de Informática fecha ao atingir 10 aprovados e cria a próxima.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {turmas?.map((t) => (
          <article key={t.id} className="rounded-2xl bg-[#0a1628]/80 p-3 text-sm">
            <p className="font-semibold">{t.trimestre}º trimestre/{t.ano}</p>
            <p>Vagas: {t.vagas_preenchidas}/{t.capacidade} preenchidas</p>
            <p>Status: {t.status}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
