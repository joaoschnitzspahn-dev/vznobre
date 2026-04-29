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
    <article className="rounded-[18px] bg-white p-7 shadow-[0_2px_20px_rgba(0,0,0,0.08)] transition-all duration-200 ease hover:scale-[1.01]">
      <h3 className="text-2xl font-bold text-[#1d1d1f]">{nome}</h3>
      <p className="mt-3 text-base font-light text-[#6e6e73]">{descricao}</p>
      <ul className="mt-6 space-y-2 text-sm text-[#6e6e73]">
        <li>Duração: {duracao}</li>
        <li>Próxima turma: {proximaTurma}</li>
        <li className={vagas > 0 ? "text-[#1d1d1f]" : "text-[#6e6e73]"}>{status}</li>
      </ul>
      <Link
        href={`/inscricao?curso=${tipo}`}
        className="apple-button-primary mt-6 inline-flex px-5 py-2 text-sm"
      >
        Quero me Inscrever
      </Link>
    </article>
  );
}
