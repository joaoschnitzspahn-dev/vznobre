"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Reveal } from "@/components/reveal";

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
    <main className="mx-auto w-full max-w-[980px]">
      <Reveal className="apple-section">
        <div className="mx-auto max-w-md rounded-[18px] bg-white p-7 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
          <h1 className="mb-1 text-4xl font-bold tracking-[-0.01em] text-[#1d1d1f]">Entrar</h1>
          <p className="mb-4 text-sm text-[#6e6e73]">Acesse seu painel de acompanhamento.</p>
          <div className="space-y-3">
            <input className="input-modern" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input-modern" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <button onClick={submit} disabled={loading} className="apple-button-primary px-5 py-2 text-sm">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
