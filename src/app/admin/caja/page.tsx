'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Venta, Compra } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function AdminCajaContent() {
  const { signOut, user } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [mostrarFormCompra, setMostrarFormCompra] = useState(false);
  const [nuevaCompra, setNuevaCompra] = useState({ descripcion: '', monto: '', fecha: new Date().toISOString().split('T')[0] });
  const [guardandoCompra, setGuardandoCompra] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const client = supabase();
    const [ventasRes, comprasRes] = await Promise.all([
      client.from('ventas').select('*').order('fecha', { ascending: false }),
      client.from('compras').select('*').order('fecha', { ascending: false }),
    ]);

    if (ventasRes.data) setVentas(ventasRes.data);
    if (comprasRes.data) setCompras(comprasRes.data);
    setLoading(false);
  }

  const guardarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoCompra(true);

    const client = supabase();
    const { data, error } = await client
      .from('compras')
      .insert({
        descripcion: nuevaCompra.descripcion,
        monto: parseFloat(nuevaCompra.monto),
        fecha: nuevaCompra.fecha,
      })
      .select()
      .single();

    if (!error && data) {
      setCompras([data, ...compras]);
      setNuevaCompra({ descripcion: '', monto: '', fecha: new Date().toISOString().split('T')[0] });
      setMostrarFormCompra(false);
    }
    setGuardandoCompra(false);
  };

  const eliminarCompra = async (id: string) => {
    if (!confirm('¿Eliminar esta compra?')) return;
    const client = supabase();
    await client.from('compras').delete().eq('id', id);
    setCompras(compras.filter(c => c.id !== id));
  };

  const ventasFiltradas = ventas.filter(v => {
    if (filtroFechaDesde && v.fecha < filtroFechaDesde) return false;
    if (filtroFechaHasta && v.fecha > filtroFechaHasta) return false;
    return true;
  });

  const comprasFiltradas = compras.filter(c => {
    if (filtroFechaDesde && c.fecha < filtroFechaDesde) return false;
    if (filtroFechaHasta && c.fecha > filtroFechaHasta) return false;
    return true;
  });

  const totalVentas = ventasFiltradas.reduce((acc, v) => acc + v.monto, 0);
  const totalCompras = comprasFiltradas.reduce((acc, c) => acc + c.monto, 0);
  const balance = totalVentas - totalCompras;

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
              <Link href="/admin/pedidos" className="hover:text-green-400">Pedidos</Link>
              <Link href="/admin/caja" className="text-green-400">Caja</Link>
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Caja</h2>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Total Ventas</div>
            <div className="text-2xl font-bold text-green-600">${totalVentas.toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-1">{ventasFiltradas.length} transacciones</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Total Compras</div>
            <div className="text-2xl font-bold text-red-600">${totalCompras.toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-1">{comprasFiltradas.length} transacciones</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Balance</div>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-1">Ingresos - Gastos</div>
          </div>
        </div>

        {/* Filtros y acciones */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex gap-4 flex-wrap items-center">
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Desde:</label>
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={e => setFiltroFechaDesde(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Hasta:</label>
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={e => setFiltroFechaHasta(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          {(filtroFechaDesde || filtroFechaHasta) && (
            <button
              onClick={() => { setFiltroFechaDesde(''); setFiltroFechaHasta(''); }}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Limpiar
            </button>
          )}
          <button
            onClick={() => setMostrarFormCompra(true)}
            className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Registrar Compra
          </button>
        </div>

        {/* Formulario nueva compra */}
        {mostrarFormCompra && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Nueva Compra</h3>
            <form onSubmit={guardarCompra} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Descripción</label>
                <input
                  type="text"
                  required
                  value={nuevaCompra.descripcion}
                  onChange={e => setNuevaCompra({ ...nuevaCompra, descripcion: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Ej: Compra de ingredientes"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Monto</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={nuevaCompra.monto}
                  onChange={e => setNuevaCompra({ ...nuevaCompra, monto: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={nuevaCompra.fecha}
                  onChange={e => setNuevaCompra({ ...nuevaCompra, fecha: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={guardandoCompra}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {guardandoCompra ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormCompra(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b">
              <h3 className="font-bold text-green-700">Ventas (Ingresos)</h3>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {ventasFiltradas.length > 0 ? (
                ventasFiltradas.map(venta => (
                  <div key={venta.id} className="px-6 py-3 flex justify-between items-center">
                    <div>
                      <div className="text-gray-800 font-medium">${venta.monto.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{venta.fecha}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No hay ventas registradas</div>
              )}
            </div>
          </div>

          {/* Compras */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b">
              <h3 className="font-bold text-red-700">Compras (Gastos)</h3>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {comprasFiltradas.length > 0 ? (
                comprasFiltradas.map(compra => (
                  <div key={compra.id} className="px-6 py-3 flex justify-between items-center">
                    <div>
                      <div className="text-gray-800 font-medium">{compra.descripcion}</div>
                      <div className="text-sm text-gray-500">{compra.fecha}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-red-600">-${compra.monto.toLocaleString()}</span>
                      <button
                        onClick={() => eliminarCompra(compra.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No hay compras registradas</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminCaja() {
  return (
    <ProtectedRoute>
      <AdminCajaContent />
    </ProtectedRoute>
  );
}