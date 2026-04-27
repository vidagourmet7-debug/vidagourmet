'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Producto, Categoria, OpcionMenuSemanal } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProductForm, type ProductoFormData } from '@/components/ProductForm';

function AdminProductosContent() {
  const { signOut, user } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [opcionesMenu, setOpcionesMenu] = useState<OpcionMenuSemanal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProducto, setEditProducto] = useState<Producto | null>(null);
  const [showOpcionForm, setShowOpcionForm] = useState(false);
  const [editOpcion, setEditOpcion] = useState<OpcionMenuSemanal | null>(null);
  const [activeTab, setActiveTab] = useState<'productos' | 'opciones'>('productos');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const client = supabase();
    const [productosRes, categoriasRes, opcionesRes] = await Promise.all([
      client.from('productos').select('*').order('nombre'),
      client.from('categorias').select('*').order('nombre'),
      client.from('opciones_menu_semanal').select('*').order('semana', { ascending: false }),
    ]);

    if (productosRes.data) setProductos(productosRes.data);
    if (categoriasRes.data) setCategorias(categoriasRes.data);
    if (opcionesRes.data) setOpcionesMenu(opcionesRes.data);
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
          unidad_venta: data.unidad_venta || 'unidad',
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
          unidad_venta: data.unidad_venta || 'unidad',
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

  // Opciones menu semanal handlers
  const handleNewOpcion = () => {
    setEditOpcion(null);
    setShowOpcionForm(true);
  };

  const handleEditOpcion = (opcion: OpcionMenuSemanal) => {
    setEditOpcion(opcion);
    setShowOpcionForm(true);
  };

  const handleCloseOpcion = () => {
    setShowOpcionForm(false);
    setEditOpcion(null);
  };

  const handleSaveOpcion = async (data: { semana: string; categoria: 'semanal' | 'proteico'; nombre_opcion: string; descripcion: string; activo: boolean }) => {
    const client = supabase();

    if (editOpcion) {
      const { error } = await client
        .from('opciones_menu_semanal')
        .update(data)
        .eq('id', editOpcion.id);

      if (!error) {
        setOpcionesMenu(opcionesMenu.map(o =>
          o.id === editOpcion.id ? { ...o, ...data } : o
        ));
      }
    } else {
      const { data: newOpcion, error } = await client
        .from('opciones_menu_semanal')
        .insert(data)
        .select()
        .single();

      if (!error && newOpcion) {
        setOpcionesMenu([newOpcion, ...opcionesMenu]);
      }
    }

    setShowOpcionForm(false);
    setEditOpcion(null);
  };

  const eliminarOpcion = async (id: string) => {
    if (!confirm('¿Eliminar esta opción?')) return;
    const client = supabase();
    await client.from('opciones_menu_semanal').delete().eq('id', id);
    setOpcionesMenu(opcionesMenu.filter(o => o.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  const opcionesSemanal = opcionesMenu.filter(o => o.categoria === 'semanal');
  const opcionesProteico = opcionesMenu.filter(o => o.categoria === 'proteico');

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
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('productos')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'productos' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            Productos (Tartas, Pizzas, Canastitas)
          </button>
          <button onClick={() => setActiveTab('opciones')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'opciones' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            Opciones Menú (Semanal y Proteico)
          </button>
        </div>

        {activeTab === 'productos' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
              <button onClick={handleNew}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
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
                    <th className="text-left px-6 py-3 text-gray-600 font-medium">Unidad</th>
                    <th className="text-center px-6 py-3 text-gray-600 font-medium">Activo</th>
                    <th className="text-right px-6 py-3 text-gray-600 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {productos.map(producto => {
                    const cat = categorias.find(c => c.id === producto.categoria_id);
                    const isMenuOption = cat?.nombre === 'Menú Semanal' || cat?.nombre === 'Menú Proteico';
                    if (isMenuOption) return null;
                    return (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">{producto.nombre}</div>
                          <div className="text-sm text-gray-500">{producto.descripcion}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{cat?.nombre}</td>
                        <td className="px-6 py-4 text-gray-600">${producto.precio.toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-600">{producto.unidad_venta || 'unidad'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${producto.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {producto.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(producto)} className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                          <button onClick={() => eliminarProducto(producto.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {productos.filter(p => {
                const cat = categorias.find(c => c.id === p.categoria_id);
                return cat?.nombre !== 'Menú Semanal' && cat?.nombre !== 'Menú Proteico';
              }).length === 0 && (
                <div className="p-8 text-center text-gray-500">No hay productos</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'opciones' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Opciones de Menú Semanal</h2>
              <button onClick={handleNewOpcion}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                + Nueva opción
              </button>
            </div>

            {/* Menu Semanal */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Menú Semanal</h3>
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-green-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-green-700 font-medium">Opción</th>
                      <th className="text-left px-6 py-3 text-green-700 font-medium">Descripción</th>
                      <th className="text-left px-6 py-3 text-green-700 font-medium">Semana</th>
                      <th className="text-center px-6 py-3 text-green-700 font-medium">Activo</th>
                      <th className="text-right px-6 py-3 text-green-700 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {opcionesSemanal.map(opcion => (
                      <tr key={opcion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{opcion.nombre_opcion}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{opcion.descripcion}</td>
                        <td className="px-6 py-4 text-gray-600">{opcion.semana}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${opcion.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {opcion.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEditOpcion(opcion)} className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                          <button onClick={() => eliminarOpcion(opcion.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {opcionesSemanal.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No hay opciones de menú semanal</div>
                )}
              </div>
            </div>

            {/* Menu Proteico */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4">Menú Proteico</h3>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-orange-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-orange-700 font-medium">Opción</th>
                      <th className="text-left px-6 py-3 text-orange-700 font-medium">Descripción</th>
                      <th className="text-left px-6 py-3 text-orange-700 font-medium">Semana</th>
                      <th className="text-center px-6 py-3 text-orange-700 font-medium">Activo</th>
                      <th className="text-right px-6 py-3 text-orange-700 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {opcionesProteico.map(opcion => (
                      <tr key={opcion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{opcion.nombre_opcion}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{opcion.descripcion}</td>
                        <td className="px-6 py-4 text-gray-600">{opcion.semana}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${opcion.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {opcion.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEditOpcion(opcion)} className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                          <button onClick={() => eliminarOpcion(opcion.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {opcionesProteico.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No hay opciones de menú proteico</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {showForm && (
        <ProductForm
          producto={editProducto || undefined}
          categorias={categorias.filter(c => c.nombre !== 'Menú Semanal' && c.nombre !== 'Menú Proteico')}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}

      {showOpcionForm && (
        <OpcionMenuForm
          opcion={editOpcion || undefined}
          onSave={handleSaveOpcion}
          onClose={handleCloseOpcion}
        />
      )}
    </div>
  );
}

function OpcionMenuForm({ opcion, onSave, onClose }: {
  opcion?: OpcionMenuSemanal;
  onSave: (data: { semana: string; categoria: 'semanal' | 'proteico'; nombre_opcion: string; descripcion: string; activo: boolean }) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    semana: opcion?.semana || new Date().toISOString().split('T')[0],
    categoria: opcion?.categoria || 'semanal',
    nombre_opcion: opcion?.nombre_opcion || '',
    descripcion: opcion?.descripcion || '',
    activo: opcion?.activo ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          {opcion ? 'Editar Opción de Menú' : 'Nueva Opción de Menú'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Semana (fecha de inicio)</label>
            <input type="date" required value={formData.semana} onChange={e => setFormData({ ...formData, semana: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Categoría</label>
            <select required value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value as 'semanal' | 'proteico' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="semanal">Menú Semanal</option>
              <option value="proteico">Menú Proteico</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nombre de la opción</label>
            <input type="text" required value={formData.nombre_opcion} onChange={e => setFormData({ ...formData, nombre_opcion: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: Pollo al pesto con arroz integral" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Descripción</label>
            <textarea value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3} placeholder="Descripción de los ingredientes..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="activo" checked={formData.activo} onChange={e => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-green-600 rounded" />
            <label htmlFor="activo" className="text-gray-700">Activo</label>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
              {opcion ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
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