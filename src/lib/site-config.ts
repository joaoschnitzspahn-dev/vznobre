import { createClient } from "@/lib/supabase/server";
import { cursos as cursosFallback, sobreProjeto } from "@/lib/content";

export type SiteConfig = {
  slogan: string;
  missao: string;
  valores: string[];
  whatsapp: string;
  email: string;
  instagram: string;
};

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_config").select("*").eq("id", 1).maybeSingle();

  return {
    slogan: data?.slogan ?? "Educação e acolhimento para construir um futuro com dignidade e oportunidades.",
    missao: data?.missao ?? sobreProjeto.missao,
    valores: data?.valores ?? sobreProjeto.valores,
    whatsapp: data?.whatsapp ?? "(11) 99999-9999",
    email: data?.email ?? "contato@visaonobre.org",
    instagram: data?.instagram ?? "@visaonobre",
  };
}

export async function getCursosLanding() {
  const supabase = await createClient();
  const { data } = await supabase.from("cursos").select("*").order("nome");

  if (!data || data.length === 0) {
    return cursosFallback.map((c) => ({ ...c, ativo: true }));
  }

  const extras = new Map(cursosFallback.map((c) => [c.tipo, c]));
  return data.map((curso) => {
    const base = extras.get(curso.tipo);
    return {
      id: curso.id,
      nome: curso.nome,
      tipo: curso.tipo,
      descricao: curso.descricao,
      duracao: base?.duracao ?? "A definir",
      proximaTurma: base?.proximaTurma ?? "Em breve",
      vagas: base?.vagas ?? 0,
      ativo: curso.ativo,
    };
  });
}
