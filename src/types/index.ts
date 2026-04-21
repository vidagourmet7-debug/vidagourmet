export type Categoria = {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
};

export type Producto = {
  id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  activo: boolean;
  menu_semanal: boolean;
  created_at: string;
};

export type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string | null;
  created_at: string;
};

export type Pedido = {
  id: string;
  cliente_id: string;
  estado: 'pendiente' | 'confirmado' | 'entregado';
  fecha_entrega: string;
  total: number;
  notas: string | null;
  created_at: string;
};

export type PedidoItem = {
  id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
};

export type Compra = {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  created_at: string;
};

export type Venta = {
  id: string;
  pedido_id: string;
  monto: number;
  fecha: string;
  created_at: string;
};

export type CarritoItem = {
  producto: Producto;
  cantidad: number;
};
