import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const roteiroInformatica = [
  "Conhecendo o computador (CPU, monitor, teclado, mouse, ligar/desligar corretamente).",
  "Mouse e teclado na prática (cliques, atalhos, digitação básica).",
  "Pastas e arquivos (criar, salvar, organizar, downloads).",
  "Internet básica (Google, links, criação de e-mail, segurança digital).",
  "Introdução ao Word (digitação, salvar, formatação básica).",
  "Formatação e imagens no Word (alinhar texto, inserir imagem, títulos).",
  "Criando um currículo simples (dados pessoais, objetivo, apresentação).",
  "Trabalho escolar completo (capa, texto formatado, salvar em PDF).",
  "Excel básico (planilhas, soma simples, organização).",
  "Controle financeiro simples (organização de gastos mensais).",
  "PowerPoint básico (criar slides, inserir imagem, transições simples).",
  "Apresentação final (tema livre por aluno).",
];

async function criarAula(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const payload = {
    turma_id: String(formData.get("turma_id") ?? ""),
    numero_aula: Number(formData.get("numero_aula") ?? 1),
    data_aula: String(formData.get("data_aula") ?? ""),
    titulo: String(formData.get("titulo") ?? ""),
    roteiro: String(formData.get("roteiro") ?? ""),
  };
  if (!payload.turma_id || !payload.data_aula || !payload.titulo || !payload.roteiro) return;
  await admin.from("aulas").insert(payload);
  revalidatePath("/admin/chamadas");
}

async function importarRoteiroInformatica(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const turmaId = String(formData.get("turma_id_import") ?? "");
  const dataInicio = String(formData.get("data_inicio_import") ?? "");
  if (!turmaId || !dataInicio) return;

  const inicio = new Date(`${dataInicio}T00:00:00`);
  const aulas = roteiroInformatica.map((roteiro, index) => {
    const dataAula = new Date(inicio);
    dataAula.setDate(inicio.getDate() + index * 7);
    const yyyy = dataAula.getFullYear();
    const mm = String(dataAula.getMonth() + 1).padStart(2, "0");
    const dd = String(dataAula.getDate()).padStart(2, "0");
    return {
      turma_id: turmaId,
      numero_aula: index + 1,
      data_aula: `${yyyy}-${mm}-${dd}`,
      titulo: `Aula ${index + 1} - Informática Básica`,
      roteiro,
    };
  });

  for (const aula of aulas) {
    const { data: existente } = await admin
      .from("aulas")
      .select("id")
      .eq("turma_id", aula.turma_id)
      .eq("numero_aula", aula.numero_aula)
      .maybeSingle();

    if (existente?.id) {
      await admin.from("aulas").update(aula).eq("id", existente.id);
    } else {
      await admin.from("aulas").insert(aula);
    }
  }

  revalidatePath("/admin/chamadas");
}

async function salvarChamada(formData: FormData) {
  "use server";
  const admin = createAdminClient();
  const aulaId = String(formData.get("aula_id") ?? "");
  if (!aulaId) return;

  const registros: { aula_id: string; aluno_id: string; status: string; observacao: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("status_")) continue;
    const alunoId = key.replace("status_", "");
    const status = String(value);
    const observacao = String(formData.get(`obs_${alunoId}`) ?? "");
    if (!alunoId || !status) continue;
    registros.push({ aula_id: aulaId, aluno_id: alunoId, status, observacao });
  }

  if (registros.length > 0) {
    await admin.from("presencas").upsert(registros, { onConflict: "aula_id,aluno_id" });
  }
  revalidatePath("/admin/chamadas");
}

