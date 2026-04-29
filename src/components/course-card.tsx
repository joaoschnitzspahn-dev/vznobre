"use client";

import Link from "next/link";

type Props = {
  nome: string;
  descricao: string;
  duracao: string;
  proximaTurma: string;
  vagas: number;
  tipo: string;
};

export function CourseCard({ nome, descricao, duracao, proximaTurma, vagas, tipo }: Props) {
  const status = vagas > 0 ? `${vagas} vagas disponíveis` : "Aguardando próxima turma";

  return (
    <article className="liquid-panel hover-lift rounded-[24px] p-6">
      <h3 className="text-xl font-black text-white">{nome}</h3>
      <p className="mt-3 text-sm text-slate-300">{descricao}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        <li>Duração: {duracao}</li>
        <li>Próxima turma: {proximaTurma}</li>
        <li className={vagas > 0 ? "text-emerald-300" : "text-amber-300"}>{status}</li>
      </ul>
      <Link
        href={`/inscricao?curso=${tipo}`}
        className="neon-button mt-5 inline-flex px-4 py-2 text-sm"
      >
        Quero me Inscrever
      </Link>
    </article>
  );
}
