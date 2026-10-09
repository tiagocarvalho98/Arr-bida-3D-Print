-- Foundation only: no seeds and no browser mutation API.
-- 1 EUR = 1000 milli-euros. Weights are whole grams.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  role text not null default 'collaborator' check (role in ('owner','collaborator')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Explicit membership, never user-editable JWT metadata. No signup trigger.
create function private.is_studio_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and active);
$$;
revoke all on function private.is_studio_member() from public, anon, authenticated;
grant execute on function private.is_studio_member() to authenticated;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 200),
  type text not null default 'business' check (type in ('business','person')),
  city text not null default '', contact text not null default '',
  unit text not null default '', notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) between 1 and 200),
  description text not null default '', category text not null default '',
  pricing_mode text not null default 'quote' check (pricing_mode in ('fixed','quote')),
  price_milli_euro bigint check (price_milli_euro >= 0),
  fields jsonb not null default '[]' check (jsonb_typeof(fields) = 'array'),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  check ((pricing_mode = 'fixed' and price_milli_euro is not null) or
         (pricing_mode = 'quote' and price_milli_euro is null))
);

create function private.valid_route(route text[]) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(route = '{}'::text[] or (
    cardinality(route) >= 2 and route[1] = 'accepted' and route[cardinality(route)] = 'delivered'
    and route = array(select step from unnest(array['accepted','quote','approval','production','ready','delivered']) step where step = any(route))
  ),false);
$$;
revoke all on function private.valid_route(text[]) from public, anon, authenticated;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null check (length(trim(title)) between 1 and 200),
  status text not null default 'new' check (status in ('new','accepted','quote','approval','production','ready','delivered','cancelled')),
  pricing_mode text not null default 'quote' check (pricing_mode in ('known','quote')),
  route text[] not null default '{}' check (private.valid_route(route)),
  assignee_id uuid references public.profiles(id) on delete restrict,
  accepted_by uuid references public.profiles(id) on delete restrict,
  accepted_at timestamptz,
  art_required boolean not null default false,
  art_approved boolean not null default false,
  due_date date, notes text not null default '',
  revision bigint not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  check (pricing_mode <> 'known' or not ('quote' = any(route))),
  check ((status = 'new' and cardinality(route) = 0 and accepted_by is null and accepted_at is null)
      or status = 'cancelled'
      or (status = any(route) and accepted_by is not null and accepted_at is not null))
);
create index orders_client_idx on public.orders(client_id);
create index orders_assignee_idx on public.orders(assignee_id);
create index orders_accepted_by_idx on public.orders(accepted_by);
create index orders_pipeline_idx on public.orders(status,due_date) where status not in ('delivered','cancelled');

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid references public.products(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  quantity integer not null default 1 check (quantity > 0),
  configuration jsonb not null default '{}' check (jsonb_typeof(configuration) = 'object'),
  unit_price_milli_euro bigint check (unit_price_milli_euro >= 0),
  created_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_product_idx on public.order_items(product_id);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  status text not null default 'pending' check (status in ('pending','active','completed','failed','cancelled')),
  parent_job_id uuid,
  consumption_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id,order_id),
  foreign key (parent_job_id,order_id) references public.jobs(id,order_id) on delete restrict,
  check (parent_job_id is null or parent_job_id <> id)
);
create index jobs_order_idx on public.jobs(order_id);
create index jobs_parent_idx on public.jobs(parent_job_id,order_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  status text not null default 'pending' check (status in ('pending','active','done')),
  assignee_id uuid references public.profiles(id) on delete restrict,
  due_date date,
  created_at timestamptz not null default now()
);
create index tasks_job_idx on public.tasks(job_id);
create index tasks_assignee_idx on public.tasks(assignee_id,status,due_date);

