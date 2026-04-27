-- Vida Gourmet - Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Opciones Menu Semanal (para Menú Semanal y Menú Proteico)
create table if not exists opciones_menu_semanal (
  id uuid default uuid_generate_v4() primary key,
  semana date not null,
  categoria text not null check (categoria in ('semanal', 'proteico')),
  nombre_opcion text not null,
  descripcion text,
  activo boolean default true,
  created_at timestamp with time zone default now()
);

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
  unidad_venta text default 'unidad',
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

-- Admins (authorized admin users)
create table if not exists admins (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  created_at timestamp with time zone default now()
);

-- Admin write access (for authenticated users)
create policy "Admin write admins" on admins for all using (true);

-- Sample admin
insert into admins (email) values ('vida.gourmet7@gmail.com');
alter table opciones_menu_semanal enable row level security;
alter table categorias enable row level security;
alter table productos enable row level security;
alter table clientes enable row level security;
alter table pedidos enable row level security;
alter table pedido_items enable row level security;
alter table compras enable row level security;
alter table ventas enable row level security;

-- Public read access for store
create policy "Public read opciones_menu_semanal" on opciones_menu_semanal for select using (activo = true);
create policy "Public read categorias" on categorias for select using (activo = true);
create policy "Public read productos" on productos for select using (activo = true);
create policy "Public read clientes" on clientes for select using (true);

-- Admin write access (for authenticated users)
create policy "Admin write opciones_menu_semanal" on opciones_menu_semanal for all using (true);
create policy "Admin write categorias" on categorias for all using (true);
create policy "Admin write productos" on productos for all using (true);
create policy "Admin write clientes" on clientes for all using (true);
create policy "Admin write pedidos" on pedidos for all using (true);
create policy "Admin write pedido_items" on pedido_items for all using (true);
create policy "Admin write compras" on compras for all using (true);
create policy "Admin write ventas" on ventas for all using (true);

-- Sample data: Categorías
insert into categorias (nombre, descripcion) values
  ('Menú Semanal', 'Opciones rotativas de viandas semanales'),
  ('Menú Proteico', 'Viandas con alto contenido proteico'),
  ('Tartas Integrales', 'Tartas integrales saludables'),
  ('Pizzas Integrales', 'Pizzas integrales'),
  ('Canastitas y Empanadas', 'Packs de 6 unidades');

-- Sample data: Opciones Menu Semanal (semana del 20 al 26 Abril 2026)
insert into opciones_menu_semanal (semana, categoria, nombre_opcion, descripcion) values
  ('2026-04-20', 'semanal', 'Pollo al pesto con arroz integral', 'Muslo de pollo marinado en pesto, arroz integral, calabaza asada y verdeo'),
  ('2026-04-20', 'semanal', 'Carne al rojo con polenta', 'Carne cocida al rojo con polenta cremosa y ortajes'),
  ('2026-04-20', 'semanal', 'Salmón al horno con quinoa', 'Salmón al horno con quinoa, brócoli y tomate cherry'),
  ('2026-04-20', 'semanal', 'Pollo a la crema con papas', 'Pollo a la crema con papas al horno y zanahoria'),
  ('2026-04-20', 'semanal', 'Tofu saltado con verduras', 'Tofu saltado con pimientos, cebolla, zanahoria y arroz');

-- Sample data: Opciones Menu Proteico (semana del 20 al 26 Abril 2026)
insert into opciones_menu_semanal (semana, categoria, nombre_opcion, descripcion) values
  ('2026-04-20', 'proteico', 'Pollo con arroz y verduras', 'Muslo de pollo, arroz integral, zanahoria, brócoli y calabaza'),
  ('2026-04-20', 'proteico', 'Carne con puré de calabaza', 'Osobuco al horno, puré de calabaza y ensalada verde'),
  ('2026-04-20', 'proteico', 'Salmón con papa y ensalada', 'Salmón a la plancha, papa hervida y ensalada de tomate'),
  ('2026-04-20', 'proteico', 'Bondiola de cerdo con polenta', 'Bondiola de cerdo a la plancha, polenta y verduras'),
  ('2026-04-20', 'proteico', 'Pollo caprese con ensalada', 'Suprema de pollo grille, tomate, mozzarella y albahaca');

