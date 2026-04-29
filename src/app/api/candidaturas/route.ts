import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { onlyDigits, protocolNumber } from "@/lib/utils";

export async function POST(request: Request) {
  const formData = await request.formData();
  const cpf = String(formData.get("cpf") ?? "");
  const protocolo = protocolNumber();
  const foto = formData.get("foto") as File | null;
  const supabase = createAdminClient();

  const { data: duplicated } = await supabase.from("candidaturas").select("id").eq("cpf", cpf).maybeSingle();
  if (duplicated) {
    return NextResponse.json({ error: "CPF já cadastrado no sistema." }, { status: 400 });
  }

  let fotoUrl = "";
  if (foto && foto.size > 0) {
    if (foto.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "A foto deve ter no máximo 5MB." }, { status: 400 });
    }
    if (!["image/jpeg", "image/png"].includes(foto.type)) {
      return NextResponse.json({ error: "Formato inválido. Use JPG ou PNG." }, { status: 400 });
    }
    const filePath = `candidatoss/${Date.now()}-${onlyDigits(cpf)}.${foto.type === "image/png" ? "png" : "jpg"}`;
    const { error: uploadError } = await supabase.storage.from("candidatoss").upload(filePath, foto, {
      upsert: false,
      contentType: foto.type,
    });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });
    const { data } = supabase.storage.from("candidatoss").getPublicUrl(filePath);
    fotoUrl = data.publicUrl;
  }

  const payload = {
    nome: String(formData.get("nome") ?? ""),
    cpf,
    data_nascimento: String(formData.get("dataNascimento") ?? ""),
    escolaridade: String(formData.get("escolaridade") ?? ""),
    cep: String(formData.get("cep") ?? ""),
    rua: String(formData.get("rua") ?? ""),
    numero: String(formData.get("numero") ?? ""),
    bairro: String(formData.get("bairro") ?? ""),
    cidade: String(formData.get("cidade") ?? ""),
    estado: String(formData.get("estado") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    foto_url: fotoUrl,
    curso_id: String(formData.get("curso") ?? ""),
    observacoes: String(formData.get("observacoes") ?? ""),
    protocolo,
    status: "pendente",
  };

  const { error } = await supabase.from("candidaturas").insert(payload);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ protocolo }, { status: 201 });
}