create table public.filament_lots (
  id uuid primary key default gen_random_uuid(),
  material text not null check (length(trim(material)) > 0),
  brand text not null default '', color text not null check (length(trim(color)) > 0),
  received_grams integer not null check (received_grams > 0),
  purchase_cost_milli_euro bigint not null check (purchase_cost_milli_euro >= 0),
  low_stock_grams integer not null default 100 check (low_stock_grams >= 0),
  created_at timestamptz not null default now()
);

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','approved')),
  duration_minutes integer not null check (duration_minutes between 1 and 600059),
  hourly_rate_milli_euro bigint not null check (hourly_rate_milli_euro >= 0),
  time_milli_euro bigint generated always as (round(duration_minutes::numeric * hourly_rate_milli_euro / 60)::bigint) stored,
  final_milli_euro bigint not null check (final_milli_euro > 0),
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  submitted_at timestamptz not null default now(),
  approved_by uuid references public.profiles(id) on delete restrict,
  approved_at timestamptz,
  check ((status='pending' and approved_by is null and approved_at is null) or
    (status='approved' and approved_by is not null and approved_at is not null and approved_at >= submitted_at))
);
create index quotations_submitted_idx on public.quotations(submitted_by);
create index quotations_approved_idx on public.quotations(approved_by);

create table public.quotation_materials (
  quotation_id uuid not null references public.quotations(id) on delete restrict,
  lot_id uuid not null references public.filament_lots(id) on delete restrict,
  material text not null, color text not null,
  grams integer not null check (grams > 0),
  lot_received_grams integer not null check (lot_received_grams > 0),
  lot_purchase_cost_milli_euro bigint not null check (lot_purchase_cost_milli_euro >= 0),
  material_milli_euro bigint generated always as (round(grams::numeric * lot_purchase_cost_milli_euro / lot_received_grams)::bigint) stored,
  primary key (quotation_id,lot_id)
);
create index quotation_materials_lot_idx on public.quotation_materials(lot_id);

create table public.reservations (
  job_id uuid not null references public.jobs(id) on delete restrict,
  lot_id uuid not null references public.filament_lots(id) on delete restrict,
  grams integer not null check (grams > 0),
  created_at timestamptz not null default now(),
  primary key (job_id,lot_id)
);
create index reservations_lot_idx on public.reservations(lot_id);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.filament_lots(id) on delete restrict,
  job_id uuid not null references public.jobs(id) on delete restrict,
  delta_grams integer not null check (delta_grams <= 0),
  cost_milli_euro bigint not null check (cost_milli_euro >= 0),
  unit_cost_milli_euro numeric not null check (unit_cost_milli_euro >= 0),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(job_id,lot_id)
);
create index stock_movements_lot_idx on public.stock_movements(lot_id);
create index stock_movements_actor_idx on public.stock_movements(actor_id);

create table public.project_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  entity_id uuid not null,
  entity_type text not null check (entity_type in ('order','job','task','quotation')),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  description text not null check (length(trim(description)) > 0),
  created_at timestamptz not null default now()
);
create index project_history_order_idx on public.project_history(order_id,created_at);
create index project_history_actor_idx on public.project_history(actor_id);

create table public.processed_commands (
  id uuid primary key,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  command_type text not null,
  request jsonb not null check (jsonb_typeof(request)='object'),
  result jsonb not null,
  created_at timestamptz not null default now()
);
create index processed_commands_actor_idx on public.processed_commands(actor_id);

create table public.studio_settings (
  id boolean primary key default true check (id),
  name text not null default 'Arrábida 3D Print',
  currency text not null default 'EUR' check (currency='EUR'),
  timezone text not null default 'Europe/Lisbon'
);

-- Explicit grants override permissive Supabase defaults. No mutation policies.
-- Server commands (next migration) must authorize actors, lock lots, enforce
-- transitions and atomically write audit + idempotency result before enabling UI.
do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','clients','products','orders','order_items',
    'jobs','tasks','filament_lots','quotations','quotation_materials','reservations',
    'stock_movements','project_history','processed_commands','studio_settings'] loop
    execute format('alter table public.%I enable row level security',table_name);
    execute format('revoke all on public.%I from public, anon, authenticated',table_name);
    if table_name <> 'processed_commands' then
      execute format('grant select on public.%I to authenticated',table_name);
      execute format('create policy studio_read on public.%I for select to authenticated using ((select private.is_studio_member()))',table_name);
    end if;
  end loop;
end;
$$;
grant usage on schema public to authenticated;