-- Sample data: Tartas Integrales
insert into productos (categoria_id, nombre, descripcion, precio, unidad_venta) values
  ((select id from categorias where nombre = 'Tartas Integrales'), 'Tarta integral de atún y tomate', 'Atún fresco con tomate y aceitunas', 6500, 'unidad'),
  ((select id from categorias where nombre = 'Tartas Integrales'), 'Tarta integral de acelga y queso', 'Acelga fresca con queso mozzarella y ricotta', 6500, 'unidad'),
  ((select id from categorias where nombre = 'Tartas Integrales'), 'Tarta integral de calabaza asada, choclo y muzzarella', 'Calabaza asada con choclo y muzzarella', 6500, 'unidad'),
  ((select id from categorias where nombre = 'Tartas Integrales'), 'Tarta integral de pollo, jamón y puerro', 'Pollo, jamón y puerro grillado', 6500, 'unidad'),
  ((select id from categorias where nombre = 'Tartas Integrales'), 'Tarta integral de ricota, calabaza y acelga', 'Ricota con calabaza y acelga', 6500, 'unidad'),
  ((select id from categorias where nombre = 'Tartas Integrales'), 'Tarta integral de zapallitos', 'Zapallitos grillados con queso y cebolla', 6500, 'unidad'),
  ((select id from categorias where nombre = 'Tartas Integrales'), 'Tarta integral de pollo, brócoli y queso', 'Pollo con brócoli y queso', 6500, 'unidad'),
  ((select id from categorias where nombre = 'Tartas Integrales'), 'Tarta integral de pollo capresse', 'Pollo con tomate, mozzarella y albahaca', 6500, 'unidad'),
  ((select id from categorias where nombre = 'Tartas Integrales'), 'Tarta integral de pollo y espinaca', 'Pollo con espinaca y queso', 6500, 'unidad'),
  ((select id from categorias where nombre = 'Tartas Integrales'), 'Tarta integral de pollo, zapallo asado y verdeo', 'Pollo con zapallo asado y verdeo', 6500, 'unidad');

-- Sample data: Pizzas Integrales
insert into productos (categoria_id, nombre, descripcion, precio, unidad_venta) values
  ((select id from categorias where nombre = 'Pizzas Integrales'), 'Pizza integral de cebolla caramelizada', 'Cebolla caramelizada con queso y albahaca', 6000, 'unidad'),
  ((select id from categorias where nombre = 'Pizzas Integrales'), 'Pizza integral napolitana', 'Salsa de tomate, mozzarella y albahaca', 6000, 'unidad'),
  ((select id from categorias where nombre = 'Pizzas Integrales'), 'Pizza integral de espinaca y queso', 'Espinaca fresca con queso y ricotta', 6000, 'unidad');

-- Sample data: Canastitas y Empanadas
insert into productos (categoria_id, nombre, descripcion, precio, unidad_venta) values
  ((select id from categorias where nombre = 'Canastitas y Empanadas'), 'Canastitas de pollo capresse (x6)', 'Canastitas de pollo capresse, pack de 6', 12000, 'pack x6'),
  ((select id from categorias where nombre = 'Canastitas y Empanadas'), 'Canastitas de acelga y queso (x6)', 'Canastitas de acelga y queso, pack de 6', 12000, 'pack x6'),
  ((select id from categorias where nombre = 'Canastitas y Empanadas'), 'Empanadas de carne a cuchillo (x6)', 'Empanadas de carne a cuchillo, pack de 6', 12000, 'pack x6'),
  ((select id from categorias where nombre = 'Canastitas y Empanadas'), 'Empanadas de pollo (x6)', 'Empanadas de pollo, pack de 6', 12000, 'pack x6');
