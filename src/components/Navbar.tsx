'use client';

import Link from 'next/link';
import { useCarrito } from '@/context/CarritoContext';

export default function Navbar() {
  const { state } = useCarrito();

  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">Vida Gourmet</Link>
        <Link
          href="/checkout"
          className="relative bg-green-700 px-4 py-2 rounded-lg hover:bg-green-800 transition"
        >
          Carrito
          {state.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {state.length}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
