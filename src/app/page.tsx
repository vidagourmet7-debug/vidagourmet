'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCarrito } from '@/context/CarritoContext';
import { createClient } from '@/lib/supabase-browser';
import type { Categoria, Producto } from '@/types';

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useCarrito();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const [categoriasRes, productosRes] = await Promise.all([
        supabase.from('categorias').select('*').eq('activo', true),
        supabase.from('productos').select('*').eq('activo', true).eq('menu_semanal', true),
      ]);

      if (categoriasRes.data) setCategorias(categoriasRes.data);
      if (productosRes.data) setProductos(productosRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const productosFiltrados = categoriaSeleccionada
    ? productos.filter(p => p.categoria_id === categoriaSeleccionada)
    : productos;

  const total = state.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-green-600 text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Vida Gourmet</h1>
          <button
            onClick={() => setCarritoAbierto(true)}
            className="relative bg-green-700 px-4 py-2 rounded-lg hover:bg-green-800 transition"
          >
            Carrito
            {state.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {state.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-green-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Viandas Saludables a Domicilio</h2>
          <p className="text-xl text-green-100">Comida rica, sana y delivery gratis en zona sur</p>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Categorías</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setCategoriaSeleccionada(null)}
            className={`px-6 py-3 rounded-full font-medium transition ${
              categoriaSeleccionada === null
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaSeleccionada(cat.id)}
              className={`px-6 py-3 rounded-full font-medium transition ${
                categoriaSeleccionada === cat.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </section>

      {/* Productos */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Menú de la Semana</h3>
        {productosFiltrados.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay productos disponibles</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map(producto => (
              <div key={producto.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                {producto.imagen_url ? (
                  <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-48 object-cover" />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
                )}
                <div className="p-4">
                  <h4 className="font-bold text-lg text-gray-800">{producto.nombre}</h4>
                  <p className="text-gray-600 text-sm mt-1">{producto.descripcion}</p>
                  <p className="text-green-600 font-bold text-xl mt-3">${producto.precio.toLocaleString()}</p>
                  <button
                    onClick={() => dispatch({ type: 'AGREGAR', producto })}
                    className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Carrito Modal */}
      {carritoAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Tu Carrito</h3>
                <button
                  onClick={() => setCarritoAbierto(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {state.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Tu carrito está vacío</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {state.map(item => (
                      <div key={item.producto.id} className="flex justify-between items-center border-b pb-4">
                        <div>
                          <p className="font-medium text-gray-800">{item.producto.nombre}</p>
                          <p className="text-gray-500 text-sm">${item.producto.precio.toLocaleString()} x {item.cantidad}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => dispatch({ type: 'ACTUALIZAR_CANTIDAD', productoId: item.producto.id, cantidad: Math.max(1, item.cantidad - 1) })}
                            className="bg-gray-200 px-2 py-1 rounded"
                          >
                            -
                          </button>
                          <span>{item.cantidad}</span>
                          <button
                            onClick={() => dispatch({ type: 'ACTUALIZAR_CANTIDAD', productoId: item.producto.id, cantidad: item.cantidad + 1 })}
                            className="bg-gray-200 px-2 py-1 rounded"
                          >
                            +
                          </button>
                          <button
                            onClick={() => dispatch({ type: 'QUITAR', productoId: item.producto.id })}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">${total.toLocaleString()}</span>
                    </div>
                    <Link
                      href="/checkout"
                      onClick={() => setCarritoAbierto(false)}
                      className="mt-4 block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition font-bold"
                    >
                      Continuar al pedido
                    </Link>
                    <button
                      onClick={() => dispatch({ type: 'VACIAR' })}
                      className="mt-3 w-full text-gray-500 hover:text-gray-700 py-2"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2026 Vida Gourmet - Viandas Saludables</p>
          <a href="https://www.instagram.com/vidagourmetok" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline mt-2 inline-block">
            @vidagourmetok
          </a>
        </div>
      </footer>
    </div>
  );
}
