create extension if not exists "pgcrypto";

create table if not exists cursos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text not null,
  ativo boolean not null default true,
  tipo text not null unique
);

create table if not exists turmas (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid references cursos(id) not null,
  trimestre int not null check (trimestre between 1 and 4),
  ano int not null,
  capacidade int not null default 10,
  vagas_preenchidas int not null default 0,
  status text not null default 'aberta',
  data_inicio date,
  data_fim date
);

create table if not exists candidaturas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text not null unique,
  data_nascimento date not null,
  escolaridade text not null,
  cep text not null,
  rua text not null,
  numero text not null,
  bairro text not null,
  cidade text not null,
  estado text not null,
  whatsapp text not null,
  email text,
  foto_url text,
  curso_id text not null,
  observacoes text,
  protocolo text not null unique,
  status text not null default 'pendente',
  turma_id uuid references turmas(id),
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  nome text not null,
  cpf text not null unique,
  data_nascimento date not null,
  escolaridade text not null,
  endereco jsonb not null,
  whatsapp text not null,
  email text,
  foto_url text,
  curso_id uuid references cursos(id),
  turma_id uuid references turmas(id),
  status text not null default 'aprovado',
  created_at timestamptz not null default now()
);

create table if not exists atividades (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid references turmas(id) not null,
  titulo text not null,
  descricao text not null,
  data_entrega date not null,
  nota_maxima numeric(5,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists notas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references profiles(user_id) not null,
  atividade_id uuid references atividades(id) not null,
  nota numeric(5,2),
  status text not null,
  observacao text
);

create table if not exists comunicados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  conteudo text not null,
  turma_id uuid references turmas(id),
  created_at timestamptz not null default now()
);

create table if not exists site_config (
  id int primary key,
  slogan text not null,
  missao text not null,
  valores text[] not null default '{}',
  whatsapp text,
  email text,
  instagram text,
  updated_at timestamptz not null default now()
);

create table if not exists student_credentials (
  user_id uuid primary key,
  email text not null,
  temp_password text not null,
  updated_at timestamptz not null default now()
);

create table if not exists aulas (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid references turmas(id) not null,
  numero_aula int not null,
  data_aula date not null,
  titulo text not null,
  roteiro text not null,
  created_at timestamptz not null default now()
);

create table if not exists presencas (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid references aulas(id) not null,
  aluno_id uuid references profiles(user_id) not null,
  status text not null check (status in ('presente', 'falta')),
  observacao text,
  created_at timestamptz not null default now(),
  unique (aula_id, aluno_id)
);

create or replace function fechar_turma_e_abrir_proxima() returns trigger as $$
declare
  turma_atual turmas;
  prox_tri int;
  prox_ano int;
begin
  if new.status = 'aprovado' and old.status is distinct from 'aprovado' and new.turma_id is not null then
    update turmas set vagas_preenchidas = vagas_preenchidas + 1 where id = new.turma_id returning * into turma_atual;
    if turma_atual.curso_id is not null and turma_atual.vagas_preenchidas >= turma_atual.capacidade then
      update turmas set status = 'fechada' where id = turma_atual.id;
      prox_tri := case when turma_atual.trimestre = 4 then 1 else turma_atual.trimestre + 1 end;
      prox_ano := case when turma_atual.trimestre = 4 then turma_atual.ano + 1 else turma_atual.ano end;
      insert into turmas (curso_id, trimestre, ano, capacidade, vagas_preenchidas, status)
      values (turma_atual.curso_id, prox_tri, prox_ano, 10, 0, 'aberta');
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_turma_auto on candidaturas;
create trigger trg_turma_auto
after update on candidaturas
for each row execute procedure fechar_turma_e_abrir_proxima();

insert into cursos (nome, descricao, ativo, tipo)
values
  ('Curso de Barbeiro', 'Formação prática com técnicas modernas de corte, acabamento e atendimento.', true, 'barbeiro'),
  ('Curso de Informática Básica', 'Aprenda pacote Office, internet e ferramentas digitais para o mercado de trabalho.', true, 'informatica')
on conflict (tipo) do update
set nome = excluded.nome,
    descricao = excluded.descricao,
    ativo = excluded.ativo;

insert into site_config (id, slogan, missao, valores, whatsapp, email, instagram)
values (
  1,
  'Educação e acolhimento para construir um futuro com dignidade e oportunidades.',
  'Capacitar jovens e adultos em situação de vulnerabilidade com formação prática, apoio humano e oportunidades reais de transformação.',
  array['Inclusão social', 'Respeito', 'Excelência', 'Autonomia', 'Compromisso com a comunidade'],
  '(11) 99999-9999',
  'contato@visaonobre.org',
  '@visaonobre'
)
on conflict (id) do update
set slogan = excluded.slogan,
    missao = excluded.missao,
    valores = excluded.valores,
    whatsapp = excluded.whatsapp,
    email = excluded.email,
    instagram = excluded.instagram,
    updated_at = now();
