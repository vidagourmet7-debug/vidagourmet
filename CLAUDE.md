# Vida Gourmet - Tienda Online de Viandas

## Overview
- **Business**: Vida Gourmet - elaboración y delivery de viandas saludables
- **Owner**: Federico
- **Products**: Meal prep, viandas, comida saludable
- **Current order system**: Google Forms (https://forms.gle/jvaRUwhcm3pJLnbj8)

## References
- Store reference: https://pedix.app/dieteticademo
- Instagram: https://www.instagram.com/vidagourmetok

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend/Database**: Supabase (Auth + PostgreSQL)
- **Deployment**: Vercel
- **Payments**: Pending (future integration)
- **Notifications**: WhatsApp API

## Development Phases

### Fase 1 - Base del Proyecto
- [x] Inicializar Next.js 14 con App Router
- [x] Configurar Supabase (auth + base de datos) - clientes, libs creadas
- [x] Definir schema de tablas (productos, categorías, pedidos, clientes, ventas, compras)
- [ ] Deploy inicial en Vercel

### Fase 2 - Tienda Pública
- [ ] Página de inicio con categorías
- [ ] Grilla de productos (foto/precio/descripción)
- [ ] Carrito persistente (localStorage/Supabase)
- [ ] Checkout (nombre, teléfono, dirección, día de entrega)
- [ ] Confirmación con botón "Enviar por WhatsApp"

### Fase 3 - Panel Admin (Productos)
- [ ] Login protegido (Supabase Auth)
- [ ] ABM productos (alta/baja/modificación)
- [ ] Carga de fotos (Supabase Storage)
- [ ] Menú semanal (publicar/despublicar por semana)

### Fase 4 - Panel Admin (Pedidos)
- [ ] Vista de pedidos (día/semana)
- [ ] Estados: pendiente → confirmado → entregado
- [ ] Filtros por fecha y estado
- [ ] Notificación WhatsApp al confirmar

### Fase 5 - Gestión de Caja
- [ ] Registro automático de ventas
- [ ] Registro manual de compras
- [ ] Dashboard ingresos/gastos

## Database Schema (Supabase)

### Tables

#### `categorias`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| nombre | text | Nombre de categoría |
| descripcion | text | Descripción |
| imagen_url | text | Imagen de categoría |
| activo | boolean | Visible en tienda |
| created_at | timestamp | |

#### `productos`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| categoria_id | uuid | FK -> categorias |
| nombre | text | |
| descripcion | text | |
| precio | numeric | Precio en pesos |
| imagen_url | text | URL imagen |
| activo | boolean | Disponible |
| menu_semanal | boolean | En menú de esta semana |
| created_at | timestamp | |

#### `clientes`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| nombre | text | |
| telefono | text | |
| direccion | text | |
| created_at | timestamp | |

#### `pedidos`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| cliente_id | uuid | FK -> clientes |
| estado | text | pendiente/confirmado/entregado |
| fecha_entrega | date | |
| total | numeric | |
| notas | text | |
| created_at | timestamp | |

#### `pedido_items`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| pedido_id | uuid | FK -> pedidos |
| producto_id | uuid | FK -> productos |
| cantidad | integer | |
| precio_unitario | numeric | |

#### `compras`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| descripcion | text | |
| monto | numeric | |
| fecha | date | |
| created_at | timestamp | |

#### `ventas`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| pedido_id | uuid | FK -> pedidos |
| monto | numeric | |
| fecha | date | |
| created_at | timestamp | |
