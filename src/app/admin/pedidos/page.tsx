'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Pedido, PedidoItem } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

type PedidoConCliente = Pedido & {
  clientes?: { nombre: string; telefono: string };
  pedido_items?: (PedidoItem & { productos?: { nombre: string } })[];
};

function AdminPedidosContent() {
  const { signOut, user } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoConCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('');
  const [vistaSemanal, setVistaSemanal] = useState(false);
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPedidos() {
      const client = supabase();
      const { data } = await client
        .from('pedidos')
        .select(`
          *,
          clientes (nombre, telefono),
          pedido_items (
            *,
            productos (nombre)
          )
        `)
        .order('fecha_entrega', { ascending: false });

      if (data) setPedidos(data);
      setLoading(false);
    }
    fetchPedidos();
  }, []);

  const cambiarEstado = async (pedidoId: string, nuevoEstado: Pedido['estado'], telefono: string | undefined) => {
    const client = supabase();
    await client.from('pedidos').update({ estado: nuevoEstado }).eq('id', pedidoId);
    setPedidos(pedidos.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p));

    if (nuevoEstado === 'confirmado' && telefono) {
      const pedido = pedidos.find(p => p.id === pedidoId);
      const mensaje = `¡Hola ${pedido?.clientes?.nombre}! Tu pedido en Vida Gourmet ha sido confirmado y está siendo preparado. Te avisaremos cuando esté listo para delivery.`;
      const telLimpio = telefono.replace(/\D/g, '');
      window.open(`https://wa.me/${telLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank');
    }

    if (nuevoEstado === 'entregado') {
      const pedido = pedidos.find(p => p.id === pedidoId);
      if (pedido) {
        await client.from('ventas').insert({
          pedido_id: pedidoId,
          monto: pedido.total,
          fecha: new Date().toISOString().split('T')[0],
        });
      }
    }
  };

  const toggleExpandir = (pedidoId: string) => {
    setPedidoExpandido(pedidoExpandido === pedidoId ? null : pedidoId);
  };

  const obtenerSemanaActual = () => {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - hoy.getDay());
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    return { inicio: inicio.toISOString().split('T')[0], fin: fin.toISOString().split('T')[0] };
  };

  const filtrarPorSemana = (pedido: PedidoConCliente) => {
    if (!vistaSemanal) return true;
    const { inicio, fin } = obtenerSemanaActual();
    return pedido.fecha_entrega >= inicio && pedido.fecha_entrega <= fin;
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) return false;
    if (!filtrarPorSemana(pedido)) return false;
    if (filtroFechaDesde && pedido.fecha_entrega < filtroFechaDesde) return false;
    if (filtroFechaHasta && pedido.fecha_entrega > filtroFechaHasta) return false;
    return true;
  });

  const contarPorEstado = (estado: string) => {
    if (estado === 'todos') return pedidos.length;
    return pedidos.filter(p => p.estado === estado).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Vida Gourmet - Admin</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin/productos" className="hover:text-green-400">Productos</Link>
              <Link href="/admin/pedidos" className="text-green-400">Pedidos</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">{user?.email}</span>
            <button onClick={signOut} className="text-gray-300 hover:text-white text-sm">Cerrar sesión</button>
            <Link href="/" className="text-gray-300 hover:text-white text-sm">Ver tienda</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pedidos</h2>

        <div className="flex gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-4 py-2 rounded-lg font-medium ${filtroEstado === 'todos' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Todos ({contarPorEstado('todos')})
            </button>
            <button
              onClick={() => setFiltroEstado('pendiente')}
              className={`px-4 py-2 rounded-lg font-medium ${filtroEstado === 'pendiente' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Pendientes ({contarPorEstado('pendiente')})
            </button>
            <button
              onClick={() => setFiltroEstado('confirmado')}
              className={`px-4 py-2 rounded-lg font-medium ${filtroEstado === 'confirmado' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Confirmados ({contarPorEstado('confirmado')})
            </button>
            <button
              onClick={() => setFiltroEstado('entregado')}
              className={`px-4 py-2 rounded-lg font-medium ${filtroEstado === 'entregado' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Entregados ({contarPorEstado('entregado')})
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-600">Semana actual:</label>
            <input
              type="checkbox"
              checked={vistaSemanal}
              onChange={e => setVistaSemanal(e.target.checked)}
              className="w-4 h-4"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={e => setFiltroFechaDesde(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={e => setFiltroFechaHasta(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <button
            onClick={() => { setFiltroFechaDesde(''); setFiltroFechaHasta(''); setFiltroEstado('todos'); setVistaSemanal(false); }}
            className="self-end px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Fecha entrega</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Total</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Estado</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Ver detalle</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pedidosFiltrados.map(pedido => (
                <>
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-gray-800 font-medium">{pedido.clientes?.nombre || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{pedido.clientes?.telefono || ''}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{pedido.fecha_entrega}</td>
                    <td className="px-4 py-4 text-gray-600 font-bold">${pedido.total.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        pedido.estado === 'confirmado' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleExpandir(pedido.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        {pedidoExpandido === pedido.id ? 'Ocultar' : 'Ver'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {pedido.estado === 'pendiente' && (
                          <button
                            onClick={() => cambiarEstado(pedido.id, 'confirmado', pedido.clientes?.telefono)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Confirmar
                          </button>
                        )}
                        {pedido.estado === 'confirmado' && (
                          <button
                            onClick={() => cambiarEstado(pedido.id, 'entregado', pedido.clientes?.telefono)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Marcar entregado
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {pedidoExpandido === pedido.id && (
                    <tr key={`${pedido.id}-detalle`} className="bg-gray-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium text-gray-700 mb-2">Detalle del pedido:</h4>
                          {pedido.pedido_items && pedido.pedido_items.length > 0 ? (
                            <ul className="space-y-1">
                              {pedido.pedido_items.map(item => (
                                <li key={item.id} className="flex justify-between text-sm">
                                  <span>{item.productos?.nombre || 'Producto'}</span>
                                  <span>x{item.cantidad} = ${(item.precio_unitario * item.cantidad).toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm">Sin items</p>
                          )}
                          {pedido.notas && (
                            <p className="mt-2 text-sm text-gray-600"><strong>Notas:</strong> {pedido.notas}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {pedidosFiltrados.length === 0 && (
            <div className="p-8 text-center text-gray-500">No hay pedidos que coincidan con los filtros</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminPedidos() {
  return (
    <ProtectedRoute>
      <AdminPedidosContent />
    </ProtectedRoute>
  );
}
