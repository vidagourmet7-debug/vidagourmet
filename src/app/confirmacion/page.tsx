'use client';

export default function Confirmacion() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-4 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Pedido enviado!</h1>
        <p className="text-gray-600 mb-6">
          Tu pedido fue enviado por WhatsApp. Te contactaremos pronto para confirmar la entrega.
        </p>
        <a
          href="/"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
        >
          Volver a la tienda
        </a>
      </div>
    </div>
  );
}
