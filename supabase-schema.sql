-- Vida Gourmet - Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categorías
create table if not exists categorias (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  descripcion text,
  imagen_url text,
  activo boolean default true,
  created_at timestamp with time zone default now()
);

-- Productos
create table if not exists productos (
  id uuid default uuid_generate_v4() primary key,
  categoria_id uuid references categorias(id),
  nombre text not null,
  descripcion text,
  precio numeric not null default 0,
  imagen_url text,
  activo boolean default true,
  menu_semanal boolean default true,
  created_at timestamp with time zone default now()
);

-- Clientes
create table if not exists clientes (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  telefono text,
  direccion text,
  created_at timestamp with time zone default now()
);

-- Pedidos
create table if not exists pedidos (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references clientes(id),
  estado text default 'pendiente' check (estado in ('pendiente', 'confirmado', 'entregado')),
  fecha_entrega date,
  total numeric not null default 0,
  notas text,
  created_at timestamp with time zone default now()
);

-- Pedido Items
create table if not exists pedido_items (
  id uuid default uuid_generate_v4() primary key,
  pedido_id uuid references pedidos(id) on delete cascade,
  producto_id uuid references productos(id),
  cantidad integer not null default 1,
  precio_unitario numeric not null
);

-- Compras
create table if not exists compras (
  id uuid default uuid_generate_v4() primary key,
  descripcion text not null,
  monto numeric not null,
  fecha date not null,
  created_at timestamp with time zone default now()
);

-- Ventas (auto-generated from pedidos)
create table if not exists ventas (
  id uuid default uuid_generate_v4() primary key,
  pedido_id uuid references pedidos(id),
  monto numeric not null,
  fecha date not null,
  created_at timestamp with time zone default now()
);

-- RLS Policies (Row Level Security)
alter table categorias enable row level security;
alter table productos enable row level security;
alter table clientes enable row level security;
alter table pedidos enable row level security;
alter table pedido_items enable row level security;
alter table compras enable row level security;
alter table ventas enable row level security;

-- Public read access for store
create policy "Public read categorias" on categorias for select using (activo = true);
create policy "Public read productos" on productos for select using (activo = true and menu_semanal = true);
create policy "Public read clientes" on clientes for select using (true);

-- Admin write access (for authenticated users)
create policy "Admin write categorias" on categorias for all using (true);
create policy "Admin write productos" on productos for all using (true);
create policy "Admin write clientes" on clientes for all using (true);
create policy "Admin write pedidos" on pedidos for all using (true);
create policy "Admin write pedido_items" on pedido_items for all using (true);
create policy "Admin write compras" on compras for all using (true);
create policy "Admin write ventas" on ventas for all using (true);

-- Sample data
insert into categorias (nombre, descripcion) values
  ('Viandas', 'Viandas semanales completas'),
  ('Ensaladas', 'Ensaladas frescas y saludables'),
  ('Snacks', 'Snacks y extras saludables');

insert into productos (categoria_id, nombre, descripcion, precio) values
  ((select id from categorias where nombre = 'Viandas'), 'Vianda Proteica', 'Pollo, arroz integral y verduras', 4500),
  ((select id from categorias where nombre = 'Viandas'), 'Vianda Vegetariana', 'Tofu, quinoa y vegetales', 4200),
  ((select id from categorias where nombre = 'Ensaladas'), 'Ensalada César', 'Lechuga, croutons, pollo', 3200),
  ((select id from categorias where nombre = 'Snacks'), 'Barrita Energética', 'Mix de frutos secos', 1500);
