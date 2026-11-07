-- Ciclo 003, issue #21 — schema de dados do protótipo.
-- Contrato: plano 003 v4 (contrato de dados, D1, sensibilidade por consulta) e KB-004.
-- Sem identificador real, senha ou dado territorial. RLS ativo em toda tabela public;
-- as políticas e os grants por papel ficam na migração de autorização seguinte.

-- Versão de dados (carga). A identidade deriva do manifesto canônico (fontes, janela e método),
-- nunca de timestamp. Só cargas 'publicada' são legíveis pelo responsável autorizado.
create table public.cargas (
  id bigint generated always as identity primary key,
  identidade text not null unique check (identidade ~ '^[0-9a-f]{64}$'),
  satelite text not null check (satelite = 'AQUA_M-T'),
  -- Janela principal GMT: início inclusivo, fim exclusivo.
  janela_inicio timestamptz not null,
  janela_fim timestamptz not null,
  -- Envelope de sensibilidade: registros após o fim da janela, fora de toda contagem principal.
  envelope_inicio timestamptz,
  envelope_fim timestamptz,
  fuso_sensibilidade text not null default 'America/Cuiaba',
  -- Parâmetros do método (regra H3, versão da KB etc.), sanitizados.
  metodo jsonb not null default '{}'::jsonb,
  -- Contagens declaradas pelo manifesto; a publicação confere contra as linhas gravadas.
  total_principal integer not null check (total_principal >= 0),
  total_envelope integer not null check (total_envelope >= 0),
  total_municipios integer not null check (total_municipios > 0),
  total_disponibilidade integer not null check (total_disponibilidade >= 0),
  estado text not null default 'preparacao' check (estado in ('preparacao', 'publicada', 'retirada')),
  criada_em timestamptz not null default now(),
  publicada_em timestamptz,
  retirada_em timestamptz,
  check (janela_inicio < janela_fim),
  check ((envelope_inicio is null) = (envelope_fim is null)),
  check (envelope_inicio is null or (envelope_inicio = janela_fim and envelope_fim > envelope_inicio)),
  check (total_envelope = 0 or envelope_inicio is not null),
  -- Alvo da chave estrangeira da publicação vigente, que só aceita carga publicada.
  unique (id, estado)
);

-- Publicação vigente: linha única. A chave composta impede apontar para carga não publicada
-- e impede retirar a carga vigente (on update restrict).
create table public.publicacao_vigente (
  unica boolean primary key default true check (unica),
  carga_id bigint not null,
  estado text not null default 'publicada' check (estado = 'publicada'),
  atualizada_em timestamptz not null default now(),
  foreign key (carga_id, estado) references public.cargas (id, estado) on update restrict on delete restrict
);

-- Proveniência sanitizada: URL pública, hash, bytes, data e condições de uso de cada insumo.
create table public.fontes (
  carga_id bigint not null references public.cargas (id) on delete cascade,
  chave text not null,
  papel text not null,
  url text not null check (url ~ '^https://'),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  bytes bigint not null check (bytes >= 0),
  obtida_em timestamptz not null,
  condicoes_uso text not null,
  primary key (carga_id, chave)
);

-- Malhas da carga: classificação (integral, local) e exibição (representação publicada).
create table public.malhas (
  carga_id bigint not null,
  uso text not null check (uso in ('classificacao', 'exibicao')),
  fonte_chave text not null,
  qualidade text not null,
  parametros jsonb not null default '{}'::jsonb,
  primary key (carga_id, uso),
  foreign key (carga_id, fonte_chave) references public.fontes (carga_id, chave) on delete cascade
);

-- Municípios da carga, com a geometria de exibição (GeoJSON). O pertencimento das detecções
-- foi calculado localmente com a malha de classificação integral.
create table public.municipios (
  carga_id bigint not null references public.cargas (id) on delete cascade,
  codigo integer not null check (codigo between 1000000 and 9999999),
  nome text not null,
  geometria_exibicao jsonb not null,
  primary key (carga_id, codigo)
);

-- Detecções. id_fonte é o id original do INPE: atributo de auditoria, sem unicidade.
-- A identidade técnica deriva do hash do arquivo e da posição da linha (KB-004).
create table public.deteccoes (
  carga_id bigint not null,
  id_tecnico text not null,
  fonte_chave text not null,
  linha integer not null check (linha > 0),
  id_fonte text,
  escopo text not null check (escopo in ('principal', 'envelope')),
  data_hora_gmt timestamptz not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  municipio_codigo integer not null,
  posicao text not null check (posicao in ('interior', 'borda')),
  municipio_inpe integer,
  estado_inpe integer,
  primary key (carga_id, id_tecnico),
  foreign key (carga_id, fonte_chave) references public.fontes (carga_id, chave) on delete cascade,
  foreign key (carga_id, municipio_codigo) references public.municipios (carga_id, codigo) on delete cascade
);

create index deteccoes_periodo_idx on public.deteccoes (carga_id, escopo, data_hora_gmt);
create index deteccoes_municipio_idx on public.deteccoes (carga_id, municipio_codigo, data_hora_gmt);

-- Disponibilidade D1: dia GMT × satélite × município, separada da presença de detecção.
create table public.disponibilidade (
  carga_id bigint not null,
  dia date not null,
  satelite text not null,
  municipio_codigo integer not null,
  classe text not null check (classe in ('lacuna_conhecida', 'incidencia_indeterminada', 'sem_evidencia_de_lacuna')),
  motivos text[] not null check (cardinality(motivos) > 0),
  alcance_historico text not null check (alcance_historico in ('verificado', 'parcial', 'indisponivel')),
  avisos text[] not null default '{}',
  primary key (carga_id, municipio_codigo, dia, satelite),
  foreign key (carga_id, municipio_codigo) references public.municipios (carga_id, codigo) on delete cascade
);

create index disponibilidade_dia_idx on public.disponibilidade (carga_id, dia);

alter table public.cargas enable row level security;
alter table public.publicacao_vigente enable row level security;
alter table public.fontes enable row level security;
alter table public.malhas enable row level security;
alter table public.municipios enable row level security;
alter table public.deteccoes enable row level security;
alter table public.disponibilidade enable row level security;

-- Os privilégios padrão do Supabase concedem tudo a anon e authenticated no schema public.
-- Revogar aqui; a migração de autorização concede somente o necessário.
revoke all on table
  public.cargas, public.publicacao_vigente, public.fontes, public.malhas,
  public.municipios, public.deteccoes, public.disponibilidade
  from public, anon, authenticated;
revoke all on sequence public.cargas_id_seq from public, anon, authenticated;
