"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit() {
    setLoading(true);
    setErro("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }
    const role = data.user.user_metadata?.role;
    router.push(role === "admin" ? "/admin" : "/portal");
  }

  return (
    <div className="mx-auto mt-12 w-full max-w-md rounded-[28px] p-6 liquid-panel fade-up">
      <h1 className="mb-1 text-3xl font-black text-white">Entrar</h1>
      <p className="mb-4 text-sm text-slate-300">Acesse seu painel de acompanhamento.</p>
      <div className="space-y-3">
        <input className="input-modern" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input-modern" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
        {erro && <p className="text-sm text-red-300">{erro}</p>}
        <button onClick={submit} disabled={loading} className="neon-button px-5 py-2">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
