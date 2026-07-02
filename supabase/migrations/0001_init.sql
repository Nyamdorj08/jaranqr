-- Restaurant QR Menu + Sales Dashboard schema
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  table_number text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  total_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  menu_item_id uuid references menu_items (id) on delete set null,
  quantity integer not null check (quantity > 0),
  price_at_order_time numeric(12, 2) not null check (price_at_order_time >= 0)
);

create index if not exists menu_items_category_id_idx on menu_items (category_id);
create index if not exists order_items_order_id_idx on order_items (order_id);
create index if not exists orders_created_at_idx on orders (created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Anyone (including anonymous customers scanning the QR code) can read the menu.
create policy "public can read categories"
  on categories for select
  to anon, authenticated
  using (true);

create policy "public can read available menu items"
  on menu_items for select
  to anon, authenticated
  using (true);

-- Anyone can place an order (insert only — no read/update/delete for anon).
create policy "public can create orders"
  on orders for insert
  to anon, authenticated
  with check (true);

create policy "public can create order items"
  on order_items for insert
  to anon, authenticated
  with check (true);

-- Only signed-in admins/staff can manage menu content.
create policy "admins can insert categories"
  on categories for insert
  to authenticated
  with check (true);

create policy "admins can update categories"
  on categories for update
  to authenticated
  using (true)
  with check (true);

create policy "admins can delete categories"
  on categories for delete
  to authenticated
  using (true);

create policy "admins can insert menu items"
  on menu_items for insert
  to authenticated
  with check (true);

create policy "admins can update menu items"
  on menu_items for update
  to authenticated
  using (true)
  with check (true);

create policy "admins can delete menu items"
  on menu_items for delete
  to authenticated
  using (true);

-- Only signed-in admins/staff can view and manage orders (sales data).
create policy "admins can read orders"
  on orders for select
  to authenticated
  using (true);

create policy "admins can update orders"
  on orders for update
  to authenticated
  using (true)
  with check (true);

create policy "admins can delete orders"
  on orders for delete
  to authenticated
  using (true);

create policy "admins can read order items"
  on order_items for select
  to authenticated
  using (true);

create policy "admins can update order items"
  on order_items for update
  to authenticated
  using (true)
  with check (true);

create policy "admins can delete order items"
  on order_items for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Seed data (safe to remove/edit)
-- ---------------------------------------------------------------------------

with cat_main as (
  insert into categories (name, sort_order) values ('Үндсэн хоол', 1) returning id
), cat_salad as (
  insert into categories (name, sort_order) values ('Салат', 2) returning id
), cat_drink as (
  insert into categories (name, sort_order) values ('Ундаа', 3) returning id
), cat_dessert as (
  insert into categories (name, sort_order) values ('Амттан', 4) returning id
)
insert into menu_items (category_id, name, description, price, tags, sort_order)
select id, 'Гурилтай шөл', 'Үхрийн махтай уламжлалт гурилтай шөл', 15000, array['popular'], 1 from cat_main
union all
select id, 'Цуйван', 'Гоймонтой хуурга, хонины махтай', 14000, array[]::text[], 2 from cat_main
union all
select id, 'Хиам шарсан будаа', 'Хиам, өндөгтэй шарсан будаа', 12000, array['new'], 3 from cat_main
union all
select id, 'Цезарь салат', 'Тахианы мах, айсбергийн навч, крутон', 11000, array[]::text[], 1 from cat_salad
union all
select id, 'Кока-кола', 'Хүйтэн ундаа, 0.5л', 3000, array[]::text[], 1 from cat_drink
union all
select id, 'Сүүтэй цай', 'Монгол уламжлалт сүүтэй цай', 2000, array[]::text[], 2 from cat_drink
union all
select id, 'Боорцог', 'Гурилаар хийсэн амттан боорцог', 6000, array['new'], 1 from cat_dessert;
