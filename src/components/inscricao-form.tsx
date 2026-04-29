"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { calcAge, cpfMask, phoneMask } from "@/lib/utils";
import { escolaridades } from "@/lib/types";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  cpf: z.string().min(14, "CPF inválido"),
  dataNascimento: z.string().min(1, "Informe a data de nascimento"),
  escolaridade: z.string().min(1, "Selecione a escolaridade"),
  cep: z.string().min(8, "CEP inválido"),
  rua: z.string().min(2, "Rua obrigatória"),
  numero: z.string().min(1, "Número obrigatório"),
  bairro: z.string().min(2, "Bairro obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().min(2, "Estado obrigatório"),
  whatsapp: z.string().min(14, "WhatsApp inválido"),
  email: z.string().email("E-mail inválido"),
  curso: z.enum(["barbeiro", "informatica"]),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function InscricaoForm({ cursoInicial }: { cursoInicial?: string }) {
  const [loadingCep, setLoadingCep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      curso: cursoInicial === "barbeiro" ? "barbeiro" : "informatica",
    },
  });

  const nascimento = watch("dataNascimento");
  const idade = calcAge(nascimento);

  async function preencherCep() {
    const cep = watch("cep")?.replace(/\D/g, "");
    if (!cep || cep.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setValue("rua", data.logradouro ?? "");
        setValue("bairro", data.bairro ?? "");
        setValue("cidade", data.localidade ?? "");
        setValue("estado", data.uf ?? "");
      }
    } finally {
      setLoadingCep(false);
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErro("");
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v ?? "")));
      const fotoInput = document.getElementById("foto") as HTMLInputElement | null;
      if (fotoInput?.files?.[0]) formData.append("foto", fotoInput.files[0]);

      const res = await fetch("/api/candidaturas", { method: "POST", body: formData });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Falha ao enviar inscrição.");
      router.push(`/inscricao/sucesso?protocolo=${payload.protocolo}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="liquid-panel fade-up space-y-4 rounded-[28px] p-6">
      <input {...register("nome")} placeholder="Nome completo" className="input-modern" />
      {errors.nome && <p className="text-sm text-red-300">{errors.nome.message}</p>}

      <input {...register("cpf")} placeholder="CPF" onChange={(e) => setValue("cpf", cpfMask(e.target.value))} className="input-modern" />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" {...register("dataNascimento")} className="input-modern" />
        <input value={idade ? `${idade} anos` : ""} readOnly placeholder="Idade" className="input-modern" />
      </div>
      <select {...register("escolaridade")} className="input-modern">
        <option value="">Escolaridade</option>
        {escolaridades.map((e) => <option key={e} value={e}>{e}</option>)}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input {...register("cep")} onBlur={preencherCep} placeholder="CEP" className="input-modern" />
        <input {...register("rua")} placeholder={loadingCep ? "Buscando..." : "Rua"} className="input-modern" />
        <input {...register("numero")} placeholder="Número" className="input-modern" />
        <input {...register("bairro")} placeholder="Bairro" className="input-modern" />
        <input {...register("cidade")} placeholder="Cidade" className="input-modern" />
        <input {...register("estado")} placeholder="Estado" className="input-modern" />
      </div>

      <input {...register("whatsapp")} placeholder="WhatsApp" onChange={(e) => setValue("whatsapp", phoneMask(e.target.value))} className="input-modern" />
      <input {...register("email")} type="email" placeholder="E-mail" className="input-modern" />
      <input id="foto" type="file" accept="image/png,image/jpeg" className="input-modern" />

      <select {...register("curso")} className="input-modern">
        <option value="barbeiro">Curso de Barbeiro</option>
        <option value="informatica">Informática Básica</option>
      </select>
      <textarea {...register("observacoes")} placeholder="Observações (opcional)" className="input-modern h-24" />

      <p className="text-sm text-cyan-100">Sua inscrição será analisada e entraremos em contato pelo WhatsApp em caso de aprovação.</p>
      {erro && <p className="text-sm text-red-300">{erro}</p>}
      <button disabled={loading} className="neon-button px-5 py-2 disabled:opacity-60">
        {loading ? "Enviando..." : "Enviar inscrição"}
      </button>
    </form>
  );
}
