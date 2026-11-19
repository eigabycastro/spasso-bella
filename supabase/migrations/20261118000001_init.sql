-- =====================================================================
-- Spasso Bella MG — estrutura inicial do banco
-- Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tipos (listas fixas de opções)
-- ---------------------------------------------------------------------
create type public.appointment_status as enum ('agendado', 'confirmado', 'concluido', 'cancelado', 'faltou');
create type public.transaction_type   as enum ('entrada', 'saida');
create type public.payment_method     as enum ('dinheiro', 'pix', 'debito', 'credito');
create type public.transaction_status as enum ('pago', 'pendente');
create type public.movement_type      as enum ('entrada', 'saida', 'ajuste');

-- ---------------------------------------------------------------------
-- 2. Administradora
--    Só quem estiver nesta tabela acessa os dados do studio.
--    (Ter login não basta: protege mesmo se alguém criar uma conta.)
-- ---------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------------
-- 3. Cadastros
-- ---------------------------------------------------------------------
create table public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) > 0),
  phone      text,
  birthday   date,
  notes      text,
  created_at timestamptz not null default now()
);
create index clients_name_idx on public.clients (lower(name));

create table public.services (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(trim(name)) > 0),
  category     text,
  description  text,
  price        numeric(10, 2) not null check (price >= 0),
  duration_min integer not null check (duration_min > 0),
  is_active    boolean not null default true,
  is_public    boolean not null default true,   -- aparece no site
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. Agenda
--    Horários em timestamptz (o app exibe em America/Sao_Paulo).
--    A restrição "no_overlap" impede dois atendimentos ao mesmo tempo;
--    cancelados e faltas liberam o horário.
-- ---------------------------------------------------------------------
create table public.appointments (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients (id) on delete restrict,
  start_at   timestamptz not null,
  end_at     timestamptz not null,
  status     public.appointment_status not null default 'agendado',
  notes      text,
  created_at timestamptz not null default now(),
  constraint appointments_end_after_start check (end_at > start_at),
  constraint appointments_no_overlap exclude using gist (
    tstzrange(start_at, end_at, '[)') with &&
  ) where (status not in ('cancelado', 'faltou'))
);
create index appointments_start_idx on public.appointments (start_at);
create index appointments_client_idx on public.appointments (client_id);

-- Preço, nome e duração são COPIADOS do serviço no momento do agendamento:
-- mudar a tabela de preços depois não altera o histórico.
create table public.appointment_items (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  service_id     uuid not null references public.services (id) on delete restrict,
  service_name   text not null,
  price          numeric(10, 2) not null check (price >= 0),
  duration_min   integer not null check (duration_min > 0)
);
create index appointment_items_appt_idx on public.appointment_items (appointment_id);

-- ---------------------------------------------------------------------
-- 5. Financeiro
--    Um atendimento pode ter vários pagamentos (sinal + restante).
-- ---------------------------------------------------------------------
create table public.transactions (
  id             uuid primary key default gen_random_uuid(),
  type           public.transaction_type not null,
  amount         numeric(10, 2) not null check (amount > 0),
  category       text not null,
  description    text,
  payment_method public.payment_method,
  status         public.transaction_status not null default 'pago',
  date           date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  appointment_id uuid references public.appointments (id) on delete set null,
  client_id      uuid references public.clients (id) on delete set null,
  created_at     timestamptz not null default now(),
  constraint transactions_entrada_has_method check (type = 'saida' or payment_method is not null)
);
create index transactions_date_idx on public.transactions (date);
create index transactions_appt_idx on public.transactions (appointment_id);

