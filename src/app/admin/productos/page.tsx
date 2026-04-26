'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Producto, Categoria } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProductForm, type ProductoFormData } from '@/components/ProductForm';

function AdminProductosContent() {
  const { signOut, user } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProducto, setEditProducto] = useState<Producto | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const client = supabase();
    const [productosRes, categoriasRes] = await Promise.all([
      client.from('productos').select('*').order('nombre'),
      client.from('categorias').select('*').order('nombre'),
    ]);

    if (productosRes.data) setProductos(productosRes.data);
    if (categoriasRes.data) setCategorias(categoriasRes.data);
    setLoading(false);
  }

  const handleSave = async (data: ProductoFormData) => {
    const client = supabase();

    if (editProducto) {
      const { error } = await client
        .from('productos')
        .update({
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          categoria_id: data.categoria_id,
          activo: data.activo,
          menu_semanal: data.menu_semanal,
        })
        .eq('id', editProducto.id);

      if (!error) {
        setProductos(productos.map(p =>
          p.id === editProducto.id ? { ...p, ...data } : p
        ));
      }
    } else {
      const { data: newProducto, error } = await client
        .from('productos')
        .insert({
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          categoria_id: data.categoria_id,
          activo: data.activo,
          menu_semanal: data.menu_semanal,
        })
        .select()
        .single();

      if (!error && newProducto) {
        setProductos([...productos, newProducto]);
      }
    }

    setShowForm(false);
    setEditProducto(null);
  };

  const handleEdit = (producto: Producto) => {
    setEditProducto(producto);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditProducto(null);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditProducto(null);
  };

  const eliminarProducto = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    const client = supabase();
    await client.from('productos').delete().eq('id', id);
    setProductos(productos.filter(p => p.id !== id));
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Vida Gourmet - Admin</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin/productos" className="text-green-400">Productos</Link>
              <Link href="/admin/pedidos" className="hover:text-green-400">Pedidos</Link>
              <Link href="/admin/caja" className="hover:text-green-400">Caja</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">{user?.email}</span>
            <button onClick={signOut} className="text-gray-300 hover:text-white text-sm">Cerrar sesión</button>
            <Link href="/" className="text-gray-300 hover:text-white text-sm">Ver tienda</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
          <button
            onClick={handleNew}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            + Nuevo producto
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Producto</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Categoría</th>
                <th className="text-left px-6 py-3 text-gray-600 font-medium">Precio</th>
                <th className="text-center px-6 py-3 text-gray-600 font-medium">Menú semanal</th>
                <th className="text-center px-6 py-3 text-gray-600 font-medium">Activo</th>
                <th className="text-right px-6 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {productos.map(producto => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{producto.nombre}</div>
                    <div className="text-sm text-gray-500">{producto.descripcion}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {categorias.find(c => c.id === producto.categoria_id)?.nombre}
                  </td>
                  <td className="px-6 py-4 text-gray-600">${producto.precio.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${producto.menu_semanal ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {producto.menu_semanal ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${producto.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(producto)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Editar
                    </button>
                    <button onClick={() => eliminarProducto(producto.id)} className="text-red-600 hover:text-red-800">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productos.length === 0 && (
            <div className="p-8 text-center text-gray-500">No hay productos</div>
          )}
        </div>
      </main>

      {showForm && (
        <ProductForm
          producto={editProducto || undefined}
          categorias={categorias}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

export default function AdminProductos() {
  return (
    <ProtectedRoute>
      <AdminProductosContent />
    </ProtectedRoute>
  );
}