'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Producto, Categoria } from '@/types';

type ProductFormProps = {
  producto?: Producto;
  categorias: Categoria[];
  onSave: (data: ProductoFormData) => Promise<void>;
  onClose: () => void;
};

export type ProductoFormData = {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id: string;
  imagen_url: string | null;
  activo: boolean;
  menu_semanal: boolean;
  unidad_venta?: string;
};

export function ProductForm({ producto, categorias, onSave, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: producto?.nombre || '',
    descripcion: producto?.descripcion || '',
    precio: producto?.precio || 0,
    categoria_id: producto?.categoria_id || '',
    imagen_url: producto?.imagen_url || null,
    activo: producto?.activo ?? true,
    menu_semanal: producto?.menu_semanal ?? true,
    unidad_venta: producto?.unidad_venta || 'unidad',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {producto ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                rows={2}
                placeholder="Descripción del producto"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Precio *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.precio}
                onChange={e => setFormData({ ...formData, precio: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Categoría *</label>
              <select
                required
                value={formData.categoria_id}
                onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Unidad de venta</label>
              <select
                value={formData.unidad_venta || 'unidad'}
                onChange={e => setFormData({ ...formData, unidad_venta: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="unidad">Unidad</option>
                <option value="pack x6">Pack x6</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.menu_semanal}
                  onChange={e => setFormData({ ...formData, menu_semanal: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-gray-700">En menú semanal</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-gray-700">Activo</span>
              </label>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Imagen</label>
              {formData.imagen_url && (
                <div className="mb-2">
                  <Image src={formData.imagen_url} alt="Preview" width={128} height={128} className="w-32 h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imagen_url: null })}
                    className="text-red-500 text-sm mt-1 hover:underline"
                  >
                    Quitar imagen
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  // Image upload handled by parent component
                  setUploading(false);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
              {uploading && <p className="text-sm text-gray-500">Subiendo imagen...</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}