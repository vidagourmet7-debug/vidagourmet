'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCarrito } from '@/context/CarritoContext';
import { createClient } from '@/lib/supabase-browser';
import type { Categoria, Producto } from '@/types';

// Inline SVGs for icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#FFB592" stroke="#FFB592" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5F7B46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5F7B46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);
const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5F7B46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="12" x="4" y="6" rx="2"/><path d="M20 10h2l2 4v4h-4"/><path d="M4 18H2v-4"/><path d="M8 18h8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>
);

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useCarrito();
  const supabase = useMemo(() => createClient(), []);

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
  }, [supabase]);

  const productosFiltrados = categoriaSeleccionada
    ? productos.filter(p => p.categoria_id === categoriaSeleccionada)
    : productos;

  const total = state.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-brand-olive text-xl font-bold animate-pulse">Cargando Vida Gourmet...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] overflow-hidden">
      {/* Decorative Background Shape */}
      <div className="absolute top-0 right-0 w-[50%] h-[800px] bg-brand-olive rounded-bl-[200px] -z-0 transform translate-x-12 -translate-y-12"></div>
      
      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center cursor-pointer">
          <Image
            src="/logo.png"
            alt="Vida Gourmet"
            width={112}
            height={112}
            className="h-28 w-auto object-contain scale-125 origin-left"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextSibling) nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden items-center gap-1">
            <span className="text-2xl font-black text-brand-peach tracking-wider">VIDA</span>
            <span className="text-3xl font-cursive text-brand-olive -ml-2 mt-2">Gourmet</span>
          </div>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 font-bold text-gray-900">
          <button className="text-brand-olive">Inicio</button>
          <a href="#menu" className="hover:text-brand-olive transition-colors">Menú</a>
          <button className="hover:text-brand-olive transition-colors">Nosotros</button>
          <button className="hover:text-brand-olive transition-colors">Contacto</button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-brand-olive hover:text-brand-oliveDark transition-colors bg-white rounded-full shadow-sm">
            <SearchIcon />
          </button>
          <button 
            onClick={() => setCarritoAbierto(true)}
            className="p-2 text-brand-olive hover:text-brand-oliveDark transition-colors bg-white rounded-full shadow-sm relative"
          >
            <CartIcon />
            {state.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-peach text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {state.length}
              </span>
            )}
          </button>
          <button className="px-5 py-2 bg-brand-peach text-white font-bold rounded-full hover:bg-[#fa9c73] transition-colors shadow-md">
            Ingresar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-4 py-1 bg-brand-peachLight text-brand-peach font-bold rounded-full text-sm mb-6 shadow-sm">
            ¿Hambre?
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            VEN Y DISFRUTA <br/> CON <span className="text-brand-peach">VIDA</span> <span className="font-cursive text-brand-olive font-normal text-6xl">Gourmet</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-md">
            Elaboración de viandas saludables de primera calidad. Comida rica, sana y delivery directo a tu puerta para que cuidarte sea más fácil.
          </p>
          <div className="flex gap-4">
            <a href="#menu" className="px-8 py-4 bg-brand-olive text-white font-bold rounded-full shadow-lg hover:bg-brand-oliveDark transition-colors shadow-brand-olive/30">
              Pedir Ahora
            </a>
            <button className="px-8 py-4 bg-white text-gray-800 font-bold rounded-full shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              Explorar <span className="text-brand-olive">→</span>
            </button>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="relative flex justify-center">
          <div className="absolute w-[400px] h-[400px] bg-white/20 rounded-full blur-3xl"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/hero_salad.png" 
            alt="Ensalada Saludable" 
            className="w-full max-w-[500px] object-contain drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600&h=600";
            }}
          />
          {/* Floating elements (decorative) */}
          <div className="absolute top-10 right-10 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center p-2 z-20 animate-bounce">
            <span className="text-2xl">🥑</span>
          </div>
          <div className="absolute bottom-10 left-10 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center p-2 z-20 animate-pulse">
            <span className="text-xl">🍅</span>
          </div>
        </div>
      </section>

      {/* Categories & Products */}
      <section id="menu" className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-4">NUESTRO MENÚ</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Selecciona las viandas que más te gusten. Todos los platos están elaborados con ingredientes frescos y pensados para tu bienestar.</p>
        </div>

        {/* Categories */}
        <div className="flex gap-4 flex-wrap justify-center mb-12">
          <button
            onClick={() => setCategoriaSeleccionada(null)}
            className={`px-6 py-2 rounded-full font-bold transition-all shadow-sm ${
              categoriaSeleccionada === null
                ? 'bg-brand-olive text-white shadow-brand-olive/30'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaSeleccionada(cat.id)}
              className={`px-6 py-2 rounded-full font-bold transition-all shadow-sm ${
                categoriaSeleccionada === cat.id
                  ? 'bg-brand-olive text-white shadow-brand-olive/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {productosFiltrados.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay productos disponibles en esta categoría</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-16 pt-8">
            {productosFiltrados.map(producto => (
              <div key={producto.id} className="bg-white rounded-[32px] shadow-xl p-6 relative flex flex-col items-center text-center mt-12 border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
                {/* Circular image sticking out top */}
                <div className="absolute -top-16 w-32 h-32 rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-brand-peachLight/20">
                  {producto.imagen_url ? (
                    <Image
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-peach font-bold">Sin foto</div>
                  )}
                </div>
                
                <div className="mt-16 w-full">
                  <h4 className="font-bold text-xl text-gray-800 mb-2">{producto.nombre}</h4>
                  
                  <div className="flex justify-center gap-1 mb-3">
                    <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{producto.descripcion}</p>
                  
                  <div className="flex items-center justify-between w-full mt-auto">
                    <p className="font-black text-2xl text-gray-900">${producto.precio.toLocaleString()}</p>
                    <button
                      onClick={() => dispatch({ type: 'AGREGAR', producto })}
                      className="bg-brand-olive text-white px-4 py-2 rounded-full hover:bg-brand-oliveDark transition-colors font-bold shadow-md shadow-brand-olive/30 text-sm"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-20 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">¿POR QUÉ ELEGIRNOS?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-16">Nuestros pilares para ofrecerte el mejor servicio en cada pedido que realizas con Vida Gourmet.</p>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-brand-oliveLight/10 rounded-full flex items-center justify-center mb-6">
                <LeafIcon />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comida Saludable</h3>
              <p className="text-gray-500">Recetas diseñadas nutricionalmente para cuidarte sin renunciar al mejor sabor.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-brand-oliveLight/10 rounded-full flex items-center justify-center mb-6">
                <CheckIcon />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Máxima Calidad</h3>
              <p className="text-gray-500">Seleccionamos los ingredientes más frescos todos los días para tus viandas.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-brand-oliveLight/10 rounded-full flex items-center justify-center mb-6">
                <TruckIcon />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Envío a Domicilio</h3>
              <p className="text-gray-500">Recibe tu pedido de forma rápida y segura directo en la puerta de tu casa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Carrito Modal */}
      {carritoAbierto && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-900">Tu Carrito</h3>
                <button
                  onClick={() => setCarritoAbierto(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition"
                >
                  ×
                </button>
              </div>

              {state.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-brand-peachLight/30 text-brand-peach rounded-full flex items-center justify-center mx-auto mb-4">
                    <CartIcon />
                  </div>
                  <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {state.map(item => (
                      <div key={item.producto.id} className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                          {item.producto.imagen_url ? (
                            <Image
                              src={item.producto.imagen_url}
                              alt={item.producto.nombre}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-brand-peachLight/20"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 line-clamp-1">{item.producto.nombre}</p>
                          <p className="text-brand-olive font-bold text-sm">${item.producto.precio.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                          <button
                            onClick={() => dispatch({ type: 'ACTUALIZAR_CANTIDAD', productoId: item.producto.id, cantidad: Math.max(1, item.cantidad - 1) })}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800"
                          >
                            -
                          </button>
                          <span className="font-bold text-sm min-w-[1ch] text-center">{item.cantidad}</span>
                          <button
                            onClick={() => dispatch({ type: 'ACTUALIZAR_CANTIDAD', productoId: item.producto.id, cantidad: item.cantidad + 1 })}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => dispatch({ type: 'QUITAR', productoId: item.producto.id })}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xl mb-6">
                      <span className="font-bold text-gray-500">Total</span>
                      <span className="font-black text-3xl text-gray-900">${total.toLocaleString()}</span>
                    </div>
                    <Link
                      href="/checkout"
                      onClick={() => setCarritoAbierto(false)}
                      className="w-full bg-brand-olive text-white text-center py-4 rounded-full hover:bg-brand-oliveDark transition-colors font-bold shadow-lg shadow-brand-olive/30 block"
                    >
                      Continuar al pedido
                    </Link>
                    <button
                      onClick={() => dispatch({ type: 'VACIAR' })}
                      className="mt-4 w-full text-gray-400 font-medium hover:text-gray-600 py-2 transition-colors"
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
      <footer className="bg-[#1A1A1A] text-white py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="mb-6 inline-block">
              <Image
                src="/logo.png"
                alt="Vida Gourmet"
                width={96}
                height={96}
                className="h-24 w-auto object-contain drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextSibling) nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center gap-1">
                <span className="text-2xl font-black text-brand-peach tracking-wider">VIDA</span>
                <span className="text-3xl font-cursive text-brand-olive -ml-2 mt-2">Gourmet</span>
              </div>
            </div>
            <p className="text-gray-400 max-w-sm text-lg">
              Preparando viandas saludables con amor, para que tú solo te preocupes por disfrutar.
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-gray-400 mb-2">© 2026 Vida Gourmet</p>
            <a href="https://www.instagram.com/vidagourmetok" target="_blank" rel="noopener noreferrer" className="text-brand-peach hover:text-brand-peachLight transition-colors font-bold text-lg inline-block">
              @vidagourmetok
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
