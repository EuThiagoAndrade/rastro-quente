-- Ciclo 003, issue #24 — revoga os privilégios padrão de service_role nas tabelas do schema public
-- (pendência registrada na task #21 e no ADR-005, decidida pelo responsável em 2026-11-07).
-- O Supabase concede tudo a service_role por privilégio padrão; como o papel contorna RLS, ele leria
-- cargas em preparação e gravaria fora do protocolo. Nenhuma função do produto o usa: carga é do EX,
-- consulta é do RP sob RLS, administração é do proprietário. Migração aditiva (G4); não altera
-- políticas, o EX nem a lista de autorização.
revoke all on table
  public.cargas, public.publicacao_vigente, public.fontes, public.malhas,
  public.municipios, public.deteccoes, public.disponibilidade
  from service_role;
revoke all on sequence public.cargas_id_seq from service_role;
