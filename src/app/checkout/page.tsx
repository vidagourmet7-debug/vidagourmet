'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCarrito } from '@/context/CarritoContext';
import { createClient } from '@/lib/supabase-browser';
import { PRECIO_MENU_PROTEICO } from '@/lib/pricing';

export default function Checkout() {
  const router = useRouter();
  const { state, dispatch, info } = useCarrito();
  const supabase = createClient();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    fechaEntrega: '',
    notas: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let clienteId: string;
      const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefono', formData.telefono)
        .maybeSingle();

      if (clienteExistente) {
        clienteId = clienteExistente.id;
      } else {
        const { data: nuevoCliente, error: clienteError } = await supabase
          .from('clientes')
          .insert({
            nombre: formData.nombre,
            telefono: formData.telefono,
            direccion: formData.direccion,
          })
          .select('id')
          .single();

        if (clienteError) throw clienteError;
        clienteId = nuevoCliente.id;
      }

      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          cliente_id: clienteId,
          estado: 'pendiente',
          fecha_entrega: formData.fechaEntrega,
          total: info.total,
          notas: formData.notas || null,
        })
        .select('id')
        .single();

      if (pedidoError) throw pedidoError;

      // Create pedido items for productos
      const productoItems = info.itemsProducto.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
      }));

      // Note: opciones_menu_semanal items would need a different approach
      // For now we store them in notas or create a separate table
      const opcionesTexto = [
        ...info.opcionesSemanal.map(o => `${o.opcion.nombre_opcion} x${o.cantidad} (Menú Semanal $${info.precioUnitarioSemanal}/u)`),
        ...info.opcionesProteico.map(o => `${o.opcion.nombre_opcion} x${o.cantidad} (Menú Proteico $${PRECIO_MENU_PROTEICO}/u)`),
      ].join(', ');

      if (opcionesTexto && !formData.notas) {
        // Update notas with opciones text
        await supabase.from('pedidos').update({ notas: `Menú: ${opcionesTexto}` }).eq('id', pedido.id);
      } else if (opcionesTexto) {
        await supabase.from('pedidos').update({ notas: `${formData.notas}\nMenú: ${opcionesTexto}` }).eq('id', pedido.id);
      }

      if (productoItems.length > 0) {
        const { error: itemsError } = await supabase.from('pedido_items').insert(productoItems);
        if (itemsError) throw itemsError;
      }

      // Create venta
      await supabase.from('ventas').insert({
        pedido_id: pedido.id,
        monto: info.total,
        fecha: new Date().toISOString().split('T')[0],
      });

      // Build WhatsApp message
      let mensaje = `*Nuevo Pedido - Vida Gourmet*%0A%0A` +
        `*Datos del cliente:*%0A` +
        `Nombre: ${formData.nombre}%0A` +
        `Teléfono: ${formData.telefono}%0A` +
        `Dirección: ${formData.direccion}%0A` +
        `Fecha de entrega: ${formData.fechaEntrega}%0A%0A` +
        `*Pedido:*%0A`;

      if (info.opcionesSemanal.length > 0) {
        mensaje += `%0A-- MENÚ SEMANAL --%0A`;
        info.opcionesSemanal.forEach(o => {
          mensaje += `- ${o.opcion.nombre_opcion} x${o.cantidad} = $${(info.precioUnitarioSemanal * o.cantidad).toLocaleString()})%0A`;
        });
      }

      if (info.opcionesProteico.length > 0) {
        mensaje += `%0A-- MENÚ PROTEICO --%0A`;
        info.opcionesProteico.forEach(o => {
          mensaje += `- ${o.opcion.nombre_opcion} x${o.cantidad} = $${(PRECIO_MENU_PROTEICO * o.cantidad).toLocaleString()})%0A`;
        });
      }

      if (info.itemsProducto.length > 0) {
        mensaje += `%0A-- PRODUCTOS --%0A`;
        info.itemsProducto.forEach(item => {
          mensaje += `- ${item.producto.nombre} x${item.cantidad} = $${(item.producto.precio * item.cantidad).toLocaleString()}`;
          if (item.producto.unidad_venta === 'pack x6') mensaje += ` (pack x6)`;
          mensaje += `%0A`;
        });
      }

      mensaje += `%0A*Subtotal: $${info.subtotal.toLocaleString()}*%0A`;
      mensaje += `*Envío: ${info.costoEnvio === 0 ? 'Gratis' : `$${info.costoEnvio.toLocaleString()}`}*%0A`;
      mensaje += `*TOTAL: $${info.total.toLocaleString()}*`;

      if (formData.notas) mensaje += `%0A%0A*Notas:* ${formData.notas}`;

      const telefonoWhatsApp = '5491163052490';
      window.open(`https://wa.me/${telefonoWhatsApp}?text=${mensaje}`, '_blank');

      dispatch({ type: 'VACIAR' });
      router.push('/confirmacion');
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      setLoading(false);
    }
  };

  if (info.unidadesTotales === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
          <Link href="/" className="text-green-600 hover:underline">Volver a la tienda</Link>
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
                <input type="text" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Teléfono *</label>
                <input type="tel" required value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tu teléfono (whatsapp)" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Dirección de entrega *</label>
                <input type="text" required value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Calle, número, departamento, barrio" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Día de entrega preferido *</label>
                <select required value={formData.fechaEntrega} onChange={e => setFormData({ ...formData, fechaEntrega: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Seleccionar día</option>
                  <option value="Hoy">Hoy</option>
                  <option value="Mañana">Mañana</option>
                  <option value="Próximo día hábil">Próximo día hábil</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Notas (opcional)</label>
                <textarea value={formData.notas} onChange={e => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3} placeholder="Alguna indicación especial para la entrega" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen del pedido</h2>

            {info.opcionesSemanal.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-500 mb-2">MENÚ SEMANAL</h3>
                {info.opcionesSemanal.map(item => (
                  <div key={item.opcion.id} className="flex justify-between text-gray-600 py-1">
                    <span>{item.opcion.nombre_opcion} x{item.cantidad} (${info.precioUnitarioSemanal}/u)</span>
                    <span>${(info.precioUnitarioSemanal * item.cantidad).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {info.opcionesProteico.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-500 mb-2">MENÚ PROTEICO</h3>
                {info.opcionesProteico.map(item => (
                  <div key={item.opcion.id} className="flex justify-between text-gray-600 py-1">
                    <span>{item.opcion.nombre_opcion} x{item.cantidad} (${PRECIO_MENU_PROTEICO}/u)</span>
                    <span>${(PRECIO_MENU_PROTEICO * item.cantidad).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {info.itemsProducto.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-500 mb-2">PRODUCTOS</h3>
                {info.itemsProducto.map(item => (
                  <div key={item.producto.id} className="flex justify-between text-gray-600 py-1">
                    <span>
                      {item.producto.nombre} x{item.cantidad}
                      {item.producto.unidad_venta === 'pack x6' && ' (pack x6)'}
                    </span>
                    <span>${(item.producto.precio * item.cantidad).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal ({info.unidadesTotales} unidades)</span>
                <span>${info.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío</span>
                <span className={info.costoEnvio === 0 ? 'text-green-600 font-bold' : ''}>
                  {info.costoEnvio === 0 ? 'Gratis' : `$${info.costoEnvio.toLocaleString()}`}
                </span>
              </div>
              {info.costoEnvio > 0 && (
                <p className="text-xs text-gray-400">
                  Envío gratis con 14+ unidades o $105.000+ de pedido
                </p>
              )}
              <div className="pt-2 border-t flex justify-between items-center">
                <span className="text-xl font-bold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-green-600">${info.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-bold text-lg disabled:opacity-50">
            {loading ? 'Enviando...' : 'Enviar pedido por WhatsApp'}
          </button>
        </form>
      </main>
    </div>
  );
}