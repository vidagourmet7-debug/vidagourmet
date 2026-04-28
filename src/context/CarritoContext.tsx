'use client';

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Producto, OpcionMenuSemanal, CarritoItem, CarritoOpcion, CarritoItemCompleto } from '@/types';
import { PRECIO_MENU_PROTEICO, calcularPrecioUnitarioSemanal, calcularEnvio } from '@/lib/pricing';

type CarritoState = CarritoItemCompleto[];

type CarritoAction =
  | { type: 'AGREGAR_PRODUCTO'; producto: Producto; cantidad?: number }
  | { type: 'QUITAR_PRODUCTO'; productoId: string }
  | { type: 'ACTUALIZAR_CANTIDAD_PRODUCTO'; productoId: string; cantidad: number }
  | { type: 'AGREGAR_OPCION'; opcion: OpcionMenuSemanal; cantidad?: number }
  | { type: 'QUITAR_OPCION'; opcionId: string }
  | { type: 'ACTUALIZAR_CANTIDAD_OPCION'; opcionId: string; cantidad: number }
  | { type: 'VACIAR' }
  | { type: 'CARGAR'; items: CarritoItemCompleto[] };

const STORAGE_KEY = 'vidagourmet_carrito';

function carritoReducer(state: CarritoState, action: CarritoAction): CarritoState {
  switch (action.type) {
    case 'AGREGAR_PRODUCTO': {
      const existente = state.find(
        item => 'producto' in item && item.producto.id === action.producto.id
      );
      if (existente && 'producto' in existente) {
        return state.map(item =>
          'producto' in item && item.producto.id === action.producto.id
            ? { ...item, cantidad: item.cantidad + (action.cantidad || 1) }
            : item
        );
      }
      return [...state, { producto: action.producto, cantidad: action.cantidad || 1 } as CarritoItem];
    }
    case 'QUITAR_PRODUCTO':
      return state.filter(item => 'opcion' in item || item.producto.id !== action.productoId);
    case 'ACTUALIZAR_CANTIDAD_PRODUCTO':
      return state.map(item =>
        'producto' in item && item.producto.id === action.productoId
          ? { ...item, cantidad: action.cantidad }
          : item
      );
    case 'AGREGAR_OPCION': {
      const existente = state.find(
        item => 'opcion' in item && item.opcion.id === action.opcion.id
      );
      if (existente && 'opcion' in existente) {
        return state.map(item =>
          'opcion' in item && item.opcion.id === action.opcion.id
            ? { ...item, cantidad: item.cantidad + (action.cantidad || 1) }
            : item
        );
      }
      return [...state, { tipo: action.opcion.categoria as 'semanal' | 'proteico', opcion: action.opcion, cantidad: action.cantidad || 1 } as CarritoOpcion];
    }
    case 'QUITAR_OPCION':
      return state.filter(item => !('opcion' in item) || item.opcion.id !== action.opcionId);
    case 'ACTUALIZAR_CANTIDAD_OPCION':
      return state.map(item =>
        'opcion' in item && item.opcion.id === action.opcionId
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

interface CarritoInfo {
  itemsProducto: CarritoItem[];
  opcionesSemanal: CarritoOpcion[];
  opcionesProteico: CarritoOpcion[];
  subtotal: number;
  unidadesSemanal: number;
  precioUnitarioSemanal: number;
  unidadesProteico: number;
  unidadesProductos: number;
  unidadesTotales: number;
  costoEnvio: number;
  total: number;
}

interface CarritoContextType {
  state: CarritoState;
  dispatch: React.Dispatch<CarritoAction>;
  info: CarritoInfo;
}

const CarritoContext = createContext<CarritoContextType | null>(null);

function calcularInfo(state: CarritoState): CarritoInfo {
  const itemsProducto = state.filter((item): item is CarritoItem => 'producto' in item);
  const opcionesSemanal = state.filter((item): item is CarritoOpcion => 'opcion' in item && item.tipo === 'semanal');
  const opcionesProteico = state.filter((item): item is CarritoOpcion => 'opcion' in item && item.tipo === 'proteico');

  const unidadesSemanal = opcionesSemanal.reduce((acc, item) => acc + item.cantidad, 0);
  const unidadesProteico = opcionesProteico.reduce((acc, item) => acc + item.cantidad, 0);
  const unidadesProductos = itemsProducto.reduce((acc, item) => acc + item.cantidad, 0);
  const unidadesTotales = unidadesSemanal + unidadesProteico + unidadesProductos;

  const precioUnitarioSemanal = calcularPrecioUnitarioSemanal(unidadesSemanal);
  const subtotalSemanal = unidadesSemanal * precioUnitarioSemanal;
  const subtotalProteico = unidadesProteico * PRECIO_MENU_PROTEICO;
  const subtotalProductos = itemsProducto.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const subtotal = subtotalSemanal + subtotalProteico + subtotalProductos;

  const costoEnvio = calcularEnvio(unidadesTotales, subtotal);
  const total = subtotal + costoEnvio;

  return {
    itemsProducto,
    opcionesSemanal,
    opcionesProteico,
    subtotal,
    unidadesSemanal,
    precioUnitarioSemanal,
    unidadesProteico,
    unidadesProductos,
    unidadesTotales,
    costoEnvio,
    total,
  };
}

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(carritoReducer, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const items = JSON.parse(stored) as CarritoItemCompleto[];
        dispatch({ type: 'CARGAR', items });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const info = calcularInfo(state);

  return (
    <CarritoContext.Provider value={{ state, dispatch, info }}>
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