# Visão Nobre - Plataforma Social

Sistema completo para landing page, inscrições, portal do aluno e painel administrativo do projeto social **Visão Nobre**.

## Stack

- Next.js com App Router e TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + Storage)
- Deploy recomendado: Vercel

## Variáveis de ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Setup local

```bash
npm install
npm run dev
```

## Configuração do Supabase

1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase/schema.sql`.
3. Crie o bucket público `candidatoss` no Storage.
4. Em Auth, crie usuários de alunos/admin.
5. Defina `user_metadata.role = "admin"` para usuários administrativos.

## Regras de negócio implementadas

- CPF único em candidaturas e perfis.
- Upload de foto JPG/PNG com limite de 5MB no Supabase Storage.
- Turma de Informática com capacidade de 10 alunos.
- Trigger SQL para fechar turma ao lotar e abrir próxima automaticamente.
- Rotas `/admin` protegidas por middleware com validação de role.
- Rotas `/portal` exigem login.

## Estrutura principal

- `src/app/page.tsx`: landing page pública.
- `src/app/inscricao/*`: formulário e confirmação com protocolo.
- `src/app/portal/page.tsx`: dashboard do aluno.
- `src/app/admin/*`: painel administrativo com sidebar.
- `src/app/api/candidaturas/route.ts`: endpoint de envio da inscrição.
- `src/middleware.ts`: proteção de rotas.

## Deploy na Vercel

1. Conecte o repositório na Vercel.
2. Configure as variáveis de ambiente.
3. Faça o deploy.
