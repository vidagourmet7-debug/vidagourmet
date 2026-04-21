'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Producto, Categoria } from '@/types';

export default function AdminProductos() {
  const [productos] = useState<Producto[]>([
    { id: '1', categoria_id: '1', nombre: 'Vianda Proteica', descripcion: 'Pollo, arroz integral y verduras', precio: 4500, imagen_url: null, activo: true, menu_semanal: true, created_at: '' },
    { id: '2', categoria_id: '1', nombre: 'Vianda Vegetariana', descripcion: 'Tofu, quinoa y vegetales', precio: 4200, imagen_url: null, activo: true, menu_semanal: true, created_at: '' },
    { id: '3', categoria_id: '2', nombre: 'Ensalada César', descripcion: 'Lechuga, croutons, pollo', precio: 3200, imagen_url: null, activo: true, menu_semanal: true, created_at: '' },
  ]);

  const [categorias] = useState<Categoria[]>([
    { id: '1', nombre: 'Viandas', descripcion: '', imagen_url: null, activo: true, created_at: '' },
    { id: '2', nombre: 'Ensaladas', descripcion: '', imagen_url: null, activo: true, created_at: '' },
    { id: '3', nombre: 'Snacks', descripcion: '', imagen_url: null, activo: true, created_at: '' },
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Vida Gourmet - Admin</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin/productos" className="text-green-400">Productos</Link>
              <Link href="/admin/pedidos" className="hover:text-green-400">Pedidos</Link>
            </nav>
          </div>
          <Link href="/" className="text-gray-300 hover:text-white text-sm">Ver tienda</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
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
                    <button className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                    <button className="text-red-600 hover:text-red-800">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
