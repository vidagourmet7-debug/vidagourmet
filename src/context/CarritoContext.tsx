'use client';

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { CarritoItem, Producto } from '@/types';

type CarritoState = CarritoItem[];

type CarritoAction =
  | { type: 'AGREGAR'; producto: Producto; cantidad?: number }
  | { type: 'QUITAR'; productoId: string }
  | { type: 'ACTUALIZAR_CANTIDAD'; productoId: string; cantidad: number }
  | { type: 'VACIAR' }
  | { type: 'CARGAR'; items: CarritoItem[] };

const STORAGE_KEY = 'vidagourmet_carrito';

function carritoReducer(state: CarritoState, action: CarritoAction): CarritoState {
  switch (action.type) {
    case 'AGREGAR': {
      const existente = state.find(item => item.producto.id === action.producto.id);
      if (existente) {
        return state.map(item =>
          item.producto.id === action.producto.id
            ? { ...item, cantidad: item.cantidad + (action.cantidad || 1) }
            : item
        );
      }
      return [...state, { producto: action.producto, cantidad: action.cantidad || 1 }];
    }
    case 'QUITAR':
      return state.filter(item => item.producto.id !== action.productoId);
    case 'ACTUALIZAR_CANTIDAD':
      return state.map(item =>
        item.producto.id === action.productoId
          ? { ...item, cantidad: action.cantidad }
          : item
      );
    case 'VACIAR':
      return [];
    case 'CARGAR':
      return action.items;
    default:
      return state;
  }
}

const CarritoContext = createContext<{
  state: CarritoState;
  dispatch: React.Dispatch<CarritoAction>;
} | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(carritoReducer, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const items = JSON.parse(stored) as CarritoItem[];
        dispatch({ type: 'CARGAR', items });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <CarritoContext.Provider value={{ state, dispatch }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito must be used within CarritoProvider');
  }
  return context;
}
