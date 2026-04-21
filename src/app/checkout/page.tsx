'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCarrito } from '@/context/CarritoContext';

export default function Checkout() {
  const router = useRouter();
  const { state } = useCarrito();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    fechaEntrega: '',
    notas: '',
  });
  const [loading, setLoading] = useState(false);

  const total = state.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const mensaje = `*Nuevo Pedido - Vida Gourmet*%0A%0A` +
      `*Datos del cliente:*%0A` +
      `Nombre: ${formData.nombre}%0A` +
      `Teléfono: ${formData.telefono}%0A` +
      `Dirección: ${formData.direccion}%0A` +
      `Fecha de entrega: ${formData.fechaEntrega}%0A%0A` +
      `*Pedido:*%0A` +
      state.map(item => `- ${item.producto.nombre} x${item.cantidad} = $${(item.producto.precio * item.cantidad).toLocaleString()}`).join('%0A') +
      `%0A%0A*Total: $${total.toLocaleString()}*` +
      (formData.notas ? `%0A%0A*Notas:* ${formData.notas}` : '');

    const telefonoWhatsApp = '5491100000000'; // Replace with Federico's number
    window.open(`https://wa.me/${telefonoWhatsApp}?text=${mensaje}`, '_blank');

    setLoading(false);
    router.push('/confirmacion');
  };

  if (state.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
          <a href="/" className="text-green-600 hover:underline">Volver a la tienda</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Completar Pedido</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Datos de entrega</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Teléfono *</label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tu teléfono (whatsapp)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Dirección de entrega *</label>
                <input
                  type="text"
                  required
                  value={formData.direccion}
                  onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Calle, número, departamento, barrio"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Día de entrega preferido *</label>
                <select
                  required
                  value={formData.fechaEntrega}
                  onChange={e => setFormData({ ...formData, fechaEntrega: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleccionar día</option>
                  <option value="Hoy">Hoy</option>
                  <option value="Mañana">Mañana</option>
                  <option value="Próximo día hábil">Próximo día hábil</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Notas (opcional)</label>
                <textarea
                  value={formData.notas}
                  onChange={e => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Alguna indicación especial para la entrega"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen del pedido</h2>
            <div className="space-y-2">
              {state.map(item => (
                <div key={item.producto.id} className="flex justify-between text-gray-600">
                  <span>{item.producto.nombre} x{item.cantidad}</span>
                  <span>${(item.producto.precio * item.cantidad).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-green-600">${total.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-bold text-lg disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar pedido por WhatsApp'}
          </button>
        </form>
      </main>
    </div>
  );
}