-- ---------------------------------------------------------------------
-- 6. Estoque
--    A quantidade NUNCA é editada direto: toda mudança é um movimento,
--    e um gatilho atualiza products.quantity.
--    entrada/saida: quantidade positiva · ajuste: positiva ou negativa.
-- ---------------------------------------------------------------------
create table public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (length(trim(name)) > 0),
  unit          text not null default 'un',
  quantity      numeric(10, 2) not null default 0 check (quantity >= 0),
  minimum_stock numeric(10, 2) not null default 0 check (minimum_stock >= 0),
  cost          numeric(10, 2) check (cost >= 0),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.stock_movements (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete restrict,
  movement_type  public.movement_type not null,
  quantity       numeric(10, 2) not null,
  reason         text,
  appointment_id uuid references public.appointments (id) on delete set null,
  created_at     timestamptz not null default now(),
  constraint stock_movements_quantity_valid check (
    (movement_type = 'ajuste' and quantity <> 0) or quantity > 0
  )
);
create index stock_movements_product_idx on public.stock_movements (product_id, created_at desc);

create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.products
     set quantity = quantity + case new.movement_type
                                 when 'entrada' then new.quantity
                                 when 'saida'   then -new.quantity
                                 else new.quantity          -- ajuste (com sinal)
                               end
   where id = new.product_id;
  return new;
end;
$$;

create trigger stock_movements_apply
after insert on public.stock_movements
for each row execute function public.apply_stock_movement();

-- Movimentos são histórico: não se edita nem apaga (corrige-se com um ajuste).
create or replace function public.block_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Movimentações de estoque não podem ser alteradas. Registre um ajuste.';
end;
$$;

create trigger stock_movements_immutable
before update or delete on public.stock_movements
for each row execute function public.block_change();

-- ---------------------------------------------------------------------
-- 7. Studio e site
-- ---------------------------------------------------------------------
create table public.business_settings (
  id            integer primary key default 1 check (id = 1),  -- sempre uma linha só
  business_name text not null default 'Spasso Bella MG',
  phone         text,
  whatsapp      text,          -- só números, com DDI e DDD: 5531999999999
  instagram     text,
  address       text,
  maps_url      text,
  opening_hours jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now()
);
insert into public.business_settings (id) values (1);

create table public.gallery_images (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption      text,
  is_public    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. Visão: total e valor pago de cada atendimento
-- ---------------------------------------------------------------------
create view public.appointment_summary
with (security_invoker = true)
as
select
  a.id,
  a.client_id,
  a.start_at,
  a.end_at,
  a.status,
  coalesce((select sum(i.price) from public.appointment_items i where i.appointment_id = a.id), 0) as total,
  coalesce((select sum(t.amount) from public.transactions t
             where t.appointment_id = a.id and t.type = 'entrada' and t.status = 'pago'), 0) as paid
from public.appointments a;

-- ---------------------------------------------------------------------
-- 9. Segurança (RLS)
--    Administradora: acesso total.
--    Visitantes do site: só leem serviços públicos, galeria pública
--    e dados do studio.
-- ---------------------------------------------------------------------
alter table public.admins            enable row level security;
alter table public.clients           enable row level security;
alter table public.services          enable row level security;
alter table public.appointments      enable row level security;
alter table public.appointment_items enable row level security;
alter table public.transactions      enable row level security;
alter table public.products          enable row level security;
alter table public.stock_movements   enable row level security;
alter table public.business_settings enable row level security;
alter table public.gallery_images    enable row level security;

create policy "admin le a propria linha" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

create policy "admin total" on public.clients           for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin total" on public.services          for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin total" on public.appointments      for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin total" on public.appointment_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin total" on public.transactions      for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin total" on public.products          for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin le e cria" on public.stock_movements for select to authenticated using (public.is_admin());
create policy "admin cria"      on public.stock_movements for insert to authenticated with check (public.is_admin());
create policy "admin total" on public.business_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin total" on public.gallery_images    for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "site le servicos publicos" on public.services
  for select to anon using (is_active and is_public);
create policy "site le galeria publica" on public.gallery_images
  for select to anon using (is_public);
create policy "site le dados do studio" on public.business_settings
  for select to anon using (true);
