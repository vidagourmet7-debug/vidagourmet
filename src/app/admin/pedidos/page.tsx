'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Pedido } from '@/types';

export default function AdminPedidos() {
  const [pedidos] = useState<Pedido[]>([
    { id: '1', cliente_id: '1', estado: 'pendiente', fecha_entrega: '2026-04-21', total: 8700, notas: 'Sin cebolla', created_at: '2026-04-20T10:00:00' },
    { id: '2', cliente_id: '2', estado: 'confirmado', fecha_entrega: '2026-04-22', total: 4500, notas: null, created_at: '2026-04-20T11:00:00' },
    { id: '3', cliente_id: '3', estado: 'entregado', fecha_entrega: '2026-04-20', total: 3200, notas: 'Dejar en portería', created_at: '2026-04-19T15:00:00' },
  ]);

  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('');

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) return false;
    if (filtroFecha && pedido.fecha_entrega !== filtroFecha) return false;
    return true;
  });

  const cambiarEstado = (pedidoId: string, nuevoEstado: Pedido['estado']) => {
    console.log(`Cambiando pedido ${pedidoId} a ${nuevoEstado}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Vida Gourmet - Admin</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin/productos" className="hover:text-green-400">Productos</Link>
              <Link href="/admin/pedidos" className="text-green-400">Pedidos</Link>
            </nav>
          </div>
          <Link href="/" className="text-gray-300 hover:text-white text-sm">Ver tienda</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pedidos</h2>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="entregado">Entregado</option>
            </select>
            <input
              type="date"
              value={filtroFecha}
              onChange={e => setFiltroFecha(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">ID</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Fecha entrega</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Total</th>
                <th className="text-center px-6 py-3 text-gray-600 font-medium">Estado</th>
                <th className="text-right px-6 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pedidosFiltrados.map(pedido => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">#{pedido.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-gray-600">{pedido.fecha_entrega}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">${pedido.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                      pedido.estado === 'confirmado' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {pedido.estado === 'pendiente' && (
                        <button
                          onClick={() => cambiarEstado(pedido.id, 'confirmado')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Confirmar
                        </button>
                      )}
                      {pedido.estado === 'confirmado' && (
                        <button
                          onClick={() => cambiarEstado(pedido.id, 'entregado')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Marcar entregado
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
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