export default async function AdminChamadasPage({
  searchParams,
}: {
  searchParams: Promise<{ aula?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();

  const [{ data: turmas }, { data: aulas }] = await Promise.all([
    admin.from("turmas").select("id,trimestre,ano,status").order("ano", { ascending: false }),
    admin
      .from("aulas")
      .select("id,turma_id,numero_aula,data_aula,titulo")
      .order("data_aula", { ascending: false })
      .order("numero_aula", { ascending: false })
      .limit(20),
  ]);

  const aulaSelecionadaId = params.aula || aulas?.[0]?.id;
  let alunosDaAula: Array<{ user_id: string; nome: string }> = [];
  let aulaSelecionada: { id: string; turma_id: string; numero_aula: number; data_aula: string; titulo: string } | null = null;
  let presencasMap = new Map<string, { status: string; observacao: string }>();

  if (aulaSelecionadaId) {
    const { data: aula } = await admin
      .from("aulas")
      .select("id,turma_id,numero_aula,data_aula,titulo")
      .eq("id", aulaSelecionadaId)
      .maybeSingle();
    if (aula) {
      aulaSelecionada = aula;
      const [{ data: alunos }, { data: presencas }] = await Promise.all([
        admin.from("profiles").select("user_id,nome").eq("turma_id", aula.turma_id).eq("status", "aprovado").order("nome"),
        admin.from("presencas").select("aluno_id,status,observacao").eq("aula_id", aula.id),
      ]);
      alunosDaAula = alunos ?? [];
      presencasMap = new Map((presencas ?? []).map((p) => [p.aluno_id, { status: p.status, observacao: p.observacao ?? "" }]));
    }
  }

  return (
    <section className="rounded-[18px] bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
      <h1 className="text-3xl font-bold text-[#1d1d1f]">Chamada e Roteiro</h1>
      <p className="mt-2 text-sm text-[#6e6e73]">Crie a aula com data, número e roteiro. Depois marque presença/falta dos matriculados.</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <form action={criarAula} className="rounded-[18px] bg-[#fafafa] p-4">
          <h2 className="font-bold text-[#1d1d1f]">Nova aula com roteiro</h2>
          <div className="mt-3 space-y-2">
            <select name="turma_id" className="input-modern">
              <option value="">Selecione a turma</option>
              {turmas?.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  Turma {turma.trimestre}º tri/{turma.ano} - {turma.status}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" name="numero_aula" min={1} placeholder="Número da aula" className="input-modern" />
              <input type="date" name="data_aula" className="input-modern" />
            </div>
            <input name="titulo" placeholder="Título da aula" className="input-modern" />
            <textarea name="roteiro" placeholder="Roteiro da aula" className="input-modern h-28" />
            <button className="apple-button-primary px-4 py-2 text-sm">Salvar aula</button>
          </div>
        </form>

        <div className="space-y-4">
          <form action={importarRoteiroInformatica} className="rounded-[18px] bg-[#fafafa] p-4">
            <h2 className="font-bold text-[#1d1d1f]">Importar roteiro completo (PDF Informática)</h2>
            <p className="mt-1 text-xs text-[#6e6e73]">Gera automaticamente 12 aulas semanais com base no material enviado.</p>
            <div className="mt-3 space-y-2">
              <select name="turma_id_import" className="input-modern">
                <option value="">Selecione a turma</option>
                {turmas?.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    Turma {turma.trimestre}º tri/{turma.ano} - {turma.status}
                  </option>
                ))}
              </select>
              <input type="date" name="data_inicio_import" className="input-modern" />
              <button className="apple-button-primary px-4 py-2 text-sm">Importar 12 aulas</button>
            </div>
          </form>

        <div className="rounded-[18px] bg-[#fafafa] p-4">
          <h2 className="font-bold text-[#1d1d1f]">Aulas lançadas</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {aulas?.map((aula) => (
              <li key={aula.id} className="rounded-xl border border-[#e5e5ea] bg-white p-2 text-[#1d1d1f]">
                <p className="font-semibold">
                  Aula {aula.numero_aula} - {aula.titulo}
                </p>
                <p>{aula.data_aula}</p>
                <Link href={`/admin/chamadas?aula=${aula.id}`} className="mt-1 inline-block text-[#0071e3]">
                  Fazer chamada
                </Link>
              </li>
            ))}
          </ul>
        </div>
        </div>
      </div>

      {aulaSelecionada && (
        <form action={salvarChamada} className="mt-5 rounded-[18px] bg-[#fafafa] p-4">
          <input type="hidden" name="aula_id" value={aulaSelecionada.id} />
          <h2 className="font-bold text-[#1d1d1f]">
            Chamada - Aula {aulaSelecionada.numero_aula} ({aulaSelecionada.data_aula})
          </h2>
          <p className="text-sm text-[#6e6e73]">{aulaSelecionada.titulo}</p>
          <div className="mt-3 grid gap-2">
            {alunosDaAula.map((aluno) => {
              const atual = presencasMap.get(aluno.user_id);
              return (
                <div key={aluno.user_id} className="grid gap-2 rounded-xl border border-[#e5e5ea] bg-white p-3 md:grid-cols-[1fr_180px_1fr]">
                  <p className="font-semibold text-[#1d1d1f]">{aluno.nome}</p>
                  <select name={`status_${aluno.user_id}`} defaultValue={atual?.status ?? "presente"} className="input-modern">
                    <option value="presente">Presente</option>
                    <option value="falta">Falta</option>
                  </select>
                  <input
                    name={`obs_${aluno.user_id}`}
                    defaultValue={atual?.observacao ?? ""}
                    placeholder="Observação"
                    className="input-modern"
                  />
                </div>
              );
            })}
          </div>
          <button className="apple-button-primary mt-4 px-4 py-2 text-sm">Salvar chamada</button>
        </form>
      )}
    </section>
  );
}
